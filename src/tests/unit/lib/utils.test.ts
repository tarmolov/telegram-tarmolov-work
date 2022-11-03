import {strict as assert} from 'assert';
import {sanitizeTrackerMarkdown} from '../../../app/lib/utils';

describe('utils', () => {
    it('should remove all links from string', () => {
        const input = '![image.png](/ajax/v2/attachments/14?inline=true =x400)  \n   тест ![image.png](/ajax/v2/attachments/14?inline=true =x400)';
        assert.equal('тест', sanitizeTrackerMarkdown(input));
    });
});