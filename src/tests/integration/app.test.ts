/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {strict as assert} from 'assert';
import {config} from '../../app/config.js';
import {handler, TrackerHandlerEvent} from '../../app/app.js';
import {TrackerProvider} from '../../app/providers/tracker.js';

const trackerProvider = new TrackerProvider();

function getCloudFunctionRequest(data: Record<string, unknown> = {}): TrackerHandlerEvent {
    return {
        httpMethod: 'POST',
        headers: {'X-Tarmolov-Work-Secret-Key': '', 'X-Tarmolov-Work-Event': 'BLOG_POST'},
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
        assert.notStrictEqual(response.body, 'Access denied');
    });

    it('should show error for missed issue key', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'BLOG_POST'}
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.notStrictEqual(response.body, 'No issue key is passed');
    });

    it('should show error for wrong issue', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'BLOG_POST'},
            body: '{"key": "UNKNOWD-1"}'
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.notStrictEqual(response.body, 'Issue UNKNOWD-1 doesn\'t belong to BLOGTEST');
    });

    it('should show error for issue with empty description', async () => {
        const request = getCloudFunctionRequest({
            headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'BLOG_POST'},
            body: '{"key": "BLOGTEST-11"}'
        });
        const response = await handler(request);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body, 'Issue BLOGTEST-11 does not have filled description field');
    });

    describe('issue with blocked deps', () => {
        beforeEach(async () => {
            const transitions = await trackerProvider.getIssueTransitions('BLOGTEST-18');
            const reopenTransition = transitions.find((transition) => transition.display === 'reopen');
            if (reopenTransition) {
                await trackerProvider.changeIssueStatus('BLOGTEST-18', 'reopen');
            }
        });

        it('should show error for issue with blocked deps', async () => {
            const request = getCloudFunctionRequest({
                headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'BLOG_POST'},
                body: '{"key": "BLOGTEST-18"}'
            });
            const response = await handler(request);
            assert.equal(response.statusCode, 200);
            assert.equal(response.body, 'Issue BLOGTEST-18 has blocked dependencies');
        });
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
                    [config['tracker.fields.publishUrl']]: null
                });
            });

            it('should post to telegram', async () => {
                const request = getCloudFunctionRequest({
                    headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'BLOG_POST'},
                    body: `{"key": "${testCase.issue}"}`
                });
                const response = await handler(request);
                assert.equal(response.statusCode, 200);
                assert.equal(typeof response.body, 'object');
            });
        });
    });

    describe('should add event to calendar', () => {
        before(async () => {
            await trackerProvider.editIssue('BLOGTEST-24', {
                description: Math.random().toString(),
                [config['tracker.fields.publisDateTime']]: null,
                [config['tracker.fields.scheduledDateTime']]: null,
                [config['tracker.fields.calendarEventId']]: null
            });
        });

        it('should post to calendar', async () => {
            const request = getCloudFunctionRequest({
                headers: {'X-Tarmolov-Work-Secret-Key': config['app.secret'], 'X-Tarmolov-Work-Event': 'CALENDAR_EVENT'},
                body: `{"key": "BLOGTEST-24"}`
            });
            const response = await handler(request);
            assert.equal(response.statusCode, 200);
            assert.equal(typeof response.body, 'object');
        });
    });
});
