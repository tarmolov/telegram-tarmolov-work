import {strict as assert} from 'assert';
import {TrackerIssue} from '../../../app/providers/tracker.js';
import {formatIssueDescription} from '../../../app/lib/utils.js';

describe('utils', () => {
    describe('formatIssueDescription', () => {
        it('should show debug information', async () => {
            const issue = {
                key: 'BLOGTEST-1',
                description: 'Test',
                status: {
                    key: 'testing',
                    display: 'Тестируется'
                },
                components: [
                    {id: '1', display: 'байки'}
                ]
            } as TrackerIssue;
            const result = await formatIssueDescription(issue, {debug: true});
            assert.equal(result.includes('Служебная информация'), true);
        });

        it('should show extra approvers for specific component', async () => {
            const issue = {
                key: 'BLOGTEST-1',
                description: 'Test',
                status: {
                    key: 'testing',
                    display: 'Тестируется'
                },
                components: [
                    {id: '1', display: 'безопасность'}
                ]
            } as TrackerIssue;
            const result = await formatIssueDescription(issue, {debug: true});
            assert.equal(result.includes('Получить `ОК` от'), true);
        });
    });
});
