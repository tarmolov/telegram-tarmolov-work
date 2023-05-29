import * as dotenv from 'dotenv'
dotenv.config()
import {z} from 'zod';
import {config} from './config.js';
import {CloudFunctionRequest, TrackerEventPayload} from './types.js';
import {trackerHandler} from './handlers/tracker.js';
import {calendarHandler} from './handlers/calendar.js';
import {formatCloudFunctionResponse} from './lib/utils.js';
import {logger} from './lib/logger.js';

const RequestSchema = z.object({
    headers: z.object({
        'X-Tarmolov-Work-Event': z.enum(['BLOG_POST', 'CALENDAR_EVENT']),
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

export type TrackerHandlerEvent = z.infer<typeof RequestSchema> & CloudFunctionRequest;

export async function handler(event: CloudFunctionRequest) {
    logger.debug(`EVENT: ${JSON.stringify(event)}`);

    let handlerResponse;
    // Tracker trigger will repeat request if the previous one is failed
    // So, the cloud function is executed twice or even more times.
    // As a result multiple identical posts will be posted to telegram
    // It's bad! That's why all exceptions are caught there
    try {
        const requestResult = RequestSchema.safeParse(event);

        if (!requestResult.success) {
            const message = requestResult.error.issues
                .map((issue) => `Error with parameter "${issue.path.join('/')}": ${issue.message}`)
                .join('; ');
            throw new Error(message);
        }
        const request = requestResult.data;
        const payload = JSON.parse(request.body) as TrackerEventPayload;
        logger.debug(`PAYLOAD: ${JSON.stringify(payload)}`);

        const eventName = event.headers['X-Tarmolov-Work-Event'];
        switch (eventName) {
            case 'BLOG_POST':
                handlerResponse = await trackerHandler(payload);
                break;

            case 'CALENDAR_EVENT':
                handlerResponse = await calendarHandler(payload);
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
