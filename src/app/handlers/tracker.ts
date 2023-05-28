import {config} from '../config.js';
import {TelegramProvider} from '../providers/telegram.js'
import {TrackerIssue, TrackerProvider} from '../providers/tracker.js';
import {formatCloudFunctionResponse, formatIssueDescription} from '../lib/utils.js';
import {TrackerEventPayload} from '../types.js';
import {logger} from '../lib/logger.js';

const trackerProvider = new TrackerProvider();

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
export async function trackerHandler(payload: TrackerEventPayload) {
    const issue = await getTrackerIssueByKey(payload.key);

    const bot = new TelegramProvider({channelId: config['telegram.channelId']});
    const publishUrlFieldKey = config['tracker.fields.publishUrl'];
    const messageId = TelegramProvider.getMessageIdFromUrl(issue[publishUrlFieldKey]?.toString());
    const description = await formatIssueDescription(issue, {
        debug: config['app.debug'],
        linkExtractor: async (href: string) => {
            const match = href.match(ISSUE_REGEXP);
            // don't replace link to the current issue
            // it's usually used for debug
            const issueKey = match && match[1] !== issue.key && match[1];

            if (issueKey) {
                const linkIssue = await trackerProvider.getIssueByKey(issueKey);
                const telegramPostLink = linkIssue[publishUrlFieldKey];
                const newHref = telegramPostLink ? telegramPostLink.toString(): '';
                logger.debug(`REPLACE LINK: "${href}" to "${newHref}"`);
                return newHref;
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
        await trackerProvider.safeChangeIssueStatus(issue.key, 'closed', {
            resolution: 'fixed'
        });
    }

    return formatCloudFunctionResponse({
        urlToMessage: message.url,
        publishDateTime
    });
}
