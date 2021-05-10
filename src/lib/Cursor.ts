import { clamp } from "./utils";

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

    public getIndentSize = (lineNumber?: number): number => {
        return this.getLine(lineNumber).match(/^\s*/)?.[0].length ?? 0;
    };

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

    public getValue = () => this.element.value;

    public setValue = (value: string) => {
        if (document.activeElement !== this.element) {
            this.element.focus();
        }
        this.element.value = value;
        reactTriggerChange(this.element);
    };

    public getSelected = () => {
        const position = this.getCurrentPosition();
        return this.getValue().slice(position.selectionStart, position.selectionEnd);
    };

    public spliceContent = (parsedRaw: TextareaRawParsed | null, options: SpliceContentOptions = {}) => {
        const text = this.getValue();
        const lines = text.split("\n");
        const position = this.getCurrentPosition();
        const { replaceCount = 0, startLineNumber = position.lineNumber } = options;
        const { content = "", currentSelectionStart = 0, currentSelectionEnd } = parsedRaw ?? {};
        const linesBefore = lines.slice(0, startLineNumber);
        const linesAfter = lines.slice(startLineNumber + replaceCount);
        const currentLines = content.split("\n");
        const joined = [...linesBefore, ...currentLines, ...linesAfter].join("\n");

        this.setValue(joined);

        const charsBeforeLength = linesBefore.map((x) => x.concat("\n")).join("").length;

        const selectionStart = currentSelectionStart + charsBeforeLength;
        const selectionEnd = (currentSelectionEnd ?? currentSelectionStart) + charsBeforeLength;

        this.element.setSelectionRange(selectionStart, selectionEnd);
    };

    public removeLines = (...lineNumbers: number[]) => {
        const text = this.getValue();
        const lines = text.split("\n").filter((_, index) => !lineNumbers.includes(index));
        this.setValue(lines.join("\n"));
    };
}
