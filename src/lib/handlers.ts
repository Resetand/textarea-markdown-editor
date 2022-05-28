import { CommandHandler } from './types';
import { clamp, escapeRegExp } from './utils';
import { Cursor } from './Cursor.new';

export const boldCommandHandler: CommandHandler = ({ cursor, options: { preferredBoldSyntax, boldPlaceholder } }) => {
    cursor.wrap(preferredBoldSyntax, { placeholder: boldPlaceholder });
};

export const italicCommandHandler: CommandHandler = ({
    cursor,
    options: { preferredItalicSyntax, italicPlaceholder },
}) => {
    cursor.wrap(preferredItalicSyntax, { placeholder: italicPlaceholder });
};

export const linkCommandHandler: CommandHandler = ({ options, cursor }) => {
    const { linkTextPlaceholder, linkUrlPlaceholder } = options;

    const linkText = cursor.selection?.text || linkTextPlaceholder;
    const linkUrl = linkUrlPlaceholder;
    cursor.insert(`[${linkText}](${Cursor.MARKER}${linkUrl}${Cursor.MARKER})`);
};

export const imageCommandHandler: CommandHandler = ({ options, cursor }) => {
    const { imageTextPlaceholder, imageUrlPlaceholder } = options;

    const imageText = cursor.selection?.text || imageTextPlaceholder;
    const imageUrl = imageUrlPlaceholder;

    cursor.insert(`![${imageText}](${Cursor.MARKER}${imageUrl}${Cursor.MARKER})`);
};

export const orderedListCommandHandler: CommandHandler = ({ cursor }) => {
    const re = /(\d+\.){1,2}\s+/;
    const lines = cursor.selection?.lines ?? [cursor.position.line];
    const needUndo = lines.every((line) => re.test(line.text));

    cursor.replaceCurrentLines((line, index) => (needUndo ? line.text.replace(re, '') : `${index + 1}. ${line.text}`), {
        selectReplaced: Boolean(cursor.selection),
    });
};

export const unorderedListCommandHandler: CommandHandler = ({ cursor, options }) => {
    const syntax = options.preferredUnorderedListSyntax;
    const re = new RegExp(`^${escapeRegExp(syntax)}\\s+`);
    const lines = cursor.selection?.lines ?? [cursor.position.line];
    const needUndo = lines.every((line) => re.test(line.text));

    cursor.replaceCurrentLines((line) => (needUndo ? line.text.replace(re, '') : `${syntax} ${line.text}`), {
        selectReplaced: Boolean(cursor.selection),
    });
};

export const codeBlockCommandHandler: CommandHandler = ({ cursor, options: { codeBlockPlaceholder } }) => {
    // TODO handle cases when selection start/end located not on start/end of a line
    // TODO: commend code doesn't works properly
    // const startLine = cursor.selection?.lines[0] ?? cursor.position.line;
    // const endLine = cursor.selection?.lines[0];
    // const needNextLineBefore = startLine.startsAt !== 0;
    // const needNextLineAfter = endLine && endLine.lineNumber !== startLine.lineNumber && endLine.endsAt < endLine.text.length;

    cursor.wrap(['```\n', '\n```'], { placeholder: codeBlockPlaceholder });
};

export const codeInlineCommandHandler: CommandHandler = ({ cursor, options: { codeInlinePlaceholder } }) => {
    cursor.wrap('`', { placeholder: codeInlinePlaceholder });
};

export const codeCommandHandler: CommandHandler = (ctx) => {
    const selectedLines = ctx.cursor.selection?.lines ?? [];
    if (selectedLines.length > 1) {
        codeBlockCommandHandler(ctx);
    } else {
        codeInlineCommandHandler(ctx);
    }
};

export const blockQuotesCommandHandler: CommandHandler = ({ cursor, options }) => {
    cursor.replaceCurrentLines((line, index, lines) =>
        [
            index === 0 ? '> ' : '', // quote markup for the first line
            index === 0 ? Cursor.MARKER : '', // selection opening for the first line
            line.text.replace(/^>\s+/, '') || (index === 0 ? options.blockQuotesPlaceholder : ''), // line content or placeholder for the first line
            index === lines.length - 1 ? Cursor.MARKER : '', // selection closing for the last line
        ].join(''),
    );
};

export const strikeThroughCommandHandler: CommandHandler = ({ cursor, options: { strikeThroughPlaceholder } }) => {
    cursor.wrap('~~', { placeholder: strikeThroughPlaceholder });
};

export const createHeadlineCommandHandler =
    (level: number): CommandHandler =>
    ({ cursor, options }) => {
        const prefix = '#'.repeat(clamp(level, 1, 6)) + ' ';
        const { headlinePlaceholder } = options;
        const placeholder = headlinePlaceholder instanceof Function ? headlinePlaceholder(level) : headlinePlaceholder;
        const currentLine = cursor.position.line;
        const needUndo = currentLine.text.slice(0, level + 1) === prefix;
        const content = currentLine.text.replace(/^#{0,6}\s+/, '') || placeholder;

        cursor.replaceLine(
            currentLine.lineNumber,
            `${needUndo ? '' : prefix}${Cursor.MARKER}${content}${Cursor.MARKER}`,
        );
    };
