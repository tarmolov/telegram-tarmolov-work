import {marked} from 'marked';

// escape probitited symbols
// see https://core.telegram.org/bots/api#markdownv2-style
const walkTokens = (token: marked.Token) => {
    // inside pre and code entities, all '`' and '\' characters must be escaped with a preceding '\' character.
    if (token.type === 'codespan' || token.type === 'code') {
        token.text = token.text.replace(/\\*(`|\\)/g, '\\$1');
    }

    // inside (...) part of inline link definition, all ')' and '\' must be escaped with a preceding '\' character.
    if (token.type === 'link') {
        token.href = token.href.replace(/\\*(\.|#|\\|\))/g, '\\$1');
    }

    // in all other places characters '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
    // must be escaped with the preceding character '\'.
    if (token.type === 'text') {
        token.text = token.text.replace(/\\*(_|\*|\[|\]|\(|\)|~|`|>|#|\+|-|=|\||{|}|\.|!)/g, '\\$1');
    }
};

// render telegram markdown instead of html
// see https://core.telegram.org/bots/api#markdownv2-style
const renderer: Partial<marked.Renderer> = {
    strong: (text) => `*${text}*`,
    em: (text) => `_${text}_`,
    del: (text) => `~${text}~`,
    blockquote: (text) => `\\> ${text}`,
    link: (href, _, text) => `[${text}](${href})`,
    list: (body, ordered) => '\n' + body
        .split('\n')
        .slice(0, -1) // remove last end of line
        .map((item, index) => ordered ? `${++index}\\. ${item}` : `\\- ${item}`)
        .join('\n') + '\n'
    ,
    listitem: (text) => `${text}\n`,
    br: () => '\n\n',
    codespan: (code) => `\`${code}\``,
    code: (code) => `\`\`\`\n${code}\n\`\`\`\n`,
    paragraph: (text: string) => `${text}\n\n`
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

// drop all images from markdown markup
const dropImageExtension: marked.TokenizerExtension & marked.RendererExtension = {
    name: 'drop-image',
    level: 'block',
    start(src: string) {
        return src.match(/!\[/)?.index; // starts with ![...]
    },
    tokenizer(src) {
        const match =  /^!\[[^\]]+\]\([^)]+\)/.exec(src); // ![...](...)

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
    walkTokens,
    renderer,
    extensions: [
        underlinedExtension,
        dropImageExtension
    ]
});

// transform Yandex Flavoured Markdown (YFM) to Telegram Markdown
export function transformYfmToTelegramMarkdown(input: string) {
    return marked.parse(input).trim();
}
