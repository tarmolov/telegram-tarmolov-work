import {CloudFunctionResponse} from "../types";

export function sanitizeTrackerMarkdown(input: string) {
    // remove all images from markdown markup like the following:
    // ![image.png](/ajax/v2/attachments/14?inline=true =x400)
    return input.replace(/\s*!\[[^\]]+\]\([^)]+\)\s*\n?\s*/g, '');
}

export function formatCloudFunctionResponse(body: unknown) {
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'isBase64Encoded': false,
        'body': body
    } as CloudFunctionResponse;
}
