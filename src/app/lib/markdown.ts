import {marked} from 'marked';

// escape probitited symbols
// see https://core.telegram.org/bots/api#markdownv2-style
const tokensEscaper = (token: marked.Token) => {
    // inside pre and code entities, all '`' and '\' characters must be escaped with a preceding '\' character.
    if (token.type === 'codespan' || token.type === 'code') {
        token.text = token.text.replace(/\\*(`|\\)/g, '\\$1');
    }

    // inside (...) part of inline link definition, all ')' and '\' must be escaped with a preceding '\' character.
    if (token.type === 'link') {
        token.href = token.href.replace(/\\*(\.|#|\\|\))/g, '\\$1');
    }

    if (token.type === 'text') {
        token.text = token.text
            // default behaviour escapes symbols like ", ', <, >, &
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, '\'')
            // in all other places characters '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
            // must be escaped with the preceding character '\'.
            .replace(/\\*(_|\*|\[|\]|\(|\)|~|`|>|#|\+|-|=|\||{|}|\.|!)/g, '\\$1');
    }
};

// render telegram markdown instead of html
// see https://core.telegram.org/bots/api#markdownv2-style
const renderer: Partial<marked.Renderer> = {
    strong: (text) => `*${text}*`,
    em: (text) => `_${text}_`,
    del: (text) => `~${text}~`,
    blockquote: (text) => `>${text}`,
    link: (href, _, text) => `[${text}](${href})`,
    list: (body, ordered) => body
        .split('\n')
        .slice(0, -1) // remove end of line from the last list item
        .map((item, index) => ordered ? `${++index}\\. ${item}` : `\\- ${item}`)
        .join('\n') + '\n'
    ,
    listitem: (text) => `${text}\n`,
    br: () => '\n\n',
    codespan: (code) => `\`${code}\``,
    code: (code) => `\`\`\`\n${code}\n\`\`\`\n`,
    paragraph: (text: string) => `${text}\n`
};

// specific underline markup is missed in marked module
// see https://marked.js.org/using_pro#extensions
const underlinedExtension: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'underlined',
    level: 'inline',
    start(src: string) {
        return src.match(/\+{2}/)?.index; // starts with ++
    },
    tokenizer(src) {
        const match =  /^\+{2}([^+\n]+)\+{2}/.exec(src); // ++Underlined++

        if (match) {
            const text = match[1];
            return {
                type: 'underlined',
                raw: match[0],
                text,
                tokens: this.lexer.inlineTokens(text)
            };
        }
    },
    renderer(token) {
        return `__${token.text}__`;
    }
};

// keep empty lines in final markdown
const emptyLineExtension: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'empty-line',
    level: 'block',
    start(src: string) {
        return src.match(/^\n/)?.index; // starts with \n\n
    },
    tokenizer(src) {
        const match =  /^\n\n/.exec(src);

        if (match) {
            const text = match[1];
            return {
                type: 'empty-line',
                raw: match[0],
                text,
                tokens: this.lexer.inlineTokens(text)
            };
        }
    },
    renderer() {
        return `\n`; }
};

// drop all images from markdown markup
const dropImageExtension: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'drop-image',
    level: 'block',
    start(src: string) {
        return src.match(/!\[/)?.index; // starts with ![...]
    },
    tokenizer(src) {
        const match =  /^!\[[^\]]*\]\([^)]+\)/.exec(src); // ![...](...)

        if (match) {
            const text = match[0];
            return {
                type: 'drop-image',
                raw: text
            };
        }
    },
    renderer() {
        return '';
    }
};

marked.use({
    renderer,
    extensions: [
        underlinedExtension,
        dropImageExtension,
        emptyLineExtension
    ],
   async: true
});

interface TranfromTelegramOptions {
    linkExtractor?: (href: string) => Promise<string>;
}

// transform Yandex Flavoured Markdown (YFM) to Telegram Markdown
export async function transformYfmToTelegramMarkdown(input: string, options: TranfromTelegramOptions = {}) {
    marked.use({
        walkTokens: async (token: marked.Token) => {
            if (options.linkExtractor && token.type === 'link') {
                token.href = await options.linkExtractor(token.href);
            }
            tokensEscaper(token);
        }
    });

    const result = (await marked.parse(input)).trim();
    delete options.linkExtractor;

    return result;
}
