import { Cursor } from '../lib/Cursor';
import {
    boldCommandHandler,
    italicCommandHandler,
    linkCommandHandler,
    imageCommandHandler,
    orderedListCommandHandler,
    unorderedListCommandHandler,
    codeBlockCommandHandler,
    codeInlineCommandHandler,
    codeCommandHandler,
    blockQuotesCommandHandler,
    strikeThroughCommandHandler,
    createHeadlineCommandHandler,
} from '../lib/handlers';
import { CommandHandlerContext, defaultTextareaMarkdownOptions } from '../lib/types';

const createContext = (content: string, selectionStart: number, selectionEnd: number): CommandHandlerContext => {
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.selectionStart = selectionStart;
    textarea.selectionEnd = selectionEnd;
    const cursor = new Cursor(textarea);
    return {
        textarea,
        cursor,
        options: defaultTextareaMarkdownOptions,
    };
};

describe('boldCommandHandler', () => {
    it('should wrap selection with bold syntax', () => {
        const ctx = createContext('hello world', 0, 5);
        boldCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('**hello** world');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        boldCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('**bold**');
    });
});

describe('italicCommandHandler', () => {
    it('should wrap selection with italic syntax', () => {
        const ctx = createContext('hello world', 0, 5);
        italicCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('*hello* world');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        italicCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('*italic*');
    });
});

describe('linkCommandHandler', () => {
    it('should insert link markup with selection as text', () => {
        const ctx = createContext('click here', 0, 10);
        linkCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('[click here](url)');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        linkCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('[example](url)');
    });
});

describe('imageCommandHandler', () => {
    it('should insert image markup with selection as alt text', () => {
        const ctx = createContext('my image', 0, 8);
        imageCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('![my image](image.png)');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        imageCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('![example](image.png)');
    });
});

describe('orderedListCommandHandler', () => {
    it('should add ordered list prefix to current line', () => {
        const ctx = createContext('item', 0, 0);
        orderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('1. item');
    });

    it('should remove ordered list prefix if already present', () => {
        const ctx = createContext('1. item', 0, 0);
        orderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('item');
    });

    it('should number multiple selected lines', () => {
        const ctx = createContext('one\ntwo\nthree', 0, 13);
        orderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('1. one\n2. two\n3. three');
    });
});

describe('unorderedListCommandHandler', () => {
    it('should add unordered list prefix to current line', () => {
        const ctx = createContext('item', 0, 0);
        unorderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('* item');
    });

    it('should remove unordered list prefix if already present', () => {
        const ctx = createContext('* item', 0, 0);
        unorderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('item');
    });

    it('should add prefix to multiple selected lines', () => {
        const ctx = createContext('one\ntwo\nthree', 0, 13);
        unorderedListCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('* one\n* two\n* three');
    });
});

describe('codeBlockCommandHandler', () => {
    it('should wrap selection with code block syntax', () => {
        const ctx = createContext('const x = 1;', 0, 12);
        codeBlockCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('```\nconst x = 1;\n```');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        codeBlockCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('```\ncode block\n```');
    });
});

describe('codeInlineCommandHandler', () => {
    it('should wrap selection with inline code syntax', () => {
        const ctx = createContext('variable', 0, 8);
        codeInlineCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('`variable`');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        codeInlineCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('`code`');
    });
});

describe('codeCommandHandler', () => {
    it('should use inline code for single line', () => {
        const ctx = createContext('code', 0, 4);
        codeCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('`code`');
    });

    it('should use code block for multiple lines', () => {
        const ctx = createContext('line1\nline2', 0, 11);
        codeCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('```\nline1\nline2\n```');
    });
});

describe('blockQuotesCommandHandler', () => {
    it('should add quote prefix to current line', () => {
        const ctx = createContext('quote text', 0, 0);
        blockQuotesCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('> quote text');
    });

    it('should use placeholder when line is empty', () => {
        const ctx = createContext('', 0, 0);
        blockQuotesCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('> quote');
    });

    it('should remove existing quote prefix', () => {
        const ctx = createContext('> quoted', 0, 0);
        blockQuotesCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('> quoted');
    });
});

describe('strikeThroughCommandHandler', () => {
    it('should wrap selection with strikethrough syntax', () => {
        const ctx = createContext('deleted', 0, 7);
        strikeThroughCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('~~deleted~~');
    });

    it('should use placeholder when no selection', () => {
        const ctx = createContext('', 0, 0);
        strikeThroughCommandHandler(ctx);
        expect(ctx.textarea.value).toBe('~~strike through~~');
    });
});

describe('createHeadlineCommandHandler', () => {
    it('should add h1 prefix', () => {
        const ctx = createContext('title', 0, 0);
        createHeadlineCommandHandler(1)(ctx);
        expect(ctx.textarea.value).toBe('# title');
    });

    it('should add h6 prefix', () => {
        const ctx = createContext('title', 0, 0);
        createHeadlineCommandHandler(6)(ctx);
        expect(ctx.textarea.value).toBe('###### title');
    });

    it('should remove headline prefix if same level', () => {
        const ctx = createContext('# title', 0, 0);
        createHeadlineCommandHandler(1)(ctx);
        expect(ctx.textarea.value).toBe('title');
    });

    it('should replace headline prefix with different level', () => {
        const ctx = createContext('## title', 0, 0);
        createHeadlineCommandHandler(3)(ctx);
        expect(ctx.textarea.value).toBe('### title');
    });

    it('should clamp level to valid range', () => {
        const ctx = createContext('title', 0, 0);
        createHeadlineCommandHandler(10)(ctx);
        expect(ctx.textarea.value).toBe('###### title');
    });

    it('should use placeholder when line is empty', () => {
        const ctx = createContext('', 0, 0);
        createHeadlineCommandHandler(1)(ctx);
        expect(ctx.textarea.value).toBe('# headline 1');
    });
});
