import { CommandHandler, CommandHandlerContext } from "./types";
import { clamp, escapeRegExp, getClipboardText } from "./utils";

import { Cursor } from "./Cursor";

// eslint-disable-next-line no-useless-escape
const ANY_URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i;
const ANY_LIST_RE = /^(\s*(-|\*|(\d\.){1,2})\s+)(.+)/;
const ANY_BLANK_LIST_RE = /^(\s*(-|\*|(\d\.){1,2})\s{0,1})$/;

const INDENT_SPACE_SIZE = 4;

export const mapCurrentLine = (element: HTMLTextAreaElement, mapper: (line: string) => string) => {
    const cursor = new Cursor(element);
    const currentLine = cursor.getLine();
    const mappedLine = mapper(currentLine);
    cursor.spliceContent(Cursor.raw`${mappedLine}${Cursor.$}`, { replaceCount: 1 });
};

type SingleLineWrapperOptions = {
    element: HTMLTextAreaElement;
    markup: string;
    placeholder?: string;
    useUnwrapping?: boolean;
};

/**
 * Wraps the current selection in markup within the current line
 * or removes markup if target is already wrapped (with useUnwrapping = true)
 */
export const singleLineWrapper = ({ element, markup, useUnwrapping = true, placeholder = "" }: SingleLineWrapperOptions) => {
    const cursor = new Cursor(element);
    const position = cursor.getCurrentPosition();
    const selected = cursor.getSelected().split("\n")[0];
    const currentLine = cursor.getLine();

    if (!selected) {
        const before = currentLine.slice(0, position.lineSelectionStart);
        const after = currentLine.slice(position.lineSelectionStart);

        const raw = Cursor.raw`${before}${markup}${Cursor.$}${placeholder}${Cursor.$}${markup}${after}`;
        cursor.spliceContent(raw, { replaceCount: 1 });
        return;
    }

    const clumpLine = (value: number) => clamp(value, 0, currentLine.length);

    const start = position.lineSelectionStart;
    const end = position.lineSelectionEnd;

    const needUnwrap = useUnwrapping && currentLine && isTargetAlreadyWrapped(element, markup);

    const before = currentLine.slice(0, clumpLine(start + (needUnwrap ? -markup.length : 0)));
    const after = currentLine.slice(clumpLine(end + (needUnwrap ? markup.length : 0)));
    const onDemandMarkup = needUnwrap ? "" : markup;

    const content = selected || placeholder;
    const raw = Cursor.raw`${before}${onDemandMarkup}${Cursor.$}${content}${Cursor.$}${onDemandMarkup}${after}`;
    cursor.spliceContent(raw, { replaceCount: 1 });
};

export const linkCommandHandler: CommandHandler = (ctx) => {
    // Create a cursor instance it will be the our
    // core-service for manipulations with textarea
    const cursor = new Cursor(ctx.element);

    // Getting range of selection for current line
    const { lineSelectionStart, lineSelectionEnd } = cursor.getCurrentPosition();

    // Getting the current line
    const currentLine = cursor.getLine();

    // Getting the current selected text
    const selected = currentLine.slice(lineSelectionStart, lineSelectionEnd);

    // Slice text before and after selection
    const after = currentLine.slice(0, lineSelectionStart);
    const before = currentLine.slice(lineSelectionEnd);

    const linkPlaceholder = "example";
    const urlPlaceholder = "url";

    const linkText = selected || linkPlaceholder;

    // Now we can build text for current line. in this tagged bellow template just a
    // bunch of concatenated strings except "Cursor.$" - it is a special marker for
    // showing selection range declarative, in this case we want to select the "linkText"
    const raw = Cursor.raw`${before}[${Cursor.$}${linkText}${Cursor.$}](${urlPlaceholder})${after}`;

    // Finally we can make "spliceContent" - this function receive "raw" result and
    // options object, where you can specify start lineNumber and how many lines
    // you need to replace (similar to Array.prototype.splice mechanic)
    // in this case we need to start from current line (default) and replace 1 line
    // which means just replace the current line
    cursor.spliceContent(raw, { replaceCount: 1 });

    // -------------------------------------- PS ----------------------------------------
    // You can use one or two "Cursor.$". One will show the position of the cursor
    // with two you specify a selection range
    // ----------------------------------------------------------------------------------
};

/**
 * Checks if target is wrapped in markup
 */
const isTargetAlreadyWrapped = (element: HTMLTextAreaElement, markup: string) => {
    const cursor = new Cursor(element);
    const currentLine = cursor.getLine();
    const position = cursor.getCurrentPosition();
    const clumpLine = (value: number) => clamp(value, 0, currentLine.length);
    const escapedMarkup = escapeRegExp(markup);
    const offsettedTarget = currentLine.slice(
        clumpLine(position.lineSelectionStart - markup.length),
        clumpLine(position.lineSelectionEnd + markup.length)
    );
    const re = new RegExp(`${escapedMarkup}.+${escapedMarkup}`, "gi");
    return re.test(offsettedTarget);
};

export const nextLineCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);

    const insertListPrefixOnDemand = () => {
        const position = cursor.getCurrentPosition();
        const prevLine = cursor.getLine(position.lineNumber - 1) || "";
        const currentLine = cursor.getLine();
        const listMatch = ANY_LIST_RE.exec(prevLine);

        if (listMatch === null) {
            return;
        }

        const [, , prefix] = listMatch;

        const getNewLinePrefix = () => {
            const increaseOrder = () => {
                const splited = prefix.split(".");
                splited[splited.length - 2] = String(parseInt(splited[splited.length - 2]) + 1);
                return splited.join(".");
            };
            return (isNaN(parseFloat(prefix)) ? prefix : increaseOrder()).trimStart();
        };

        const indent = " ".repeat(cursor.getIndentSize(position.lineNumber - 1));

        const raw = Cursor.raw`${indent}${getNewLinePrefix()} ${currentLine}${Cursor.$}`;
        cursor.spliceContent(raw, {
            startLineNumber: position.lineNumber,
            replaceCount: 1,
        });
    };

    // waiting enter default behaver will be handled
    setTimeout(insertListPrefixOnDemand, 0);
};

export const indentCommandHandler: CommandHandler = ({ element, keyEvent, options }) => {
    const cursor = new Cursor(element);

    keyEvent?.preventDefault();

    const currentLine = cursor.getLine();
    const listMatch = ANY_BLANK_LIST_RE.exec(currentLine);
    const indent = " ".repeat(INDENT_SPACE_SIZE + cursor.getIndentSize());
    if (options.useListTabulation && listMatch) {
        const [, , prefix] = listMatch;
        const newPrefix = !isNaN(parseFloat(prefix)) && prefix.split(".").length <= 2 ? prefix + "1." : prefix;
        cursor.spliceContent(Cursor.raw`${indent}${newPrefix} ${Cursor.$}`, { replaceCount: 1 });
        return;
    }

    cursor.spliceContent(Cursor.raw`${currentLine}${indent}${Cursor.$}`, { replaceCount: 1 });
};

export const linkPasteCommandHandler = async (ctx: CommandHandlerContext) => {
    const cursor = new Cursor(ctx.element);

    const position = cursor.getCurrentPosition();
    const currentLine = cursor.getLine(position.lineNumber);

    const isSelectedUrl = ANY_URL_RE.test(currentLine.slice(position.lineSelectionStart, position.lineSelectionEnd));
    const selected = cursor.getSelected();

    const isSelectedInLinkMarkup = (() => {
        const before = currentLine.slice(0, position.lineSelectionStart);
        const after = currentLine.slice(position.lineSelectionEnd);
        return /\[.*\]\($/gi.test(before) && /^\)/gi.test(after);
    })();

    if (!selected || isSelectedInLinkMarkup || isSelectedUrl) {
        return;
    }

    const pastedValue = await getClipboardText().then((x) => x?.trim());

    if (!pastedValue || !ANY_URL_RE.test(pastedValue)) {
        return;
    }

    const before = currentLine.slice(0, position.lineSelectionStart);
    const after = currentLine.slice(position.lineSelectionEnd);
    const raw = Cursor.raw`${before}[${Cursor.$}${selected}${Cursor.$}](${pastedValue})${after}`;

    cursor.spliceContent(raw, { replaceCount: 1 });
};

export const codeBlockCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);
    const position = cursor.getCurrentPosition();
    const selected = cursor.getSelected();
    const currentLine = cursor.getLine();
    const markup = "```";

    const isAlreadyWrapper = () => {
        const beforeLine = cursor.getLine(position.lineNumber - 1);
        const afterLine = cursor.getLine(position.lineNumberEnd + 1);
        return selected && beforeLine === markup && afterLine === markup;
    };

    if (isAlreadyWrapper()) {
        cursor.removeLines(position.lineNumber - 1, position.lineNumberEnd + 1);
        return;
    }

    const prefix = currentLine && !selected ? "\n" : "";
    const content = selected || "code block";
    const raw = Cursor.raw`${prefix}${markup}\n${Cursor.$}${content}${Cursor.$}\n${markup}`;

    cursor.spliceContent(raw, {
        replaceCount: selected.split("\n").length,
        startLineNumber: position.lineNumber,
    });
};

export const codeSelectedCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);
    const selected = cursor.getSelected();
    if (selected === "") {
        codeInlineCommandHandler(ctx);
        return;
    }
    if (selected.includes("\n")) {
        codeBlockCommandHandler(ctx);
    } else {
        codeInlineCommandHandler(ctx);
    }
};

export const boldCommandHandler: CommandHandler = (ctx) => {
    singleLineWrapper({ ...ctx, placeholder: "bold", markup: ctx.options.boldSyntax });
};

export const italicCommandHandler: CommandHandler = (ctx) => {
    singleLineWrapper({ ...ctx, placeholder: "italic", markup: ctx.options.italicSyntax });
};

export const createHeadlineCommandHandler =
    (level: number): CommandHandler =>
    (ctx) => {
        const prefix = "#".repeat(clamp(level, 1, 6)) + " ";
        mapCurrentLine(ctx.element, (line) => prefix + line.replace(/^#{0,6}\s+/g, ""));
    };

export const orderedListCommandHandler: CommandHandler = (ctx) => {
    mapCurrentLine(ctx.element, (line) => "1. " + line);
};

export const unorderedListCommandHandler: CommandHandler = (ctx) => {
    mapCurrentLine(ctx.element, (line) => `${ctx.options.unorderedListSyntax} ` + line);
};

export const blockQuotesCommandHandler: CommandHandler = (ctx) => {
    mapCurrentLine(ctx.element, (line) => "> " + line);
};

export const codeInlineCommandHandler: CommandHandler = (ctx) => {
    singleLineWrapper({ ...ctx, placeholder: "code", markup: "`" });
};
export const strikeThroughCommandHandler: CommandHandler = (ctx) => {
    singleLineWrapper({ ...ctx, placeholder: "strike-through", markup: "~~" });
};
