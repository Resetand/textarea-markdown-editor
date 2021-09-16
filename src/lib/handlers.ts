import { CommandHandler, CommandHandlerContext } from "./types";
import { clamp, escapeRegExp, getClipboardText, trimChars } from "./utils";

import { Cursor } from "./Cursor";

// eslint-disable-next-line no-useless-escape
const ANY_URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i;
const ANY_IMAGE_URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?\.(png|tiff|tif|bmp|jpg|jpeg|gif|eps|webp|bmp|dib|svg)$/i;
const ANY_SEQUENCE_RE = /^(\s*(-|\*|>|(\d+\.){1,2})\s+)(.+)/;
const ANY_BLANK_SEQUENCE_RE = /^(\s*(-|\*|>|(\d+\.){1,2})\s{0,1})$/;

const INDENT_SPACE_SIZE = 4;

export const linkCommandHandler: CommandHandler = (ctx) => {
    // Create a cursor instance it will be the our
    // core-service for manipulations with textarea
    const cursor = new Cursor(ctx.element);

    cursor.getCurrentPosition().lineNumberEnd;

    // Getting range of selection for current line
    const { lineSelectionStart, lineSelectionEnd } = cursor.getCurrentPosition();

    // Getting the current line
    const currentLine = cursor.getLine();

    // Getting the current selected text
    const selected = currentLine.slice(lineSelectionStart, lineSelectionEnd);

    // Slice text before and after selection
    const before = currentLine.slice(0, lineSelectionStart);
    const after = currentLine.slice(lineSelectionEnd);

    const linkPlaceholder = "example";
    const urlPlaceholder = "url";

    const linkText = selected || linkPlaceholder;

    // Now we can build text for current line. in this tagged bellow template just a
    // bunch of concatenated strings except "Cursor.$" - it is a special marker for
    // showing selection range declarative, in this case we want to select the "urlPlaceholder"
    const raw = Cursor.raw`${before}[${linkText}](${Cursor.$}${urlPlaceholder}${Cursor.$})${after}`;

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

export const imageCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);
    const { lineSelectionStart, lineSelectionEnd } = cursor.getCurrentPosition();
    const currentLine = cursor.getLine();
    const before = currentLine.slice(0, lineSelectionStart);
    const after = currentLine.slice(lineSelectionEnd);

    const placeholder = "image";
    const url = cursor.getSelected() || "image.png";

    const raw = Cursor.raw`${before}![${placeholder}](${Cursor.$}${url}${Cursor.$})${after}`;

    cursor.spliceContent(raw, { replaceCount: 1 });
};

export const nextLineCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);

    const insertListPrefixOnDemand = () => {
        const position = cursor.getCurrentPosition();
        const prevLine = cursor.getLine(position.lineNumber - 1) || "";
        const currentLine = cursor.getLine();
        const listMatch = ANY_SEQUENCE_RE.exec(prevLine);

        if (ANY_BLANK_SEQUENCE_RE.test(prevLine)) {
            // replace by empty string
            cursor.removeLines(position.lineNumber);
            cursor.spliceContent(Cursor.raw`\n${Cursor.$}`, {
                startLineNumber: position.lineNumber - 1,
                replaceCount: 1,
            });

            return;
        }

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
    const listMatch = ANY_BLANK_SEQUENCE_RE.exec(currentLine);
    const indent = " ".repeat(INDENT_SPACE_SIZE);
    const { lineSelectionStart, lineSelectionEnd } = cursor.getCurrentPosition();

    if (options.useListTabulation && listMatch && cursor.getIndentSize() === 0 && !/^>(\s)*/.test(currentLine)) {
        const [, , prefix] = listMatch;
        const newPrefix =
            !isNaN(parseFloat(prefix)) && prefix.split(".").length <= 2 ? clamp(parseInt(prefix) - 1, 1, Infinity) + ".1." : prefix;
        cursor.spliceContent(Cursor.raw`${indent}${newPrefix} ${Cursor.$}`, { replaceCount: 1 });
        return;
    }

    const raw = Cursor.raw`${currentLine.slice(0, lineSelectionStart)}${indent}${Cursor.$}${currentLine.slice(lineSelectionEnd)}`;
    cursor.spliceContent(raw, { replaceCount: 1 });
};

export const unindentCommandHandler: CommandHandler = ({ element, keyEvent, options }) => {
    const cursor = new Cursor(element);

    keyEvent?.preventDefault();

    const currentLine = cursor.getLine();
    const tabulatedOrderedListRe = /^\s+(\d\.\d\.).*$/;

    let resultLine = currentLine.slice(clamp(INDENT_SPACE_SIZE, 0, cursor.getIndentSize()));

    if (options.useListTabulation && tabulatedOrderedListRe.test(currentLine)) {
        const [, prefix] = currentLine.match(tabulatedOrderedListRe) ?? [];
        const newPrefix =
            prefix
                .split(".")
                .slice(0, -1)
                .map((x) => String(parseInt(x) + 1))
                .slice(0, -1)
                .join(".") + ".";

        resultLine = resultLine.replace(prefix, newPrefix);
    }

    cursor.spliceContent(Cursor.raw`${resultLine}${Cursor.$}`, { replaceCount: 1 });
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
    const isImage = ANY_IMAGE_URL_RE.test(pastedValue);
    const raw = Cursor.raw`${before}${isImage ? "!" : ""}[${Cursor.$}${selected}${Cursor.$}](${pastedValue})${after}`;

    cursor.spliceContent(raw, { replaceCount: 1 });
};

export const codeBlockCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);
    cursor.wrapSelected("```", {
        multiline: true,
        placeholder: ctx.options.codeBlockPlaceholder,
    });
};

export const codeSelectedCommandHandler: CommandHandler = (ctx) => {
    const cursor = new Cursor(ctx.element);
    const selected = cursor.getSelected();

    if (selected.includes("\n")) {
        codeBlockCommandHandler(ctx);
    } else {
        codeInlineCommandHandler(ctx);
    }
};

export const boldCommandHandler: CommandHandler = ({ element, options }) => {
    new Cursor(element).wrapSelected(options.boldSyntax, {
        placeholder: options.boldPlaceholder,
    });
};

export const italicCommandHandler: CommandHandler = ({ element, options }) => {
    new Cursor(element).wrapSelected(options.italicSyntax, {
        placeholder: options.italicPlaceholder,
    });
};

export const createHeadlineCommandHandler =
    (level: number): CommandHandler =>
    (ctx) => {
        const prefix = "#".repeat(clamp(level, 1, 6)) + " ";
        const { headlinePlaceholder } = ctx.options;
        const placeholder = headlinePlaceholder instanceof Function ? headlinePlaceholder(level) : headlinePlaceholder;
        new Cursor(ctx.element).insertPrefix(prefix, {
            placeholder,
            replaceBefore: /^#{0,6}\s+/,
        });
    };

export const orderedListCommandHandler: CommandHandler = (ctx) => {
    new Cursor(ctx.element).insertPrefix("1. ", {
        placeholder: ctx.options.orderedListPlaceholder,
    });
};

export const unorderedListCommandHandler: CommandHandler = (ctx) => {
    new Cursor(ctx.element).insertPrefix(`${ctx.options.unorderedListSyntax} `, {
        placeholder: ctx.options.unorderedListPlaceholder,
    });
};

export const blockQuotesCommandHandler: CommandHandler = (ctx) => {
    new Cursor(ctx.element).insertPrefix("> ", {
        placeholder: ctx.options.blockQuotesPlaceholder,
    });
};

export const codeInlineCommandHandler: CommandHandler = (ctx) => {
    new Cursor(ctx.element).wrapSelected("`", {
        placeholder: ctx.options.codeInlinePlaceholder,
    });
};
export const strikeThroughCommandHandler: CommandHandler = (ctx) => {
    new Cursor(ctx.element).wrapSelected("~~", {
        placeholder: ctx.options.strikeThroughPlaceholder,
    });
};
