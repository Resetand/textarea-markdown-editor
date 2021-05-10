export declare type SelectionDirectionType = "backward" | "forward" | "none";
export declare type TextAreaPosition = {
    lineNumber: number;
    lineNumberEnd: number;
    lineSelectionStart: number;
    lineSelectionEnd: number;
    selectionStart: number;
    selectionEnd: number;
    selectionDirection?: SelectionDirectionType;
};
declare type SpliceContentOptions = {
    startLineNumber?: number;
    replaceCount?: number;
};
declare type TextareaRawParsed = {
    content: string;
    currentSelectionStart?: number;
    currentSelectionEnd?: number;
};
/**
 * Service for manipulation with textarea content and text selection
 */
export declare class Cursor {
    private element;
    constructor(element: HTMLTextAreaElement);
    static readonly $: symbol;
    static readonly raw: (strings: TemplateStringsArray, ...tags: (string | symbol)[]) => {
        currentSelectionEnd?: number | undefined;
        currentSelectionStart?: number | undefined;
        content: string;
    };
    getLine: (lineNumber?: number | undefined) => string;
    getIndentSize: (lineNumber?: number | undefined) => number;
    getCurrentPosition: () => TextAreaPosition;
    getValue: () => string;
    setValue: (value: string) => void;
    getSelected: () => string;
    spliceContent: (parsedRaw: TextareaRawParsed | null, options?: SpliceContentOptions) => void;
    removeLines: (...lineNumbers: number[]) => void;
}
export {};
