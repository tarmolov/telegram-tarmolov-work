import {strict as assert} from 'assert';
import {transformYfmToTelegramMarkdown as transformMarkdown} from '../../../app/lib/markdown.js';

describe('markdown', () => {
    describe('transformYfmToTelegramMarkdown', () => {
        const markdownExamples = {
            'Bold': {input: '**Полужирный**', expected: '*Полужирный*'},
            'Italic': {input: '*Курсив*', expected: '_Курсив_'},
            'Underlined': {input: '++Подчеркнутый++', expected: '__Подчеркнутый__'},
            'Strikethrough': {input: '~~Перечеркнутый~~', expected: '~Перечеркнутый~'},
            'Quote': {input: '> Цитата', expected: '>Цитата'},
            'Link': {input: '[Ссылка](http://www.example.com/)', expected: '[Ссылка](http://www\\.example\\.com/)'},
            'Unordered list': {
                input: '* один\n* два\n* три\n* четыре\n* пять',
                expected: '\\- один\n\\- два\n\\- три\n\\- четыре\n\\- пять'
            },
            'Ordered list': {input: '1. один\n2. два', expected: '1\\. один\n2\\. два'},
            'Image': {
                input: '![image.png](/ajax/v2/attachments/14?inline=true =x400)  \n   тест ![image.png](/ajax/v2/attachments/14?inline=true =x400)',
                expected: 'тест'
            },
            'Code inline': {input: '`inline code`', expected: '`inline code`'},
            'Code block': {input: '```\ncode block\n```', expected: '```\ncode block\n```'},
            'Empty line': {input: '1\n\n2', expected: '1\n\n2'},
            'Bold + Italic + Unordered list': {
                input: '*Курсив*\n**Полужирный**\n*Курсив*\n* один\n* два',
                expected: '_Курсив_\n*Полужирный*\n_Курсив_\n\\- один\n\\- два'
            },
            'Escape forbiden symbols': {
                input: '> #Hel-lo!"',
                expected: '>\\#Hel\\-lo\\!"'
            }
        };

        for (const [title, testData] of Object.entries(markdownExamples)) {
            it(title, async () => {
                assert.equal(await transformMarkdown(testData.input), testData.expected);
            });
        }
    });

    it('should replace links via links extractor', async () => {
        const link = await transformMarkdown('[Ссылка](http://www.example.com/)', {
            linkExtractor: async () => new Promise((resolve) => {
                setTimeout(() => resolve('https://example.com/'), 0);
            })
        });
        assert.equal(link, '[Ссылка](https://example\\.com/)');
    });
});
