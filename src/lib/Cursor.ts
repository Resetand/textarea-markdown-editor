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
        let currentLength = 0;
        return this.value.split('\n').reduce<Line[]>((lines, content, index, arr) => {
            const lineNumber = index + 1;
            const isLastLine = index === arr.length - 1;
            const lineLength = content.length + Number(!isLastLine);

            const startsAt = currentLength;
            const endsAt = startsAt + lineLength - Number(!isLastLine);

            currentLength += lineLength;

            lines.push({
                text: content,
                lineNumber,
                startsAt,
                endsAt,
            });

            return lines;
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
        // Ensure textarea is focused - required for execCommand and preserving selection
        this.element.focus();

        const normalizedContent = this.normalizeSelection(content);
        if (!this.selection) {
            this.insertAtCursor(content);
            return;
        }
        const start = this.selection.selectionStart;
        const end = this.selection.selectionEnd;

        // PATCH: Use surgical insertion - only replace selected range
        const data = this.execRaw(normalizedContent);
        if (process.env.NODE_ENV === 'test') {
            const newValue = this.value.slice(0, start) + data.text + this.value.slice(end);
            this.element.value = newValue;
        } else {
            // Pass selection range to fireInput for surgical replacement
            fireInput(this.element, data.text, start, end);
        }

        // Set cursor position after inserted text
        if (data.selectionStart !== null && data.selectionEnd !== null) {
            const offset = start;
            this.element.selectionStart = offset + data.selectionStart;
            this.element.selectionEnd = offset + data.selectionEnd;
        }
    }

    private insertAtCursor(content: string) {
        const cursorAt = this.position.cursorAt;
        const normalizedContent = this.normalizeSelection(content);

        // PATCH: Use surgical insertion at cursor position
        const data = this.execRaw(normalizedContent);
        if (process.env.NODE_ENV === 'test') {
            const newValue = this.value.slice(0, cursorAt) + data.text + this.value.slice(cursorAt);
            this.element.value = newValue;
        } else {
            // Insert at cursor (replace zero-length selection)
            fireInput(this.element, data.text, cursorAt, cursorAt);
        }

        // Set cursor position after inserted text
        if (data.selectionStart !== null) {
            this.element.selectionStart = cursorAt + data.selectionStart;
            this.element.selectionEnd = cursorAt + (data.selectionEnd ?? data.selectionStart);
        }
    }

    /**
     * Insert content and scroll it into view if it's below the visible area
     * @param forceManual - Force manual value manipulation instead of execCommand (for Firefox file inputs)
     */
    public insertAndScrollIntoView(content: string) {
        const cursorPositionBefore = this.element.selectionStart;
        this.insert(content);

        // Scroll into view if inserted content is below visible area
        const textarea = this.element;
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
        const cursorLine = textarea.value.substring(0, cursorPositionBefore).split('\n').length;
        const cursorPixelPosition = cursorLine * lineHeight;
        const visibleBottom = textarea.scrollTop + textarea.clientHeight;

        if (cursorPixelPosition > visibleBottom) {
            // Content is below visible area, scroll it into view
            textarea.scrollTop = cursorPixelPosition - textarea.clientHeight + lineHeight * 2;
        }
    }

    /**
     * Find and replace text while preserving scroll position
     * @param searchText - Text to find
     * @param replacement - Text to replace with
     */
    public replace(searchText: string, replacement: string) {
        const searchStart = this.value.indexOf(searchText);
        if (searchStart === -1) {
            return; // Text not found
        }
        const searchEnd = searchStart + searchText.length;

        // Preserve scroll position
        const savedScrollTop = this.element.scrollTop;

        // Ensure textarea is focused - required for execCommand in Firefox
        // especially after focus loss from file dialogs
        this.element.focus();

        fireInput(this.element, replacement, searchStart, searchEnd);
        this.element.scrollTop = savedScrollTop;
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
        // Ensure textarea is focused - required for execCommand and preserving selection
        this.element.focus();

        const { selectReplaced = false } = options ?? {};
        const selectedLines = this.selection?.lines ?? [this.lineAt(this.position.line.lineNumber)!];

        const content = selectedLines
            .map((line, index) => callback.call(this, line, index, selectedLines))
            .filter((ctn) => ctn !== null) // delete line if null
            .join('\n');

        const start = selectedLines[0].startsAt;
        const end = selectedLines[selectedLines.length - 1].endsAt;

        // PATCH: Use surgical insertion instead of setValue to avoid scroll jumps
        const data = this.execRaw(this.normalizeSelection(content, selectReplaced ? 'SELECT_ALL' : 'TO_END'));
        fireInput(this.element, data.text, start, end);

        // Set cursor position after replaced text
        if (data.selectionStart !== null && data.selectionEnd !== null) {
            this.element.selectionStart = start + data.selectionStart;
            this.element.selectionEnd = start + data.selectionEnd;
        }
    }

    /**
     * TODO
     * replace
     */
    public replaceLine(lineNumber: number, content: string | null) {
        // Ensure textarea is focused - required for execCommand and preserving selection
        this.element.focus();

        const line = this.lineAt(lineNumber);
        if (!line) {
            console.error('Unknown line number: ' + lineNumber);
            return;
        }
        const start = line.startsAt;
        const end = line.endsAt;
        if (content === null) {
            // PATCH: line should be removed - use surgical deletion
            const data = this.execRaw('');
            // Remove from start-1 (including newline) to end
            fireInput(this.element, data.text, start - 1, end);
            // Set cursor position
            if (data.selectionStart !== null) {
                this.element.selectionStart = start - 1 + data.selectionStart;
                this.element.selectionEnd = start - 1 + data.selectionStart;
            }
            return;
        }

        // PATCH: Use surgical insertion instead of setValue
        const data = this.execRaw(this.normalizeSelection(content));
        fireInput(this.element, data.text, start, end);

        // Set cursor position after replaced text
        if (data.selectionStart !== null && data.selectionEnd !== null) {
            this.element.selectionStart = start + data.selectionStart;
            this.element.selectionEnd = start + data.selectionEnd;
        }
    }

    /**
     * Wraps selection inside markup
     */
    public wrap(markup: string | [string, string], options?: WrapOptions) {
        // Ensure textarea is focused - required for execCommand and preserving selection
        this.element.focus();

        const { unwrap = true, placeholder = '' } = options ?? {};
        const [prefix, suffix] = Array.isArray(markup) ? markup : [markup, markup];
        const text = this.value;
        const start = this.selection?.selectionStart ?? this.position.cursorAt;
        const end = this.selection?.selectionEnd ?? this.position.cursorAt;

        if (this.isSelectedWrappedWith(markup) && unwrap) {
            // PATCH: Unwrap - use surgical replacement with MARKERs for cursor positioning
            const unwrappedContent = MARKER + text.slice(start, end) + MARKER;
            const data = this.execRaw(unwrappedContent);
            // Replace from (start - prefix.length) to (end + suffix.length)
            fireInput(this.element, data.text, start - prefix.length, end + suffix.length);

            // Set cursor position
            if (data.selectionStart !== null && data.selectionEnd !== null) {
                const offset = start - prefix.length;
                this.element.selectionStart = offset + data.selectionStart;
                this.element.selectionEnd = offset + data.selectionEnd;
            }
            return;
        }

        // PATCH: Wrap - use surgical replacement with MARKERs for cursor positioning
        const wrappedContent = prefix + MARKER + (text.slice(start, end) || placeholder) + MARKER + suffix;
        const data = this.execRaw(wrappedContent);
        fireInput(this.element, data.text, start, end);

        // Set cursor position
        if (data.selectionStart !== null && data.selectionEnd !== null) {
            this.element.selectionStart = start + data.selectionStart;
            this.element.selectionEnd = start + data.selectionEnd;
        }
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
        if ('start' in options && 'end' in options) {
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

    private execRaw(text: string) {
        const fIndex = text.indexOf(MARKER);
        const lIndex = text.lastIndexOf(MARKER);
        if (fIndex !== -1 && lIndex !== -1) {
            text = text.replace(new RegExp(MARKER, 'g'), '');
        }
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
