process.env['NTBA_FIX_350'] = '1';

import * as fs from 'fs';
import * as url from 'url';
import * as TelegramBot from 'node-telegram-bot-api';
import {config} from '../config';

interface TelegramProviderResponse {
    type: string;
    url: string;
    date: number; // timestamp
}

interface TelegramProviderOptions {
    channelId: string;
}

export class TelegramProvider {
    private readonly _bot;
    private readonly _channelId;
    private readonly _defaultOptions: {parse_mode: TelegramBot.ParseMode} = {
        parse_mode: 'MarkdownV2'
    };

    constructor(options: TelegramProviderOptions) {
        this._channelId = options.channelId;
        this._bot = new TelegramBot.default(config['telegram.botToken']);
    }

    private _formatToMessageUrl(messageId: number) {
        return `https://t.me/c/${this._channelId.slice(4)}/${messageId}`
    }

    async sendTextMessage(text: string, messageId?: number): Promise<TelegramProviderResponse> {
        const response = messageId ?
            await this._bot.editMessageText(text, {
                chat_id: this._channelId,
                message_id: messageId,
                disable_web_page_preview: true,
                ...this._defaultOptions
            }) :
            await this._bot.sendMessage(this._channelId, text, {disable_web_page_preview: true, ...this._defaultOptions});

        return {
            type: 'text',
            url: this._formatToMessageUrl((response as TelegramBot.Message).message_id),
            date: (response as TelegramBot.Message).date
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
            url: this._formatToMessageUrl((response as TelegramBot.Message).message_id),
            date: (response as TelegramBot.Message).date
        }
    }

    static getMessageIdFromUrl(telegramUrl: string | undefined): number | undefined {
        if (!telegramUrl) {
            return undefined;
        }
        const urlPath = url.parse(telegramUrl).pathname;
        if (urlPath) {
            return Number(urlPath.split('/').pop());
        }
    }
}
