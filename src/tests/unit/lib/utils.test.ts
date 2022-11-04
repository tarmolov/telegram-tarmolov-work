import {strict as assert} from 'assert';
import {transformMarkdown} from '../../../app/lib/utils';

const msg =`

`;
console.log(transformMarkdown(msg))

describe('utils', () => {
    describe('transformMarkdown', ()  => {
        const markdownExamples = {
            'Bold': {input: '**Полужирный**', expected: '*Полужирный*'},
            'Italic': {input: '*Курсив*', expected: '_Курсив_'},
            'Underlined': {input: '++Подчеркнутый++', expected: '__Подчеркнутый__'},
            'Strikethrough': {input: '~~Перечеркнутый~~', expected: '~Перечеркнутый~'},
            'Quote': {input: '> Цитата', expected: '\\> Цитата'},
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
            'Bold + Italic + Unordered list': {
                input: '*Курсив*\n**Полужирный**\n*Курсив*\n* один\n* два',
                expected: '_Курсив_\n*Полужирный*\n_Курсив_\n\\- один\n\\- два'
            },
            'Escape forbiden symbols': {
                input: '> #Hel-lo!',
                expected: '\\> \\#Hel\\-lo\\!'
            }
        };

        for (const [title, testData] of Object.entries(markdownExamples)) {
            it(title, () => {
                assert.equal(testData.expected, transformMarkdown(testData.input));
            });
        }
    });
});
