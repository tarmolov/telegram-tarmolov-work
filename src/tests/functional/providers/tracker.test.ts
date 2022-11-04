import {strict as assert} from 'assert';
import {config} from '../../../app/config';
import {TrackerProvider} from '../../../app/providers/tracker';

const trackerProvider = new TrackerProvider();

describe('providers/tracker', () => {
    it('should get an issue', async () => {
        const issue = await trackerProvider.getIssueByKey('BLOGTEST-4');
        assert.equal(issue.key, 'BLOGTEST-4');
    });

    it('should edit the issue', async () => {
        const issue = await trackerProvider.editIssue('BLOGTEST-4', {
            summary: 'Отредактированное тестовое сообщение',
            [`${config['tracker.fields.prefix']}publishDateTime`]: new Date().toISOString()
        });
        assert.equal(issue.summary, 'Отредактированное тестовое сообщение');
    });

    it('should get attachments', async () => {
        const issueAttachments = await trackerProvider.getIssueAttachments('BLOGTEST-5');
        assert.equal(issueAttachments.length > 0, true);
    });

    it('should download file', async () => {
        const attachments = await trackerProvider.getIssueAttachments('BLOGTEST-5');
        const downloadedFile = await trackerProvider.downloadIssueAttachment(attachments[0]);
        assert.ok(downloadedFile);
    });

    describe('resolving issue', () => {
        beforeEach(async () => {
            const issueTransitions = await trackerProvider.getIssueTransitions('BLOGTEST-4');
            const shouldReopen = issueTransitions.find((transition) => transition.id === 'reopen');
            if (shouldReopen) {
                await trackerProvider.changeIssueStatus('BLOGTEST-4', 'reopen');
            }
        });

        it('should close issue', async () => {
            await trackerProvider.changeIssueStatus('BLOGTEST-4', 'close', {
                resolution: 'fixed'
            });
        });
    });
});
