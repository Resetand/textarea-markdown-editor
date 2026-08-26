import { Cursor, Line } from '../lib/Cursor';

const createTextArea = (content: string) => {
    const el = document.createElement('textarea');
    el.value = content;
    return el;
};

describe('Cursor.lineAt', () => {
    it('should return line info for valid line number', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        const cursor = new Cursor(textarea);

        const line = cursor.lineAt(2);
        expect(line).toEqual<Line>({
            text: 'line 2',
            lineNumber: 2,
            startsAt: 7,
            endsAt: 13,
        });
    });

    it('should return null for invalid line number', () => {
        const textarea = createTextArea('line 1\nline 2');
        const cursor = new Cursor(textarea);

        expect(cursor.lineAt(0)).toBeNull();
        expect(cursor.lineAt(5)).toBeNull();
        expect(cursor.lineAt(-1)).toBeNull();
    });

    it('should return first line correctly', () => {
        const textarea = createTextArea('first line\nsecond line');
        const cursor = new Cursor(textarea);

        const line = cursor.lineAt(1);
        expect(line).toEqual<Line>({
            text: 'first line',
            lineNumber: 1,
            startsAt: 0,
            endsAt: 10,
        });
    });
});

describe('Cursor.position', () => {
    it('should return position at start of text', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
        const cursor = new Cursor(textarea);

        const pos = cursor.position;
        expect(pos.cursorAt).toBe(0);
        expect(pos.line.lineNumber).toBe(1);
    });

    it('should return position in middle of line', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 6;
        textarea.selectionEnd = 6;
        const cursor = new Cursor(textarea);

        const pos = cursor.position;
        expect(pos.cursorAt).toBe(6);
        expect(pos.line.lineNumber).toBe(1);
    });

    it('should return position on second line', () => {
        const textarea = createTextArea('line 1\nline 2');
        textarea.selectionStart = 10;
        textarea.selectionEnd = 10;
        const cursor = new Cursor(textarea);

        const pos = cursor.position;
        expect(pos.cursorAt).toBe(10);
        expect(pos.line.lineNumber).toBe(2);
    });
});

describe('Cursor.selection', () => {
    it('should return null when no selection', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 5;
        textarea.selectionEnd = 5;
        const cursor = new Cursor(textarea);

        expect(cursor.selection).toBeNull();
    });

    it('should return selection info for single line selection', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 5;
        const cursor = new Cursor(textarea);

        const selection = cursor.selection;
        expect(selection).not.toBeNull();
        expect(selection!.text).toBe('hello');
        expect(selection!.selectionStart).toBe(0);
        expect(selection!.selectionEnd).toBe(5);
        expect(selection!.lines).toHaveLength(1);
    });

    it('should return selection info for multi-line selection', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        textarea.selectionStart = 3;
        textarea.selectionEnd = 17;
        const cursor = new Cursor(textarea);

        const selection = cursor.selection;
        expect(selection).not.toBeNull();
        expect(selection!.lines).toHaveLength(3);
    });

    it('should include partially selected lines', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        textarea.selectionStart = 5;
        textarea.selectionEnd = 8;
        const cursor = new Cursor(textarea);

        const selection = cursor.selection;
        expect(selection).not.toBeNull();
        expect(selection!.lines).toHaveLength(2);
    });
});

describe('Cursor.select', () => {
    it('should set selection range with absolute positions', () => {
        const textarea = createTextArea('hello world');
        const cursor = new Cursor(textarea);

        cursor.select({ start: 0, end: 5 });

        expect(textarea.selectionStart).toBe(0);
        expect(textarea.selectionEnd).toBe(5);
    });

    it('should set selection range with relative positions', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 3;
        textarea.selectionEnd = 5;
        const cursor = new Cursor(textarea);

        cursor.select({ fromCurrentStart: 2, fromCurrentEnd: 3 });

        expect(textarea.selectionStart).toBe(5);
        expect(textarea.selectionEnd).toBe(8);
    });
});

describe('Cursor.replace', () => {
    it('should replace text in textarea', () => {
        const textarea = createTextArea('hello world');
        const cursor = new Cursor(textarea);

        cursor.replace('world', 'universe');

        expect(textarea.value).toBe('hello universe');
    });

    it('should not modify textarea if text not found', () => {
        const textarea = createTextArea('hello world');
        const cursor = new Cursor(textarea);

        cursor.replace('foo', 'bar');

        expect(textarea.value).toBe('hello world');
    });

    it('should replace first occurrence only', () => {
        const textarea = createTextArea('hello hello hello');
        const cursor = new Cursor(textarea);

        cursor.replace('hello', 'hi');

        expect(textarea.value).toBe('hi hello hello');
    });
});

describe('Cursor.insert', () => {
    it('should insert text at cursor position', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 6;
        textarea.selectionEnd = 6;
        const cursor = new Cursor(textarea);

        cursor.insert('beautiful ');

        expect(textarea.value).toBe('hello beautiful world');
    });

    it('should replace selected text', () => {
        const textarea = createTextArea('hello world');
        textarea.selectionStart = 6;
        textarea.selectionEnd = 11;
        const cursor = new Cursor(textarea);

        cursor.insert('universe');

        expect(textarea.value).toBe('hello universe');
    });
});

describe('Cursor.wrap', () => {
    it('should wrap text with symmetric markup', () => {
        const textarea = createTextArea('hello');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 5;
        const cursor = new Cursor(textarea);

        cursor.wrap('**');

        expect(textarea.value).toBe('**hello**');
    });

    it('should wrap text with asymmetric markup', () => {
        const textarea = createTextArea('hello');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 5;
        const cursor = new Cursor(textarea);

        cursor.wrap(['[', ']']);

        expect(textarea.value).toBe('[hello]');
    });

    it('should unwrap already wrapped text', () => {
        const textarea = createTextArea('**hello**');
        textarea.selectionStart = 2;
        textarea.selectionEnd = 7;
        const cursor = new Cursor(textarea);

        cursor.wrap('**');

        expect(textarea.value).toBe('hello');
    });

    it('should use placeholder when no selection', () => {
        const textarea = createTextArea('');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
        const cursor = new Cursor(textarea);

        cursor.wrap('**', { placeholder: 'bold' });

        expect(textarea.value).toBe('**bold**');
    });

    it('should not unwrap when unwrap option is false', () => {
        const textarea = createTextArea('**hello**');
        textarea.selectionStart = 2;
        textarea.selectionEnd = 7;
        const cursor = new Cursor(textarea);

        cursor.wrap('**', { unwrap: false });

        expect(textarea.value).toBe('****hello****');
    });
});

describe('Cursor.replaceCurrentLines', () => {
    it('should replace current line when no selection', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        textarea.selectionStart = 10;
        textarea.selectionEnd = 10;
        const cursor = new Cursor(textarea);

        cursor.replaceCurrentLines((line) => `- ${line.text}`);

        expect(textarea.value).toBe('line 1\n- line 2\nline 3');
    });

    it('should replace multiple selected lines', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        textarea.selectionStart = 0;
        textarea.selectionEnd = 20;
        const cursor = new Cursor(textarea);

        cursor.replaceCurrentLines((line, index) => `${index + 1}. ${line.text}`);

        expect(textarea.value).toBe('1. line 1\n2. line 2\n3. line 3');
    });

    it('should remove line when callback returns null', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        textarea.selectionStart = 7;
        textarea.selectionEnd = 13;
        const cursor = new Cursor(textarea);

        cursor.replaceCurrentLines(() => null);

        expect(textarea.value).toBe('line 1\n\nline 3');
    });
});

describe('Cursor.replaceLine', () => {
    it('should replace specific line by number', () => {
        const textarea = createTextArea('line 1\nline 2\nline 3');
        const cursor = new Cursor(textarea);

        cursor.replaceLine(2, 'replaced');

        expect(textarea.value).toBe('line 1\nreplaced\nline 3');
    });

    it('should handle invalid line number gracefully', () => {
        const textarea = createTextArea('line 1\nline 2');
        const cursor = new Cursor(textarea);
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        cursor.replaceLine(10, 'test');

        expect(consoleSpy).toHaveBeenCalled();
        expect(textarea.value).toBe('line 1\nline 2');
        consoleSpy.mockRestore();
    });
});

describe('Cursor.value', () => {
    it('should return textarea value', () => {
        const textarea = createTextArea('hello world');
        const cursor = new Cursor(textarea);

        expect(cursor.value).toBe('hello world');
    });
});

describe('Cursor.MARKER', () => {
    it('should have static and instance MARKER', () => {
        const textarea = createTextArea('');
        const cursor = new Cursor(textarea);

        expect(Cursor.MARKER).toBe(cursor.MARKER);
        expect(typeof Cursor.MARKER).toBe('string');
    });
});
