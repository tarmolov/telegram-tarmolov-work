import {config} from '../config';
import {TelegramProvider} from '../providers/telegram'
import {CloudFunctionRequest, CloudFunctionResponse} from '../types';
import {TrackerIssue, TrackerProvider} from '../providers/tracker';

const trackerProvider = new TrackerProvider();

// Webhook for publishing posts from tracker to telegram
// Query parameters:
// channel_id — Telegram channel ID where posts should be published
// publish_url_field — Link to a published telegram message
export async function trackerWebhook(event: CloudFunctionRequest) {
    const channelId = event.queryStringParameters.channel_id;
    const publishUrlField = event.queryStringParameters.publish_url_field;

    if (!channelId || !publishUrlField) {
        throw new Error('Required parameters channel_id and publish_url_fields are missed');
    }
    const bot = new TelegramProvider({channelId: channelId});

    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
    const payload = JSON.parse(body) as TrackerIssue;
    console.debug(`PAYLOAD: ${JSON.stringify(payload)}`);

    if (!payload.key) {
        throw new Error('No issue key is passed');
    }

    if (!payload.key.startsWith(`${config['tracker.queue']}-`)) {
        throw new Error(`Issue ${payload.key} doesn't belong to ${config['tracker.queue']}`);
    }

    const issue = await trackerProvider.getIssueByKey(payload.key);
    console.debug(`ISSUE: ${JSON.stringify(issue)}`);

    if (!issue.description) {
        throw new Error(`Issue ${issue.key} does not have filled description field`);
    }

    const fieldKey = config['tracker.fields.prefix'] + publishUrlField;
    const messageId = TelegramProvider.getMessageIdFromUrl(issue[fieldKey]);
    console.debug(`MESSAGE_ID: ${messageId} (parsed from "${fieldKey}" field with "${issue[fieldKey]}" value`);

    const message = await bot.sendTextMessage(issue.description, messageId);
    console.debug(`MESSAGE: ${JSON.stringify(message)}`);

    const publishDateTime = new Date(message.date * 1000).toISOString();
    const issueEdited = await trackerProvider.editIssue(payload.key, {
        [fieldKey]: message.url,
        [`${config['tracker.fields.prefix']}publishDateTime`]: publishDateTime
    });
    console.debug(`ISSUE EDITED: ${JSON.stringify(issueEdited)}`);

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'isBase64Encoded': false,
        'body': {
            urlToMessage: message.url,
            publishDateTime
        }
    } as CloudFunctionResponse;
}
