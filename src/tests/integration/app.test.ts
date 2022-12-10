/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {strict as assert} from 'assert';
import {CloudFunctionRequest} from '../../app/types';
import {config} from '../../app/config';
import {handler} from '../../app/app';
import {TrackerProvider} from '../../app/providers/tracker';

const trackerProvider = new TrackerProvider();

function getCloudFunctionRequest(data: Record<string, unknown> = {}): CloudFunctionRequest {
    return {
        httpMethod: 'POST',
        headers: {},
        multiValueHeaders: {},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        body: '{}',
        isBase64Encoded: false,
        ...data
    };
}
describe('app', () => {
    it('should restrict access without passed secret', async () => {
        const request = getCloudFunctionRequest();
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'Access denied');
    });

    it('should show error for missed required params', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-TARMOLOV-WORK-SECRET-KEY': config['app.secret']}
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'Required parameters channel_id and publish_url_fields are missed');
    });

    it('should show error for missed issue key', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-TARMOLOV-WORK-SECRET-KEY': config['app.secret']},
            queryStringParameters: {
                channel_id: process.env.TELEGRAM_TESTING_CHANNEL_ID!,
                publish_url_field: 'testing'
            }
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'No issue key is passed');
    });

    it('should show error for wrong issue', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-TARMOLOV-WORK-SECRET-KEY': config['app.secret']},
            queryStringParameters: {
                channel_id: process.env.TELEGRAM_TESTING_CHANNEL_ID!,
                publish_url_field: 'testing'
            },
            body: '{"key": "UNKNOWD-1"}'
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'Issue UNKNOWD-1 doesn\'t belong to BLOGTEST');
    });

    it('should show error for issue with empty description', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-TARMOLOV-WORK-SECRET-KEY': config['app.secret']},
            queryStringParameters: {
                channel_id: process.env.TELEGRAM_TESTING_CHANNEL_ID!,
                publish_url_field: 'testing'
            },
            body: '{"key": "BLOGTEST-11"}'
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'Issue BLOGTEST-11 does not have filled description field');
    });

    [
        {type: 'text message', issue: 'BLOGTEST-12'},
        {type: 'photo message', issue: 'BLOGTEST-13'},
        {type: 'video message', issue: 'BLOGTEST-14'}
    ].forEach((testCase) => {
        describe(`should post ${testCase.type} to telegram`, () => {
            before(async () => {
                await trackerProvider.editIssue(testCase.issue, {
                    description: Math.random().toString(),
                    [`${config['tracker.fields.prefix']}testing`]: null
                });
            });

            it('should post to telegram', async () => {
                const request = getCloudFunctionRequest({
                    headers: {'X-TARMOLOV-WORK-SECRET-KEY': config['app.secret']},
                    queryStringParameters: {
                        channel_id: process.env.TELEGRAM_TESTING_CHANNEL_ID!,
                        publish_url_field: 'testing'
                    },
                    body: `{"key": "${testCase.issue}"}`
                });
                const response = await handler(request);
                assert.equal(response.statusCode, 200);
                assert.equal(typeof response.body, 'object');
            });
        });
    });
});