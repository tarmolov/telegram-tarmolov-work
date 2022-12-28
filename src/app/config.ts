/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
    'telegram.channelId': '-1001697479693'
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
    'tracker.fields.publisDateTime': '635dac2e7129af41f3be0698--publishDateTime'
};

const development: Config = {
    ...testing,
    'app.debug': true,
    'app.debug.components.approvers': {},
    'telegram.channelId': '-1001671230891',
    'tracker.closeIssueAfterPublishing': false,
    'tracker.fields.publishUrl': '635dac2e7129af41f3be0698--testing'
};

// const tests: Config = {
//     ...testing,
//     'app.debug': false,
//     'app.debug.components.approvers': {
//         'безопасность': ['@tarmolov'],
//         'карты': ['@tarmolov']
//     },
// };

const configs = new Map<string, Config>([
    ['production', production],
    ['prestable', prestable],
    ['testing', testing],
    ['development', development]
]);

const APP_ENV = process.env.ENVIRONMENT || 'development';
assert.ok(configs.has(APP_ENV), `There is no configuration for environment ${APP_ENV}`);
export const config = configs.get(APP_ENV)!;
