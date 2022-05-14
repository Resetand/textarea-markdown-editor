import Mousetrap from "mousetrap";
import { Cursor } from "./Cursor.new";
import { Extension, PrefixWrappingConfig } from "./types";
import { escapeRegExp, getIncrementedOrderedListPrefix, isBtwOrEq, metaCombination } from "./utils";

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
export const indentExtension: Extension = (textarea) => {
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
export const prefixWrappingExtension: Extension = (textarea, options) => {
    const cursor = new Cursor(textarea);

    const ensureRegExp = (value: RegExp | string) => (value instanceof RegExp ? value : new RegExp(escapeRegExp(value)));
    const getLineRegExp = (prefixRe: RegExp) => new RegExp(`^\\s*(${prefixRe.source}).*$`);

    const toConfig = (value: PrefixWrappingConfig | string): PrefixWrappingConfig =>
        typeof value === "string" ? { prefix: value, prefixPattern: ensureRegExp(value) } : value;

    const getIndent = (text: string) => " ".repeat(text.match(/^\s*/)?.[0].length ?? 0);

    const customConfigs = options.customPrefixWrapping.map(toConfig);

    const buildInConfigs: PrefixWrappingConfig[] = [
        {
            prefix: "- ",
            shouldBreakIfEmpty: true,
            shouldSaveIndent: true,
        },
        {
            prefixPattern: /(\d+\.){1,2}\s+/,
            prefix: (line) => getIncrementedOrderedListPrefix(/^(\s*((\d+\.){1,2})\s+.*)$/.exec(line.text)?.[2] ?? "") + " ",
            shouldBreakIfEmpty: true,
            shouldSaveIndent: true,
        },
    ];

    const configs = [...customConfigs, ...buildInConfigs];

    const keydownListener = (event: KeyboardEvent) => {
        if (event.code !== "Enter") {
            return;
        }

        // this code bellow should be executed before default behavior.
        // entering line – is line on which the Enter was pressed
        const enteringLine = cursor.lineAt(cursor.position.line.lineNumber)!;

        const strictConfigs = configs.map((config) => {
            const prefix = config.prefix instanceof Function ? config.prefix(enteringLine) : config.prefix;
            const pattern = ensureRegExp(config.prefixPattern ?? prefix);
            const shouldBreak = config.shouldBreakIfEmpty === false ? false : !enteringLine.text.replace(pattern, "").trim();
            const shouldSaveIndent = config.shouldSaveIndent !== false;
            return { prefix, pattern, shouldBreak, shouldSaveIndent };
        });

        const matched = strictConfigs.find(({ pattern }) => getLineRegExp(pattern).test(enteringLine.text));

        if (!matched) {
            // no matches
            return;
        }
        const { pattern, prefix, shouldBreak, shouldSaveIndent } = matched;

        if (shouldBreak) {
            // for a list line without content remove prefix of this line before default behavior
            cursor.replaceLine(enteringLine.lineNumber, "");
            return;
        }

        event?.preventDefault();

        const contentAfterCursor = enteringLine.text.slice(textarea.selectionEnd);
        const indent = shouldSaveIndent ? getIndent(enteringLine.text) : "";

        cursor.insert(`\n${indent}${prefix}${contentAfterCursor.replace(pattern, "")}${Cursor.MARKER}`);
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
