import { clamp, escapeRegExp } from "./utils";

const reactTriggerChange = require("react-trigger-change");
export type SelectionDirectionType = "backward" | "forward" | "none";

export type TextAreaPosition = {
    lineNumber: number;
    lineNumberEnd: number;
    lineSelectionStart: number;
    lineSelectionEnd: number;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection?: SelectionDirectionType;
};

const selectionSymbol = Symbol("selection position");

const rawParser = (strings: TemplateStringsArray, ...tags: (symbol | string)[]) => {
    type SelectionsConfig = Pick<TextareaRawParsed, "currentSelectionEnd" | "currentSelectionStart">;
    const hash = String(Date.now());

    const rawStrings = strings.map((c, index) => {
        const isSelection = tags[index] === selectionSymbol;
        return c + (isSelection ? hash : typeof tags[index] === "string" ? String(tags[index]) : "");
    });

    const prepared = rawStrings.join("");
    const parts = prepared.split(hash);
    const content = parts.join("");
    const selectionsTag = tags.filter((x) => x === selectionSymbol);

    const selections = parts.reduce<[SelectionsConfig, number]>(
        ([config, totalLength], text, index) => {
            const selection = selectionsTag[index];
            if (selection === selectionSymbol) {
                if (config.currentSelectionStart === undefined) {
                    config.currentSelectionStart = totalLength + text.length;
                } else if (config.currentSelectionEnd === undefined) {
                    config.currentSelectionEnd = totalLength + text.length;
                }
            }
            return [config, totalLength + text.length];
        },
        [{}, 0]
    )[0];

    return { content, ...selections };
};

type SpliceContentOptions = {
    startLineNumber?: number;
    replaceCount?: number;
};

type TextareaRawParsed = {
    content: string;
    currentSelectionStart?: number;
    currentSelectionEnd?: number;
};

/**
 * Service for manipulation with textarea content and text selection
 */
export class Cursor {
    public constructor(private element: HTMLTextAreaElement) {}

    static readonly $ = selectionSymbol;
    static readonly raw = rawParser;

    public getLine = (lineNumber?: number): string => {
        const ensureLineNumber = lineNumber ?? this.getCurrentPosition().lineNumber;
        const lines = this.element.value.split("\n");
        const line = lines[ensureLineNumber];
        return line?.endsWith("\n") ? line?.slice(0, -1) : line;
    };

    /** Gets an indent size on `lineNumber` (`lineNumber` is current line by default) */
    public getIndentSize = (lineNumber?: number): number => {
        return this.getLine(lineNumber).match(/^\s*/)?.[0].length ?? 0;
    };

    /** Gets current verbose position config
     *
     * @returns `config.lineNumber` = cursor position line or start of selection position if selected)
     * @returns `config.lineNumberEnd` = cursor position line or end of selection position if selected)
     * @returns `config.lineSelectionStart` = start index of selection within the current line
     * @returns `config.lineSelectionEnd` = end index of selection within the current line
     * @returns `config.selectionStart` = start index of selection within the textarea content
     * @returns `config.selectionEnd` = end index of selection within the textarea content
     * @returns `config.selectionDirection` = direction of selection `"backward" | "forward" | "none"`
     */
    public getCurrentPosition = (): TextAreaPosition => {
        const getTextLines = (tillPosition: number) => {
            return this.element.value
                .slice(0, tillPosition)
                .split("\n")
                .map((x) => x + "\n");
        };

        const clampByLine = (value: number, lineNumber: number) => clamp(value, 0, this.getLine(lineNumber).length);

        const tillStartTextLines = getTextLines(this.element.selectionStart);
        const tillStartEndLines = getTextLines(this.element.selectionEnd);

        const lineNumber = tillStartTextLines.length - 1;
        const lineNumberEnd = tillStartEndLines.length - 1;
        const selectionSize = this.element.selectionEnd - this.element.selectionStart;
        const lineSelectionStart = clampByLine(this.element.selectionStart - tillStartTextLines.slice(0, -1).join("").length, lineNumber);
        const lineSelectionEnd = clampByLine(lineSelectionStart + selectionSize, lineNumber);

        return {
            lineNumber,
            lineNumberEnd,
            lineSelectionEnd,
            lineSelectionStart,
            selectionDirection: this.element.selectionDirection,
            selectionStart: this.element.selectionStart,
            selectionEnd: this.element.selectionEnd,
        };
    };

    /** textarea value content getter */
    public getText = () => this.element.value;

    /** set textarea text and trigger event */
    public setText = (value: string) => {
        if (document.activeElement !== this.element) {
            this.element.focus();
        }
        this.element.value = value;
        reactTriggerChange(this.element);
    };

    public getSelected = () => {
        const position = this.getCurrentPosition();
        return this.getText().slice(position.selectionStart, position.selectionEnd);
    };

    public spliceContent = (parsedRaw: TextareaRawParsed | null, options: SpliceContentOptions = {}) => {
        const text = this.getText();
        const lines = text.split("\n");
        const position = this.getCurrentPosition();
        const { replaceCount = 0, startLineNumber = position.lineNumber } = options;
        const { content = "", currentSelectionStart = 0, currentSelectionEnd } = parsedRaw ?? {};
        const linesBefore = lines.slice(0, startLineNumber);
        const linesAfter = lines.slice(startLineNumber + replaceCount);
        const currentLines = content.split("\n");
        const joined = [...linesBefore, ...currentLines, ...linesAfter].join("\n");

        this.setText(joined);

        const charsBeforeLength = linesBefore.map((x) => x.concat("\n")).join("").length;

        const selectionStart = currentSelectionStart + charsBeforeLength;
        const selectionEnd = (currentSelectionEnd ?? currentSelectionStart) + charsBeforeLength;

        this.element.setSelectionRange(selectionStart, selectionEnd);
    };

    public removeLines = (...lineNumbers: number[]) => {
        const text = this.getText();
        const lines = text.split("\n").filter((_, index) => !lineNumbers.includes(index));
        this.setText(lines.join("\n"));
    };

    /**
     * Inserts `prefix` to the current line
     */
    public insertPrefix = (prefix: string, options: { placeholder?: string; useUnprefix?: boolean; replaceBefore?: RegExp | boolean }) => {
        const { placeholder = "", useUnprefix = true, replaceBefore = false } = options;

        const currentLine = this.getLine();

        if (!currentLine) {
            const raw = Cursor.raw`${prefix}${Cursor.$}${placeholder}${Cursor.$}`;
            this.spliceContent(raw, { replaceCount: 1 });
            return;
        }

        const prefixPattern = new RegExp(`^${escapeRegExp(prefix)}`);

        if (useUnprefix && prefixPattern.test(currentLine)) {
            const raw = Cursor.raw`${currentLine.replace(prefixPattern, "")}${Cursor.$}`;
            this.spliceContent(raw, { replaceCount: 1 });
            return;
        }

        if (replaceBefore) {
            const pattern = replaceBefore === true ? new RegExp(`^${escapeRegExp(prefix)}`) : replaceBefore;
            const raw = Cursor.raw`${prefix}${currentLine.replace(pattern, "")}${Cursor.$}`;
            this.spliceContent(raw, { replaceCount: 1 });
            return;
        }
        this.spliceContent(Cursor.raw`${prefix}${currentLine}${Cursor.$}`, { replaceCount: 1 });
    };

    /**
     * Wraps the current selection in `markup`
     * or removes markup if target is already wrapped (with useUnwrapping = true)
     *
     * if there is no selection area - insert wrapped placeholder instead
     */
    public wrapSelected = (markup: string, options: { useUnwrapping?: boolean; placeholder?: string; multiline?: boolean }) => {
        if (options.multiline) {
            this.wrapMultiLineSelected(markup, options);
        } else {
            this.wrapSingleLineSelected(markup, options);
        }
    };

    private wrapSingleLineSelected = (markup: string, options: { useUnwrapping?: boolean; placeholder?: string }) => {
        const isAlreadyWrapped = () => {
            const currentLine = this.getLine();
            const position = this.getCurrentPosition();
            const clumpLine = (value: number) => clamp(value, 0, currentLine.length);
            const prefix = currentLine.slice(clumpLine(position.lineSelectionStart - markup.length), position.lineSelectionStart);
            const suffix = currentLine.slice(position.lineSelectionEnd, clumpLine(position.lineSelectionEnd + markup.length));
            return prefix === markup && suffix === markup;
        };

        const { placeholder = "", useUnwrapping = true } = options;
        const position = this.getCurrentPosition();
        const selected = this.getSelected().split("\n")[0];
        const currentLine = this.getLine();

        if (!selected) {
            const before = currentLine.slice(0, position.lineSelectionStart);
            const after = currentLine.slice(position.lineSelectionStart);

            const raw = Cursor.raw`${before}${markup}${Cursor.$}${placeholder}${Cursor.$}${markup}${after}`;
            this.spliceContent(raw, { replaceCount: 1 });
            return;
        }

        const clumpLine = (value: number) => clamp(value, 0, currentLine.length);

        const start = position.lineSelectionStart;
        const end = position.lineSelectionEnd;

        const needUnwrap = useUnwrapping && currentLine && isAlreadyWrapped();

        const before = currentLine.slice(0, clumpLine(start + (needUnwrap ? -markup.length : 0)));
        const after = currentLine.slice(clumpLine(end + (needUnwrap ? markup.length : 0)));
        const onDemandMarkup = needUnwrap ? "" : markup;

        const content = selected || placeholder;
        const raw = Cursor.raw`${before}${onDemandMarkup}${Cursor.$}${content}${Cursor.$}${onDemandMarkup}${after}`;
        this.spliceContent(raw, { replaceCount: 1 });
    };

    private wrapMultiLineSelected = (markup: string, options: { useUnwrapping?: boolean; placeholder?: string }) => {
        const { placeholder = "", useUnwrapping = true } = options;
        const position = this.getCurrentPosition();
        const selected = this.getSelected();
        const currentLine = this.getLine();

        const isAlreadyWrapper = () => {
            const beforeLine = this.getLine(position.lineNumber - 1);
            const afterLine = this.getLine(position.lineNumberEnd + 1);
            return selected && beforeLine === markup && afterLine === markup;
        };

        if (isAlreadyWrapper() && useUnwrapping) {
            this.removeLines(position.lineNumber - 1, position.lineNumberEnd + 1);
            return;
        }

        const prefix = currentLine && !selected ? "\n" : "";
        const content = selected || placeholder;

        const raw = Cursor.raw`${prefix}${markup}\n${Cursor.$}${content}${Cursor.$}\n${markup}`;

        this.spliceContent(raw, {
            replaceCount: selected.split("\n").length,
            startLineNumber: position.lineNumber,
        });
    };
}
