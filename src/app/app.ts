import * as dotenv from 'dotenv'
dotenv.config()
import {trackerWebhook} from './handlers/tracker-webhook';
import {CloudFunctionRequest} from './types';
import {formatCloudFunctionResponse} from './lib/utils';

export async function handler(event: CloudFunctionRequest) {
    console.debug(`EVENT: ${JSON.stringify(event)}`);

    let handlerResponse;
    // Tracker trigger will repeat request if the previous one is failed
    // So, the cloud function is executed twice or even more times.
    // As a result multiple identical posts will be posted to telegram
    // It's bad! That's why all exceptions are caught there
    try {
        handlerResponse = await trackerWebhook(event);
    } catch (e: unknown) {
        console.error(`ERROR: ${e}`);
        handlerResponse = formatCloudFunctionResponse((e as Error).message);
    }

    return handlerResponse;
}
