import { isBtwOrEq, fireInput } from './utils';

export type SelectionDirectionType = 'backward' | 'forward' | 'none';

export type Selection = {
    /**
     * List of lines that have been selected
     * @note line is considered selected even if it is partially selected
     * */
    lines: Line[];
    text: string;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: SelectionDirectionType;
};

type SelectRange = {
    start: number;
    end: number;
};

type SelectRelative = {
    fromCurrentStart: number;
    fromCurrentEnd: number;
};

export type Line = {
    text: string;
    lineNumber: number;

    /** Index of the first character of the string */
    startsAt: number;

    /**
     * Index of the and of the line (includes the characters up to)
     * */
    endsAt: number;
};

export type Position = {
    line: Line;

    /** Starting cursor position */
    cursorAt: number;
};

export type WrapOptions = {
    unwrap?: boolean;
    placeholder?: string;
};

type Marker = string & { __brand: 'Cursor marker' };
const MARKER = `\u0000` as Marker;

/**
 * Util for manipulation with textarea content and text selection
 */
export class Cursor {
    public static MARKER = MARKER;
    public MARKER: typeof MARKER;

    public constructor(private element: HTMLTextAreaElement) {
        this.MARKER = MARKER;
    }

    public get value() {
        return this.element.value;
    }

    /** @returns {Line[]} information about each line of text */
    public get lines(): Line[] {
        return this.value.split('\n').reduce<Line[]>((lines, content, index) => {
            const lineNumber = index + 1;
            const isFirstLine = index === 0;
            const startsAt = lines.map((l) => l.text).join('\n').length + (isFirstLine ? 0 : 1);
            const endsAt = startsAt + (content + '\n').length - 1;
            return [...lines, { text: content, lineNumber, startsAt, endsAt }];
        }, []);
    }

    /** @returns {Selection} information about current selection */
    public get selection(): Selection | null {
        const selectionStart = this.element.selectionStart;
        const selectionEnd = this.element.selectionEnd;
        const selectionDirection = this.element.selectionDirection;
        const text = this.value.slice(selectionStart, selectionEnd);
        const lines = this.lines.filter(
            (line) =>
                // selection starts inside a line
                isBtwOrEq(selectionStart, line.startsAt, line.endsAt) ||
                // selection ends inside a line
                isBtwOrEq(selectionEnd, line.startsAt, line.endsAt) ||
                // line inside selection from left
                isBtwOrEq(line.startsAt, selectionStart, selectionEnd) ||
                // line inside selection from right
                isBtwOrEq(line.endsAt, selectionStart, selectionEnd),
        );

        if (selectionStart === selectionEnd) {
            return null;
        }

        return { lines, selectionStart, selectionEnd, selectionDirection, text };
    }

    /** @returns {Position} information about current position */
    public get position(): Position {
        const position = this.element.selectionStart;
        const line = this.lines.find((line) => position >= line.startsAt && position <= line.endsAt)!;
        return { cursorAt: position, line };
    }

    public setValue(text: string) {
        const data = this.execRaw(text);

        // TODO check if there are other way to make it work
        if (process.env.NODE_ENV === 'test') {
            this.element.value = data.text;
        } else {
            fireInput(this.element, data.text);
        }

        if (data.selectionStart === null && data.selectionEnd === null) {
            return;
        }

        // if no end of selection or start == end
        if (data.selectionStart !== null && (data.selectionEnd === null || data.selectionStart === data.selectionEnd)) {
            this.element.selectionStart = data.selectionStart;
            this.element.selectionEnd = data.selectionStart;
        } else {
            this.element.setSelectionRange(data.selectionStart!, data.selectionEnd!);
        }
    }

    /**
     * @returns {Line} information about line
     * */
    public lineAt(lineNumber: number): Line | null {
        return this.lines[lineNumber - 1] ?? null;
    }

    /**
     * Insert text at the cursor position.
     * if some content is selected will replace it
     */
    public insert(content: string) {
        if (!this.selection) {
            this.insertAtCursor(content);
            return;
        }
        const start = this.selection.selectionStart;
        const end = this.selection.selectionEnd;
        const newValue = this.value.slice(0, start) + this.normalizeSelection(content) + this.value.slice(end);
        this.setValue(newValue);
    }

    private insertAtCursor(content: string) {
        const cursorAt = this.position.cursorAt;
        const newValue =
            this.value.slice(0, cursorAt) +
            this.normalizeSelection(content) +
            this.value.slice(cursorAt, this.value.length);
        this.setValue(newValue);
    }

    /**
     * Replace all selected lines
     * if nothing is selected will replace the current line
     *
     * @param callback - The map function will be called once for each selected line and will replace the contents of the line with the result of the call
     * @note line is considered as selected even if it is partially selected
     */
    public replaceCurrentLines(
        callback: (this: Cursor, line: Line, index: number, currentLines: Line[]) => string | null,
        options?: { selectReplaced?: boolean },
    ) {
        const { selectReplaced = false } = options ?? {};
        const selectedLines = this.selection?.lines ?? [this.lineAt(this.position.line.lineNumber)!];

        const content = selectedLines
            .map((line, index) => callback.call(this, line, index, selectedLines))
            .filter((ctn) => ctn !== null) // delete line if null
            .join('\n');

        const start = selectedLines[0].startsAt;
        const end = selectedLines[selectedLines.length - 1].endsAt;
        const newValue =
            this.value.slice(0, start) +
            this.normalizeSelection(content, selectReplaced ? 'SELECT_ALL' : 'TO_END') +
            this.value.slice(end);

        this.setValue(newValue);
    }

    /**
     * TODO
     * replace
     */
    public replaceLine(lineNumber: number, content: string | null) {
        const line = this.lineAt(lineNumber);
        if (!line) {
            console.error('Unknown line number: ' + lineNumber);
            return;
        }
        const start = line.startsAt;
        const end = line.endsAt;
        if (content === null) {
            // line should be removed
            this.setValue(this.value.slice(0, start - 1) + MARKER + this.value.slice(end));
            return;
        }
        const newValue = this.value.slice(0, start) + this.normalizeSelection(content) + this.value.slice(end);
        this.setValue(newValue);
    }

    /**
     * Wraps selection inside markup
     */
    public wrap(markup: string | [string, string], options?: WrapOptions) {
        const { unwrap = true, placeholder = '' } = options ?? {};
        const [prefix, suffix] = Array.isArray(markup) ? markup : [markup, markup];
        const text = this.value;
        const start = this.selection?.selectionStart ?? this.position.cursorAt;
        const end = this.selection?.selectionEnd ?? this.position.cursorAt;

        if (this.isSelectedWrappedWith(markup) && unwrap) {
            const content = [
                text.slice(0, start - prefix.length),
                MARKER,
                text.slice(start, end),
                MARKER,
                text.slice(end + suffix.length),
            ].join('');

            this.setValue(content);
            return;
        }

        const content = [
            //
            text.slice(0, start),
            prefix,
            MARKER,
            text.slice(start, end) || placeholder,
            MARKER,
            suffix,
            text.slice(end),
        ].join('');

        this.setValue(content);
    }

    private isSelectedWrappedWith(markup: string | [string, string]) {
        const [prefix, suffix] = Array.isArray(markup) ? markup : [markup, markup];

        const start = this.selection?.selectionStart ?? this.position.cursorAt;
        const end = this.selection?.selectionEnd ?? this.position.cursorAt;

        if (start - prefix.length < 0 || end - 1 + suffix.length > this.value.length - 1) {
            return false;
        }
        const curPrefix = this.value.slice(start - prefix.length, start);
        const curSuffix = this.value.slice(end, end + suffix.length);
        return curPrefix === prefix && curSuffix === suffix;
    }

    public select(options: SelectRange | SelectRelative) {
        const isRange = (opt: SelectRange | SelectRelative): opt is SelectRange => {
            return (
                Object.prototype.hasOwnProperty.call(opt, 'start') && Object.prototype.hasOwnProperty.call(opt, 'end')
            );
        };

        if (isRange(options)) {
            this.element.setSelectionRange(options.start, options.end);
        } else {
            this.element.setSelectionRange(
                this.element.selectionStart + options.fromCurrentStart,
                this.element.selectionEnd + options.fromCurrentEnd,
            );
        }
    }

    private normalizeSelection(text: string, defaultBehavior: 'TO_START' | 'TO_END' | 'SELECT_ALL' = 'TO_END') {
        if (text.includes(MARKER)) {
            return text;
        }

        switch (defaultBehavior) {
            case 'TO_START':
                return `${MARKER}${text}`;
            case 'TO_END':
                return `${text}${MARKER}`;
            case 'SELECT_ALL':
                return `${MARKER}${text}${MARKER}`;
        }
    }

    private execRaw(sourceText: string) {
        const fIndex = sourceText.indexOf(MARKER);
        const lIndex = sourceText.lastIndexOf(MARKER);
        const text = sourceText.replace(new RegExp(MARKER, 'g'), '');
        let selectionStart: null | number = null;
        let selectionEnd: null | number = null;

        // TODO: handle case with more than 2 markers
        if (fIndex !== -1) {
            selectionStart = fIndex;
            selectionEnd = lIndex === -1 || lIndex === fIndex ? null : lIndex - 1;
        }

        return { text, selectionStart, selectionEnd };
    }
}
