/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';

export interface Config {
    readonly 'app.secret': string;
    readonly 'tracker.host': string;
    readonly 'tracker.oauthToken': string;
    readonly 'tracker.orgId': string;
    readonly 'tracker.queue': string;
    readonly 'tracker.components.approvers': Record<string, string[]>;
    readonly 'tracker.fields.prefix': string;
    readonly 'telegram.botToken': string;
}

export const production: Config = {
    'app.secret': process.env.ACCESS_SECRET_KEY!,
    'tracker.host': 'https://api.tracker.yandex.net',
    'tracker.oauthToken': process.env.TRACKER_OAUTH_TOKEN!,
    'tracker.orgId': process.env.TRACKER_ORG_ID!,
    'tracker.queue': 'BLOG',
    'tracker.components.approvers': {},
    'tracker.fields.prefix': '635bb3a32bf1dd5fdb87553e--',
    'telegram.botToken': process.env.TELEGRAM_BOT_TOKEN!
};

const testing: Config = {
    ...production,
    'tracker.queue': 'BLOGTEST',
    'tracker.fields.prefix': '635dac2e7129af41f3be0698--'
};

const development: Config = {
    ...testing
};

const configs = new Map<string, Config>([
    ['production', production],
    ['testing', testing],
    ['development', development]
]);

const APP_ENV = process.env.ENVIRONMENT || 'development';
assert.ok(configs.has(APP_ENV), `There is no configuration for environment ${APP_ENV}`);
export const config = configs.get(APP_ENV)!;
