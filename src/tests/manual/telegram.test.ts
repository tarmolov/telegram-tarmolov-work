import * as path from 'path';
import {strict as assert} from 'assert';
import {askQuestion} from '../utils/utils';
import {TelegramProvider} from '../../app/providers/telegram';

const TestPhotosFilenames = {
    car: path.resolve(__dirname, '../../../resources/car.png'),
    train: path.resolve(__dirname, '../../../resources/train.png')
};

const bot = new TelegramProvider();

describe('providers/telegram', () => {
    describe('Text message', () => {
        let textMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendTextMessage('*Test message*');
            textMessageTelegramUrl = response.url;
            await askQuestion(`Message is posted: ${response.url}`);
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const messageId = TelegramProvider.getMessageIdFromUrl(textMessageTelegramUrl);
            const response = await bot.sendTextMessage('__Edited test message__', messageId);
            await askQuestion(`Message is edited: ${response.url}`);
            assert.equal(response.url.length !== 0, true);
        });
    })

    describe('Photo message with caption', () => {
        let photoMessageTelegramUrl: string;
        it('should send a text message', async () => {
            const response = await bot.sendPhotoWithTextMessage(TestPhotosFilenames.car, '*Caption*');
            photoMessageTelegramUrl = response.url;
            await askQuestion(`Message is posted: ${response.url}`);
            assert.equal(response.url.length !== 0, true);
        });

        it('should edit the text message', async () => {
            const messageId = TelegramProvider.getMessageIdFromUrl(photoMessageTelegramUrl);
            const response = await bot.sendPhotoWithTextMessage(TestPhotosFilenames.train, '__Edited caption__', messageId);
            await askQuestion(`Message is edited: ${response.url}`);
            assert.equal(response.url.length !== 0, true);
        });
    })
});