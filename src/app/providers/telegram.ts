process.env['NTBA_FIX_350'] = '1';

import * as fs from 'fs';
import * as url from 'url';
import * as TelegramBot from 'node-telegram-bot-api';
import {config} from '../config';

export interface TelegramSendMessageOptions {
    messageId?: number;
    file?: {
        path: string;
        mimeType: string;
    };
}

interface TelegramProviderResponse {
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

    async sendMessage(text: string, options?: TelegramSendMessageOptions): Promise<TelegramProviderResponse> {
        let response: TelegramBot.Message;
        const isPhoto = options?.file?.mimeType.startsWith('image');
        const isVideo = options?.file?.mimeType.startsWith('video');

        if (options?.file?.path && isPhoto) {
            response = await this.sendPhotoWithTextMessage(options?.file?.path, text, options?.messageId);
        } else if (options?.file?.path && isVideo) {
            response = await this.sendVideoWithTextMessage(options?.file?.path, text, options?.messageId);
        } else {
            response = await this.sendTextMessage(text, options?.messageId);
        }

        return {
            url: this._formatToMessageUrl(response.message_id),
            date: response.date
        };
    }

    // https://core.telegram.org/bots/api#sendmessage
    async sendTextMessage(text: string, messageId?: number): Promise<TelegramBot.Message> {
        console.log(`TELEGRAM REQ: text="${JSON.stringify(text)}", messageId=${messageId}`)
        const response = messageId ?
            await this._bot.editMessageText(text, {
                chat_id: this._channelId,
                message_id: messageId,
                disable_web_page_preview: true,
                ...this._defaultOptions
            }) :
            await this._bot.sendMessage(this._channelId, text, {disable_web_page_preview: true, ...this._defaultOptions});

        console.log(`TELEGRAM RES: ${JSON.stringify(response)}}`)
        return response as TelegramBot.Message;
    }

    // https://core.telegram.org/bots/api#sendphoto
    async sendPhotoWithTextMessage(filePath: string, caption?: string, messageId?: number): Promise<TelegramBot.Message> {
        return this._sendMediaWithTextMessage(filePath, 'photo', caption, messageId);
    }

    // https://core.telegram.org/bots/api#sendvideo
    async sendVideoWithTextMessage(filePath: string, caption?: string, messageId?: number): Promise<TelegramBot.Message> {
        return this._sendMediaWithTextMessage(filePath, 'video', caption, messageId);
    }

    async _sendMediaWithTextMessage(filePath: string, fileType: 'photo' | 'video', caption?: string, messageId?: number): Promise<TelegramBot.Message> {
        console.log(`TELEGRAM REQ: filePath="${filePath}", caption="${JSON.stringify(caption)}", messageId=${messageId}`)
        let response;
        if (messageId) {
            response = await this._bot.editMessageMedia(
                {
                    type: fileType,
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
            if (fileType === 'photo') {
                response = await this._bot.sendPhoto(
                    this._channelId,
                    inputFile,
                    {
                        caption: caption,
                        ...this._defaultOptions
                    },
                    {}
                );
            } else {
                response = await this._bot.sendVideo(
                    this._channelId,
                    inputFile,
                    {
                        caption: caption,
                        ...this._defaultOptions
                    },
                    {}
                );
            }
        }
        console.log(`TELEGRAM RES: ${JSON.stringify(response)}}`)
        return response as TelegramBot.Message;
    }

    static getMessageIdFromUrl(telegramUrl: string | undefined | null): number | undefined {
        if (!telegramUrl) {
            return undefined;
        }
        const urlPath = url.parse(telegramUrl).pathname;
        if (urlPath) {
            return Number(urlPath.split('/').pop());
        }
    }
}
