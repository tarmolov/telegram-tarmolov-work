/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as dotenv from 'dotenv';
dotenv.config();

import * as assert from 'assert';

export interface Config {
    readonly 'app.secret': string;
    readonly 'app.debug': boolean;
    readonly 'app.debug.components.approvers': Record<string, string[]>;
    readonly 'tracker.host': string;
    readonly 'tracker.oauthToken': string;
    readonly 'tracker.orgId': string;
    readonly 'tracker.queue': string;
    readonly 'tracker.fields.publishUrl': string;
    readonly 'tracker.fields.publisDateTime': string;
    readonly 'tracker.closeIssueAfterPublishing': boolean;
    readonly 'tracker.checkIssueDeps': boolean;
    readonly 'telegram.botToken': string;
    readonly 'telegram.channelId': string;
    readonly 'calendar.calendarEventsId': string;
    readonly 'google.keyFile': string;
}

const production: Config = {
    'app.secret': process.env.ACCESS_SECRET_KEY!,
    'app.debug.components.approvers': {},
    'app.debug': false,
    'tracker.host': 'https://api.tracker.yandex.net',
    'tracker.oauthToken': process.env.TRACKER_OAUTH_TOKEN!,
    'tracker.orgId': process.env.TRACKER_ORG_ID!,
    'tracker.queue': 'BLOG',
    'tracker.fields.publishUrl': '635bb3a32bf1dd5fdb87553e--production',
    'tracker.fields.publisDateTime': '635bb3a32bf1dd5fdb87553e--publishDateTime',
    'tracker.closeIssueAfterPublishing': true,
    'tracker.checkIssueDeps': true,
    'telegram.botToken': process.env.TELEGRAM_BOT_TOKEN!,
    'telegram.channelId': '-1001697479693',
    'calendar.calendarEventsId': 'edfff3aba29c48354928835efca2b2c4dc91f68de6b2156668254958f1d06098@group.calendar.google.com',
    'google.keyFile': process.env.GOOGLE_API_KEY_FILE!
};

const prestable: Config = {
    ...production,
    'telegram.channelId': '-1001649625656',
    'tracker.fields.publishUrl': '635bb3a32bf1dd5fdb87553e--testing',
    'tracker.closeIssueAfterPublishing': false,
    'tracker.checkIssueDeps': false,
    'app.debug': true,
    'app.debug.components.approvers': {}
};

const testing: Config = {
    ...production,
    'telegram.channelId': '-1001667901649',
    'tracker.queue': 'BLOGTEST',
    'tracker.fields.publishUrl': '635dac2e7129af41f3be0698--production',
    'tracker.fields.publisDateTime': '635dac2e7129af41f3be0698--publishDateTime',
    'calendar.calendarEventsId': '94e888b714ca495fcd34c3426bc58d2b18b115bfeb640ab8ceb8298faaed522c@group.calendar.google.com'
};

const development: Config = {
    ...testing,
    'app.debug': true,
    'app.debug.components.approvers': {},
    'telegram.channelId': '-1001671230891',
    'tracker.closeIssueAfterPublishing': false,
    'tracker.fields.publishUrl': '635dac2e7129af41f3be0698--testing'
};

const tests: Config = {
    ...development,
    'app.debug': false,
    'app.debug.components.approvers': {
        'безопасность': ['@tarmolov']
    }
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
