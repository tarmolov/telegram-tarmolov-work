import * as dotenv from 'dotenv'
dotenv.config()
import {trackerWebhook, TrackerWebhookEvent} from './handlers/tracker-webhook.js';
import {CloudFunctionRequest} from './types.js';
import {formatCloudFunctionResponse} from './lib/utils.js';
import {logger} from './lib/logger.js';

export async function handler(event: CloudFunctionRequest) {
    logger.debug(`EVENT: ${JSON.stringify(event)}`);

    let handlerResponse;
    // Tracker trigger will repeat request if the previous one is failed
    // So, the cloud function is executed twice or even more times.
    // As a result multiple identical posts will be posted to telegram
    // It's bad! That's why all exceptions are caught there
    try {
        handlerResponse = await trackerWebhook(event as unknown as TrackerWebhookEvent);
    } catch (e: unknown) {
        logger.error(`ERROR: ${e}`);
        handlerResponse = formatCloudFunctionResponse((e as Error).message);
    }

    return handlerResponse;
}
