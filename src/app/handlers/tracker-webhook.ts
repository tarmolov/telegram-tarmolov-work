import {z} from 'zod';
import {config} from '../config.js';
import {TelegramProvider} from '../providers/telegram.js'
import {CloudFunctionRequest} from '../types.js';
import {TrackerIssue, TrackerProvider} from '../providers/tracker.js';
import {formatCloudFunctionResponse, formatIssueDescription} from '../lib/utils.js';
import {logger} from '../lib/logger.js';

const trackerProvider = new TrackerProvider();

const RequestSchema = z.object({
    headers: z.object({
        'X-Tarmolov-Work-Secret-Key': z.string()
            .refine((secret) => secret === config['app.secret'], {message: 'Access denied'})
    }),
    isBase64Encoded: z.boolean().optional(),
    body: z.string()
})
    .transform((schema, ctx) => {
        schema.body = schema.isBase64Encoded ? Buffer.from(schema.body, 'base64').toString() : schema.body;

        const body = JSON.parse(schema.body);
        if (!body.key) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['body'],
                message: 'No issue key is passed',
              });
        }
        if (!body.key?.startsWith(`${config['tracker.queue']}-`)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['body', 'key'],
                message: `Issue doesn't belong to ${config['tracker.queue']}`,
              });
        }

        return schema;
    });

export type TrackerWebhookEvent = z.infer<typeof RequestSchema> & CloudFunctionRequest;

async function getTrackerIssueByKey(key: string) {
    const issue = await trackerProvider.getIssueByKey(key);
    if (!issue.description) {
        throw new Error(`Issue ${issue.key} does not have filled description field`);
    }

    const issueLinks = await trackerProvider.getIssueLinks(key);
    const blockedDeps = issueLinks.filter((link) =>
        link.type.id === 'depends' && link.direction === 'outward' && link.status.key !== 'closed'
    );
    if (blockedDeps.length && config['tracker.checkIssueDeps']) {
        await trackerProvider.safeChangeIssueStatus(key, 'need_info', {
            comment: `!!Обнаружены блокирующие зависимости.!!
                Невозможно опубликовать пост. Необходимо опубликовать блокирующие посты.`
        });
        throw new Error(`Issue ${issue.key} has blocked dependencies`);
    }

    return issue as TrackerIssue & {key: string};
}

const ISSUE_REGEXP = new RegExp(`^https://tracker.yandex.ru/(${config['tracker.queue']}-\\d+)`);
export async function trackerWebhook(event: TrackerWebhookEvent) {
    const requestResult = RequestSchema.safeParse(event);

    if (!requestResult.success) {
        const message = requestResult.error.issues
            .map((issue) => `Error with parameter "${issue.path.join('/')}": ${issue.message}`)
            .join('; ');
        throw new Error(message);
    }
    const request = requestResult.data;
    const payload = JSON.parse(request.body);
    logger.debug(`PAYLOAD: ${JSON.stringify(payload)}`);
    const issue = await getTrackerIssueByKey(payload.key);

    const bot = new TelegramProvider({channelId: config['telegram.channelId']});
    const publishUrlFieldKey = config['tracker.fields.publishUrl'];
    const messageId = TelegramProvider.getMessageIdFromUrl(issue[publishUrlFieldKey]?.toString());
    const description = await formatIssueDescription(issue, {
        debug: config['app.debug'],
        linkExtractor: async (href: string) => {
            const match = href.match(ISSUE_REGEXP);

            if (match) {
                const issue = await trackerProvider.getIssueByKey(match[1]);
                const telegramPostLink = issue[publishUrlFieldKey];
                return telegramPostLink ? telegramPostLink.toString(): '';
            }

            return href;
        }
    });
    const file = await trackerProvider.downloadFirstIssueAttachment(issue.key)
    const message = await bot.sendMessage(description, {messageId, file});

    const publishDateTime = new Date(message.date * 1000).toISOString();
    await trackerProvider.editIssue(issue.key, {
        [publishUrlFieldKey]: message.url,
        [config['tracker.fields.publisDateTime']]: publishDateTime
    });

    if (config['tracker.closeIssueAfterPublishing']) {
        await trackerProvider.safeChangeIssueStatus(issue.key, 'closed');
    }

    return formatCloudFunctionResponse({
        urlToMessage: message.url,
        publishDateTime
    });
}
