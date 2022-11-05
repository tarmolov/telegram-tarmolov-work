import {CloudFunctionResponse} from "../types";

export function transformMarkdown(input: string) {
    // https://core.telegram.org/bots/api#markdownv2-style
    return input
        // remove all images from markdown markup like the following:
        // ![image.png](/ajax/v2/attachments/14?inline=true =x400)
        .replace(/\s*!\[[^\]]+\]\([^)]+\)\s*\n?\s*/g, '')
        .replace(/[*]{2}([^*]+)[*]{2}/g, '<b>$1</b>') // **bold** -> <b>bold</b> (reserve to prevent conflict with italic)
        .replace(/[[]{1}([^\]]+)[\]]{1}[(]{1}([^)"]+)("(.+)")?[)]{1}/g, '<a href="$2" title="$4">$1</a>') // reserve link
        .replace(/[*]{1}([^*]+)[*]{1}/g, '_$1_') // *italic* -> _italic_
        .replace(/(^|\n)_{1}([\s]+)/g, '$1-$2') // _ -> - (list)
        .replace(/(^|\n)\*{1}([\s]+)/g, '$1-$2') // * -> - (list)
        .replace(/<b>(.*)<\/b>/g, '*$1*') // <b>bold</b> -> *bold*
        .replace(/[+]{2}([^+]+)[+]{2}/g, '__$1__') // ++underlined++ -> __underlined__
        .replace(/[~]{2}([^~]+)[~]{2}/g, '~$1~') // ~~strikethrough~~ -> ~strikethrough~
        .replace(/(>|-|\.|#|!|\)|\(|\{|\})/g, '\\$1') // escape reserved entities
        .replace(/<a href="([^"]+)" title=".*"\\>([^<]+)<\/a\\>/g, '[$2]($1)'); // transmofrm html linkt to markdown
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
