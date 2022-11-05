import {CloudFunctionResponse} from "../types";

export function transformMarkdown(input: string) {
    // https://core.telegram.org/bots/api#markdownv2-style
    return input
        .replace(/\s*!\[[^\]]+\]\([^)]+\)\s*\n?\s*/g, '') // remove all images from markdown markup

        // transofrm main markdown entities to html entities
        .replace(/[*]{2}([^*]+)[*]{2}/g, '<b>$1</b>') // **bold** -> <b>bold</b>
        .replace(/[[]{1}([^\]]+)[\]]{1}[(]{1}([^)"]+)("(.+)")?[)]{1}/g, '<a href="$2">$1</a>') // [text](link) -> <a href="link">text</a>
        .replace(/[*]{1}([^*]+)[*]{1}/g, '<i>$1</i>') // *italic* -> <i>italic</i>
        .replace(/(^|\n)\*{1}/g, '$1</i>') // * -> </i>
        .replace(/[+]{2}([^+]+)[+]{2}/g, '<u>$1</u>') // ++underline++ -> <u>underline</u>
        .replace(/[~]{2}([^~]+)[~]{2}/g, '<del>$1</del>') // ~~strikethrough~~ -> <del>strikethrough</del>

        // In all other places characters
        // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
        // must be escaped with the preceding character '\'.
        .replace(/(_|\*|\[|\]|\(|\)|~|#|\+|-|=|\||\{|\}|\.|!)/g, '\\$1') // escape reserved entities

        // tranform back html entities to markdown entities
        .replace(/<b>(.*)<\/b>/g, '*$1*') // <b>bold</b> -> *bold*
        .replace(/<i>(.*)<\/i>/g, '_$1_') // <i>italic</i> -> _italic_
        .replace(/(<i>|<\/i>)/g, '\\-') // <i> or </i> -> \-
        .replace(/<u>(.*)<\/u>/g, '__$1__') // <u>underline</i> -> __underline__
        .replace(/<del>(.*)<\/del>/g, '~$1~') // <del>strikethrough</del> -> ~strikethrough~
        .replace(/<a href\\="([^"]+)">([^<]+)<\/a>/g, '[$2]($1)') // <a href="link">text</a> -> [text](link)
        .replace(/(>)/g, '\\$1') // escape reserved entities
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
