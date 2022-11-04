import * as path from 'path';
import {strict as assert} from 'assert';
import {TelegramProvider} from '../../../app/providers/telegram';

const TestPhotosFilenames = {
    car: path.resolve(__dirname, '../../__fixtures/car.png'),
    train: path.resolve(__dirname, '../../__fixtures/train.png')
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const bot = new TelegramProvider({channelId: process.env.TELEGRAM_TESTING_CHANNEL_ID!});

describe('providers/telegram', () => {
    describe('Text message', () => {
        let textMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendTextMessage('*Test message*');
            textMessageTelegramUrl = response.url;
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const messageId = TelegramProvider.getMessageIdFromUrl(textMessageTelegramUrl);
            const response = await bot.sendTextMessage('__Edited test message__', messageId);
            assert.equal(response.url.length !== 0, true);
        });
    })

    describe('Photo message with caption', () => {
        let photoMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendPhotoWithTextMessage(TestPhotosFilenames.car, '*Caption*');
            photoMessageTelegramUrl = response.url;
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const messageId = TelegramProvider.getMessageIdFromUrl(photoMessageTelegramUrl);
            const response = await bot.sendPhotoWithTextMessage(TestPhotosFilenames.train, '__Edited caption__', messageId);
            assert.equal(response.url.length !== 0, true);
        });
    })
});
