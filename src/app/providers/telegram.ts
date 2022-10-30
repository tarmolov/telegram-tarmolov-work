process.env['NTBA_FIX_350'] = '1';

import * as fs from 'fs';
import * as url from 'url';
import * as TelegramBot from 'node-telegram-bot-api';

interface TelegramProviderResponse {
    type: string;
    url: string;
}

export class TelegramProvider {
    private readonly _bot;
    private readonly _channelId = process.env.TELEGRAM_CHANNEL_ID!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    private readonly _defaultOptions: {parse_mode: TelegramBot.ParseMode} = {
        parse_mode: 'MarkdownV2'
    };

    constructor() {
        this._bot = new TelegramBot.default(process.env.TELEGRAM_BOT_TOKEN!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    private _formatUrlToMessage(messageId: number) {
        return `https://t.me/c/${this._channelId.slice(4)}/${messageId}`
    }

    async sendTextMessage(text: string, messageId?: number): Promise<TelegramProviderResponse> {
        const response = messageId ?
            await this._bot.editMessageText(text, {
                chat_id: this._channelId,
                message_id: messageId,
                ...this._defaultOptions
            }) :
            await this._bot.sendMessage(this._channelId, text, this._defaultOptions);

        return {
            type: 'text',
            url: this._formatUrlToMessage((response as TelegramBot.Message).message_id)
        };
    }

    async sendPhotoWithTextMessage(filePath: string, caption?: string, messageId?: number): Promise<TelegramProviderResponse> {
        let response;
        if (messageId) {
            response = await this._bot.editMessageMedia(
                {
                    type: 'photo',
                    media: 'attach://' + filePath,
                    caption: caption,
                    ...this._defaultOptions
                },
                {
                    chat_id: this._channelId,
                    message_id: messageId
                }
            );
        } else {
            const inputFile = fs.createReadStream(filePath);
            response = await this._bot.sendPhoto(
                this._channelId,
                inputFile,
                {
                    caption: caption,
                    ...this._defaultOptions
                },
                {}
            );
        }

        return {
            type: 'photo',
            url: this._formatUrlToMessage((response as TelegramBot.Message).message_id)
        }
    }

    static getMessageIdFromUrl(telegramUrl: string): number | undefined {
        const urlPath = url.parse(telegramUrl).pathname;
        if (urlPath) {
            return Number(urlPath.split('/').pop());
        }
    }

    static TEXT_MESSAGE_FULL = `
        *bold*
        __underline__
        ~strikethrough~
        ||spoiler||
        \`test\`
        [inline URL](http://www.example.com/)
        [inline mention of a user](tg://user?id=123456789)
        \`inline fixed-width code\`
        \`\`\`
        pre-formatted fixed-width code block
        \`\`\`
    `;
    static TEXT_MESSAGE_INITIAL = '*Initial message*';
    static TEXT_MESSAGE_EDITED = '__Edited message__';
}
