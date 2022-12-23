import {strict as assert} from 'assert';
import {TrackerIssue} from 'src/app/providers/tracker.js';
import {formatIssueDescription} from '../../../app/lib/utils.js';

describe('utils', () => {
    describe('formatIssueDescription', () => {
        it('should show debug information', () => {
            const issue = {
                key: 'BLOGTEST-1',
                description: 'Test',
                components: [
                    {id: '1', display: 'байки'}
                ]
            } as TrackerIssue;
            const result = formatIssueDescription(issue, true);
            assert.equal(result.includes('Служебная информация'), true);
        });

        it('should show extra approvers for specific component', () => {
            const issue = {
                key: 'BLOGTEST-1',
                description: 'Test',
                components: [
                    {id: '1', display: 'безопасность'}
                ]
            } as TrackerIssue;
            const result = formatIssueDescription(issue, true);
            assert.equal(result.includes('Получить `ОК` от'), true);
        });
    });
});
