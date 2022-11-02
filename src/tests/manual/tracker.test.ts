import {strict as assert} from 'assert';
import {config} from '../../app/config';
import {TrackerProvider} from '../../app/providers/tracker';

const trackerProvider = new TrackerProvider();

describe('providers/tracker', () => {
    it('should get an issue', async () => {
        const issue = await trackerProvider.getIssueByKey('BLOGTEST-1');
        assert.equal(issue.key, 'BLOGTEST-1');
    });

    it('should edit the issue', async () => {
        const issue = await trackerProvider.editIssue('BLOGTEST-1', {
            summary: 'test',
            [`${config['tracker.fields.prefix']}publishDateTime`]: new Date().toISOString()
        });
        assert.equal(issue.summary, 'test');
    });
});