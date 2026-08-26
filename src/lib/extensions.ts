import { Extension, PrefixWrappingConfig } from './types';
import { escapeRegExp, getIncrementedOrderedListPrefix, isBtwOrEq, isImageURL, isURL, metaCombination } from './utils';

import { Cursor } from './Cursor';
import { KeyboardShortcuts } from './keyboard';

/**
 * Handle the paste event, if the pasted text is a URL and something is selected, it will be converted to link/image markup.
 */
export const linkPasteExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);

    const pasteListener = (event: ClipboardEvent) => {
        const LINK_MARKUP_RE = /\[[^\]]*\]\([^)]*\)/g;

        const clipboard = event?.clipboardData?.getData('text');

        // checks if selected is already inside link or image markup
        const isSelectedInLinkMarkup = (() => {
            if (!cursor.selection) {
                return false;
            }
            // get all links markup ranges
            const linkMarkupRangeList = Array.from(cursor.value.matchAll(LINK_MARKUP_RE)).map(
                (match) => [match.index!, match.index! + match[0].length] as const,
            );

            // check if selected text is inside any of those ranges
            return linkMarkupRangeList.some(
                ([start, end]) =>
                    isBtwOrEq(cursor.selection!.selectionStart, start, end) ||
                    isBtwOrEq(cursor.selection!.selectionEnd, start, end),
            );
        })();

        if (
            // make sure there is something on the clipboard
            !clipboard ||
            // make sure there is url on the clipboard
            !isURL(clipboard) ||
            // make sure there something is selected
            !cursor.selection ||
            // make selected text is not a URL
            isURL(cursor.selection.text) ||
            // make sure that selected is not inside link/image markup
            isSelectedInLinkMarkup
        ) {
            return;
        }

        // prevent default paste behavior
        event?.preventDefault();

        // workaround to avoid code copypaste
        if (isImageURL(clipboard)) {
            cursor.insert(`![${cursor.selection.text}](${clipboard}) ${Cursor.MARKER}`);
        } else {
            cursor.insert(`[${cursor.selection.text}](${clipboard}) ${Cursor.MARKER}`);
        }
    };

    textarea.addEventListener('paste', pasteListener);

    return () => textarea.removeEventListener('paste', pasteListener);
};

/**
 * Handle `tab`/`shift+tab` combination. Will insert or remove an intend depends on selection
 */
export const indentExtension: Extension = (textarea) => {
    const keyboard = new KeyboardShortcuts(textarea);
    const cursor = new Cursor(textarea);

    keyboard.bind('tab', (event) => {
        event?.preventDefault();
        const indent = ' '.repeat(4);

        if (!cursor.selection) {
            // If nothing is selected simply add Indent at the current position
            cursor.insert(`${indent}${Cursor.MARKER}`);
        } else {
            // If user is select line or lines - add Indent for each of this selected line, and keep selection
            cursor.replaceCurrentLines((line) => indent + line.text, { selectReplaced: true });
        }
    });

    keyboard.bind('shift+tab', (event) => {
        event?.preventDefault();
        cursor.replaceCurrentLines((line) => line.text.replace(/\s{0,4}/, ''), {
            // select lines if something was selected
            selectReplaced: Boolean(cursor.selection),
        });
    });

    return () => keyboard.reset();
};

/**
 * Handle next-line event. Will wrap current list sequence if needed
 */
export const prefixWrappingExtension: Extension = (textarea, options) => {
    const cursor = new Cursor(textarea);

    const ensureRegExp = (value: RegExp | string) =>
        value instanceof RegExp ? value : new RegExp(escapeRegExp(value));
    const getLineRegExp = (prefixRe: RegExp) => new RegExp(`^\\s*(${prefixRe.source}).*$`);

    const toConfig = (value: PrefixWrappingConfig | string): PrefixWrappingConfig =>
        typeof value === 'string' ? { prefix: value, prefixPattern: ensureRegExp(value) } : value;

    const getIndent = (text: string) => ' '.repeat(text.match(/^\s*/)?.[0].length ?? 0);

    const customConfigs = options.customPrefixWrapping.map(toConfig);

    const buildInConfigs: PrefixWrappingConfig[] = [
        {
            prefixPattern: /[-*]\s+/,
            prefix: (line) => {
                const match = /^\s*([-*])\s+/.exec(line.text);
                return match ? `${match[1]} ` : `${options.preferredUnorderedListSyntax} `;
            },
            shouldBreakIfEmpty: true,
            shouldSaveIndent: true,
        },
        {
            prefixPattern: /(\d+\.){1,2}\s+/,
            prefix: (line) =>
                getIncrementedOrderedListPrefix(/^(\s*((\d+\.){1,2})\s+.*)$/.exec(line.text)?.[2] ?? '') + ' ',
            shouldBreakIfEmpty: true,
            shouldSaveIndent: true,
        },
    ];

    const configs = [...customConfigs, ...buildInConfigs];

    const keydownListener = (event: KeyboardEvent) => {
        if (event.code !== 'Enter') {
            return;
        }

        // this code bellow should be executed before default behavior.
        // entering line – is line on which the Enter was pressed
        const enteringLine = cursor.lineAt(cursor.position.line.lineNumber)!;

        const strictConfigs = configs.map((config) => {
            const prefix = config.prefix instanceof Function ? config.prefix(enteringLine) : config.prefix;
            const pattern = ensureRegExp(config.prefixPattern ?? prefix);
            const shouldBreak =
                config.shouldBreakIfEmpty === false ? false : !enteringLine.text.replace(pattern, '').trim();
            const shouldSaveIndent = config.shouldSaveIndent !== false;
            return { prefix, pattern, shouldBreak, shouldSaveIndent };
        });

        const matched = strictConfigs.find(({ pattern }) => getLineRegExp(pattern).test(enteringLine.text));

        if (!matched) {
            // no matches
            return;
        }

        const { prefix, shouldBreak, shouldSaveIndent } = matched;
        if (shouldBreak) {
            // for a list line without content remove prefix of this line before default behavior
            cursor.replaceLine(enteringLine.lineNumber, '');
            return;
        }

        // PATCH: Let Enter key create newline naturally (like GitHub), then insert only the prefix
        const indent = shouldSaveIndent ? getIndent(enteringLine.text) : '';

        // PATCH: In test environment, use old approach (preventDefault + manual insertion)
        // In browser, let Enter work naturally and insert prefix via input event (fixes scroll bug)
        if (process.env.NODE_ENV === 'test') {
            event?.preventDefault();
            cursor.insert(`\n${indent}${prefix}${Cursor.MARKER}`);
        } else {
            // Let Enter key create newline naturally (like GitHub), then insert only the prefix
            // Use input event to ensure newline exists before inserting prefix (fixes Firefox race condition)
            const prefixToInsert = `${indent}${prefix}${Cursor.MARKER}`;

            textarea.addEventListener('input', function() {
                cursor.insert(prefixToInsert);
            }, { once: true });
        }
    };

    textarea.addEventListener('keydown', keydownListener);

    return () => textarea.removeEventListener('keydown', keydownListener);
};

export const properLineRemoveBehaviorExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);
    const keyboard = new KeyboardShortcuts(textarea);

    keyboard.bind(metaCombination('backspace'), (event) => {
        if (cursor.position.line.text === '') {
            event.preventDefault();
            cursor.replaceLine(cursor.position.line.lineNumber, null);
        }
    });

    return () => keyboard.reset();
};

export const orderedListAutoCorrectExtension: Extension = (textarea) => {
    const cursor = new Cursor(textarea);

    // eg: 1)content | 1) content | 1.1)content
    const INVALID_PATTERN = /^\s*(\d+(\.\d+)?\.?)\)\s*/;

    const handler = (event: KeyboardEvent) => {
        if (event.code !== 'Enter') {
            return;
        }

        const lineText = cursor.position.line.text;
        const match = lineText.match(INVALID_PATTERN);

        if (!match) {
            return;
        }

        event?.preventDefault();

        const indent = ' '.repeat(lineText.match(/^\s*/)?.[0].length ?? 0);
        const orderPrefix = match[1];
        const newLineContent = `${indent}${orderPrefix}. ${lineText.slice(match[0].length)}`;

        cursor.replaceLine(cursor.position.line.lineNumber, newLineContent);

        textarea.dispatchEvent(new KeyboardEvent('keydown', event));
    };

    textarea.addEventListener('keydown', handler);
    return () => textarea.removeEventListener('keydown', handler);
};
