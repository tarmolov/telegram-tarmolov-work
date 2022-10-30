import * as dotenv from 'dotenv'
dotenv.config()
import {TelegramProvider} from './providers/telegram'

const bot = new TelegramProvider();

interface Event {
    httpMethod: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT';
    headers: {[key: string]: string;};
    multiValueHeaders: {[key: string]: string[];};
    queryStringParameters: {[key: string]: string;};
    multiValueQueryStringParameters: {[key: string]: string[];};
    body: string;
    isBase64Encoded: boolean;
}

exports.handler = async function (event: Event) {
    await bot.sendTextMessage(event.queryStringParameters.text);
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'isBase64Encoded': false,
        'body': event.body
    }
};
