import * as dotenv from 'dotenv'
dotenv.config()
import {trackerHandler, TrackerHandlerEvent} from './handlers/tracker.js';
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
        const eventName = event.headers['X-TARMOLOV-WORK-EVENT'];
        switch (eventName) {
            case 'BLOG_POST':
                handlerResponse = await trackerHandler(event as unknown as TrackerHandlerEvent);
                break;

            default:
                throw new Error(`Unsupported event name: ${eventName}`);
        }
    } catch (e: unknown) {
        logger.error(`ERROR: ${e}`);
        handlerResponse = formatCloudFunctionResponse((e as Error).message);
    }

    return handlerResponse;
}
