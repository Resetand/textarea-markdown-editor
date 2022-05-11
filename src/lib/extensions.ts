import Mousetrap from "mousetrap";
import { Cursor } from "./Cursor.new";
import { Extension } from "./types";
import { getIncrementedOrderedListPrefix, isBtwOrEq, metaCombination } from "./utils";

/**
 * Handle the paste event, if the pasted text is a URL and something is selected, it will be converted to link/image markup.
 */
export const linkPasteExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);

    const pasteListener = (event: ClipboardEvent) => {
        const LINK_MARKUP_RE = /\[.*\]\(.*\)/g;
        const URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i;
        const IMAGE_URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?\.(png|tiff|tif|bmp|jpg|jpeg|gif|eps|webp|bmp|dib|svg)$/i;

        const clipboard = event?.clipboardData?.getData("text");

        // checks if selected is already inside link or image markup
        const isSelectedInLinkMarkup = (() => {
            if (!cursor.selection) {
                return false;
            }
            return Boolean(
                LINK_MARKUP_RE.exec(cursor.value)?.some((value, index) => {
                    return (
                        isBtwOrEq(cursor.selection!.selectionStart + 1, index, index + value.length) ||
                        isBtwOrEq(cursor.selection!.selectionEnd - 1, index, index + value.length)
                    );
                })
            );
        })();

        if (
            // make sure there is something on the clipboard
            !clipboard ||
            // make sure there is url on the clipboard
            !URL_RE.test(clipboard) ||
            // make sure there something is selected
            !cursor.selection ||
            // make sure that selected is not inside link/image markup
            isSelectedInLinkMarkup
        ) {
            return;
        }

        // prevent default paste behavior
        event?.preventDefault();

        // workaround to avoid code copypaste
        if (IMAGE_URL_RE.test(clipboard)) {
            cursor.insert(`![${cursor.selection.text}](${clipboard}) ${Cursor.MARKER}`);
        } else {
            cursor.insert(`[${cursor.selection.text}](${clipboard}) ${Cursor.MARKER}`);
        }
    };

    textarea.addEventListener("paste", pasteListener);

    return () => textarea.removeEventListener("paste", pasteListener);
};

/**
 * Handle `tab`/`shift+tab` combination. Will insert or remove an intend depends on selection
 */
export const intentExtension: Extension = (textarea) => {
    const mousetrap = Mousetrap(textarea);
    const cursor = new Cursor(textarea);

    mousetrap.bind("tab", (event) => {
        event?.preventDefault();
        const indent = " ".repeat(4);

        if (!cursor.selection) {
            // If nothing is selected simply add Indent at the current position
            cursor.insert(`${indent}${Cursor.MARKER}`);
        } else {
            // If user is select line or lines - add Indent for each of this selected line, and keep selection
            cursor.replaceCurrentLines((line) => indent + line.text, { selectReplaced: true });
        }
    });

    mousetrap.bind("shift+tab", (event) => {
        event?.preventDefault();
        cursor.replaceCurrentLines((line) => line.text.replace(/\s{0,4}/, ""), {
            // select lines if something was selected
            selectReplaced: Boolean(cursor.selection),
        });
    });

    return () => mousetrap.reset();
};

/**
 * Handle next-line event. Will wrap current list sequence if needed
 */
export const listWrappingExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);

    const keydownListener = (event: KeyboardEvent) => {
        if (event.code !== "Enter") {
            return;
        }

        // regexp checks all possible sequences, including lines with Indent cases
        const ANY_SEQUENCE_LINE_RE = /^(\s*(\-|\+|\*|(\d+\.){1,2})\s+.*)$/;
        const ANY_BLANK_SEQUENCE_LINE_RE = /^(\s*(\-|\+|\*|(\d+\.){1,2})\s+)$/;

        // this code bellow should be executed before default behavior.
        // current line – is line on which the Enter was pressed
        const enteringLine = cursor.lineAt(cursor.position.line.lineNumber)!;

        const isListLine = ANY_SEQUENCE_LINE_RE.test(enteringLine.text);
        const isBlankListLine = ANY_BLANK_SEQUENCE_LINE_RE.test(enteringLine.text);

        if (!isListLine) {
            // default behavior if it's not inside a sequence
            return;
        }

        if (isBlankListLine) {
            // for a list line without content remove prefix of this line before default behavior
            cursor.replaceLine(enteringLine.lineNumber, "");
            return;
        }

        // Otherwise, we need to wrap a sequence
        // This is a bit tricky with saving default behavior, and may lead to unexpected results
        // We prevent default behavior and insert new-line within the prefix, it will close to the native behavior

        event?.preventDefault();

        const prefix = ANY_SEQUENCE_LINE_RE.exec(enteringLine.text)?.[2] ?? "";
        const isOrderedPrefix = /(\d+\.){1,2}/.test(prefix);

        const contentAfterCursor = enteringLine.text.slice(textarea.selectionEnd);

        const nextPrefix = isOrderedPrefix ? getIncrementedOrderedListPrefix(prefix) : prefix;
        const intent = " ".repeat(enteringLine.text.match(/^\s*/)?.[0].length ?? 0);

        cursor.insert(`\n${intent}${nextPrefix} ${contentAfterCursor}${Cursor.MARKER}`);
    };

    textarea.addEventListener("keydown", keydownListener);

    return () => textarea.removeEventListener("keydown", keydownListener);
};

export const properLineRemoveBehaviorExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);
    const mousetrap = Mousetrap(textarea);

    mousetrap.bind(metaCombination("backspace"), (event) => {
        if (cursor.position.line.text === "") {
            event.preventDefault();
            cursor.replaceLine(cursor.position.line.lineNumber, null);
        }
    });

    return () => mousetrap.reset();
};
