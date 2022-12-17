import {config} from '../config';
import {TelegramProvider} from '../providers/telegram'
import {CloudFunctionRequest} from '../types';
import {TrackerIssue, TrackerProvider} from '../providers/tracker';
import {formatCloudFunctionResponse, formatIssueDescription} from '../lib/utils';
import {logger} from '../lib/logger';

const trackerProvider = new TrackerProvider();

// Request data for webhook for publishing posts from tracker to telegram
export interface TrackerWebhookEvent extends CloudFunctionRequest {
    headers: {
        'X-Tarmolov-Work-Secret-Key'?: string; // secret key for access webhook
    };
    queryStringParameters: {
        channel_id?: string; // telegram channel ID where posts should be published
        publish_url_field?: 'testing' | 'production'; // link to a published telegram message
        debug?: string; // show debug information
    }
}

export async function trackerWebhook(event: TrackerWebhookEvent) {
    if (event.headers['X-Tarmolov-Work-Secret-Key'] !== config['app.secret']) {
        throw new Error('Access denied');
    }

    const channelId = event.queryStringParameters.channel_id;
    const publishUrlField = event.queryStringParameters.publish_url_field;
    const debug = Boolean(event.queryStringParameters.debug);
    if (!channelId || !publishUrlField) {
        throw new Error('Required parameters channel_id and publish_url_fields are missed');
    }

    const bot = new TelegramProvider({channelId});

    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
    const payload = JSON.parse(body) as TrackerIssue;
    logger.debug(`PAYLOAD: ${JSON.stringify(payload)}`);
    if (!payload.key) {
        throw new Error('No issue key is passed');
    }
    if (!payload.key.startsWith(`${config['tracker.queue']}-`)) {
        throw new Error(`Issue ${payload.key} doesn't belong to ${config['tracker.queue']}`);
    }

    const issue = await trackerProvider.getIssueByKey(payload.key);
    if (!issue.description) {
        throw new Error(`Issue ${issue.key} does not have filled description field`);
    }

    const issueLinks = await trackerProvider.getIssueLinks(payload.key);
    const blockedDeps = issueLinks.filter((link) =>
        link.type.id === 'depends' && link.direction === 'outward' && link.status.key !== 'closed'
    );
    if (blockedDeps.length && publishUrlField === 'production') {
        await trackerProvider.editIssue(payload.key, {
            tags: {add: [config['tracker.tags.error.blockedDeps']]}
        });
        throw new Error(`Issue ${issue.key} has blocked dependencies`);
    }

    const publishUrlFieldKey = config['tracker.fields.prefix'] + publishUrlField;
    const messageId = TelegramProvider.getMessageIdFromUrl(issue[publishUrlFieldKey]?.toString());
    logger.debug(`MESSAGE_ID: ${messageId} (parsed from "${publishUrlFieldKey}" field with "${issue[publishUrlFieldKey]}" value)`);

    const description = formatIssueDescription(issue, debug);
    const issueAttachments = await trackerProvider.getIssueAttachments(payload.key);
    const message = await bot.sendMessage(description, {
        messageId,
        file: issueAttachments.length ?
            await trackerProvider.downloadIssueAttachment(issueAttachments[0]) :
            undefined
    });

    const publishDateTime = new Date(message.date * 1000).toISOString();
    await trackerProvider.editIssue(payload.key, {
        [publishUrlFieldKey]: message.url,
        [`${config['tracker.fields.prefix']}publishDateTime`]: publishDateTime
    });

    return formatCloudFunctionResponse({
        urlToMessage: message.url,
        publishDateTime
    });
}
