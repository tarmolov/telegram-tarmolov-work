/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as dotenv from 'dotenv';
dotenv.config();

import * as assert from 'assert';

export interface Config {
    readonly 'app.secret': string;
    readonly 'app.debug': boolean;
    readonly 'app.debug.components.approvers': Record<string, string[]>;
    readonly 'tracker.apiUrl': string;
    readonly 'tracker.oauthToken': string;
    readonly 'tracker.orgId': string;
    readonly 'tracker.queue': string;
    readonly 'tracker.url': string;
    readonly 'tracker.fields.publishUrl': string;
    readonly 'tracker.fields.publisDateTime': string;
    readonly 'tracker.fields.scheduledDateTime': string;
    readonly 'tracker.fields.calendarEventId': string;
    readonly 'tracker.closeIssueAfterPublishing': boolean;
    readonly 'tracker.checkIssueDeps': boolean;
    readonly 'telegram.botToken': string;
    readonly 'telegram.channelId': string;
    readonly 'calendar.calendarEventsId': string;
    readonly 'google.keyFile': string;
}

const production: Config = {
    'app.secret': process.env.ACCESS_SECRET_KEY!,
    'app.debug': false,
    'tracker.apiUrl': 'https://api.tracker.yandex.net',
    'tracker.oauthToken': process.env.TRACKER_OAUTH_TOKEN!,
    'tracker.orgId': process.env.TRACKER_ORG_ID!,
    'tracker.queue': process.env.TRACKER_QUEUE!,
    'tracker.url': 'https://tracker.yandex.ru/',
    'tracker.fields.publishUrl': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--production`,
    'tracker.fields.publisDateTime': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--publishDateTime`,
    'tracker.fields.scheduledDateTime': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--scheduledDateTime`,
    'tracker.fields.calendarEventId': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--calendarEventId`,
    'tracker.closeIssueAfterPublishing': true,
    'tracker.checkIssueDeps': true,
    'telegram.botToken': process.env.TELEGRAM_BOT_TOKEN!,
    'telegram.channelId': process.env.TELEGRAM_PRODUCTION_CHANNEL_ID!,
    'calendar.calendarEventsId': process.env.CALENDAR_ID!,
    'google.keyFile': process.env.GOOGLE_API_KEY_FILE!,
    'app.debug.components.approvers': JSON.parse(Buffer.from(process.env.TRACKER_COMPONENTS_APPROVERS!, 'base64').toString())
};

const prestable: Config = {
    ...production,
    'telegram.channelId': process.env.TELEGRAM_TESTING_CHANNEL_ID!,
    'tracker.fields.publishUrl': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--testing`,
    'tracker.closeIssueAfterPublishing': false,
    'tracker.checkIssueDeps': false,
    'app.debug': true
};

const testing: Config = {
    ...production
};

const development: Config = {
    ...testing,
    'app.debug': true,
    'telegram.channelId': process.env.TELEGRAM_TESTING_CHANNEL_ID!,
    'tracker.closeIssueAfterPublishing': false,
    'tracker.fields.publishUrl': `${process.env.TRACKER_QUEUE_LOCAL_FIELD_HASH!}--testing`
};

const tests: Config = {
    ...development,
    'app.debug': false
};

const configs = new Map<string, Config>([
    ['production', production],
    ['prestable', prestable],
    ['testing', testing],
    ['development', development],
    ['tests', tests]
]);

const APP_ENV = process.env.ENVIRONMENT || 'development';
assert.ok(configs.has(APP_ENV), `There is no configuration for environment ${APP_ENV}`);
export const config = configs.get(APP_ENV)!;
export const getConfigByEnv = (env: string) => configs.get(env)!;
