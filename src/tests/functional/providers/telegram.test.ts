import * as path from 'path';
import {strict as assert} from 'assert';
import {TelegramProvider} from '../../../app/providers/telegram';

const TestPhotosFilenames = {
    car: path.resolve(__dirname, '../../__fixtures/car.png'),
    train: path.resolve(__dirname, '../../__fixtures/train.png')
};

const TestVideoFilenames = {
    earth: path.resolve(__dirname, '../../__fixtures/earth.mp4'),
    abstract: path.resolve(__dirname, '../../__fixtures/abstract.mp4')
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const bot = new TelegramProvider({channelId: process.env.TELEGRAM_TESTING_CHANNEL_ID!});

describe('providers/telegram', () => {
    describe('Text message', () => {
        let textMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendMessage('*Test message*');
            textMessageTelegramUrl = response.url;
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const response = await bot.sendMessage('__Edited test message__', {
                messageId: TelegramProvider.getMessageIdFromUrl(textMessageTelegramUrl)
            });
            assert.equal(response.url.length !== 0, true);
        });
    })

    describe('Photo message with caption', () => {
        let photoMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendMessage('*Caption*', {
                file: {
                    path: TestPhotosFilenames.car,
                    mimeType: 'image/png'
                }
            });
            photoMessageTelegramUrl = response.url;
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const response = await bot.sendMessage('__Edited caption__', {
                messageId: TelegramProvider.getMessageIdFromUrl(photoMessageTelegramUrl),
                file: {
                    path: TestPhotosFilenames.train,
                    mimeType: 'image/png'
                }
            });
            assert.equal(response.url.length !== 0, true);
        });
    })

    describe('Video message with caption', () => {
        let videoMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendMessage('*Caption*', {
                file: {
                    path: TestVideoFilenames.earth,
                    mimeType: 'video/mp4'
                }
            });
            videoMessageTelegramUrl = response.url;
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const response = await bot.sendMessage('__Edited caption__', {
                messageId: TelegramProvider.getMessageIdFromUrl(videoMessageTelegramUrl),
                file: {
                    path: TestVideoFilenames.abstract,
                    mimeType: 'video/mp4'
                }
            });
            assert.equal(response.url.length !== 0, true);
        });
    })
});
