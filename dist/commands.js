var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { blockQuotesCommandHandler, boldCommandHandler, codeBlockCommandHandler, codeInlineCommandHandler, codeSelectedCommandHandler, createHeadlineCommandHandler, indentCommandHandler, italicCommandHandler, linkCommandHandler, linkPasteCommandHandler, nextLineCommandHandler, orderedListCommandHandler, strikeThroughCommandHandler, unorderedListCommandHandler, } from './handlers';
import { metaCombination } from './utils';
export var wellKnownCommands = [
    {
        shortcut: metaCombination('b'),
        handler: boldCommandHandler,
        name: 'bold',
    },
    {
        shortcut: metaCombination('i'),
        handler: italicCommandHandler,
        name: 'italic',
    },
    {
        shortcut: 'enter',
        handler: nextLineCommandHandler,
        name: 'next-line',
    },
    {
        shortcut: 'tab',
        name: 'indent',
        handler: indentCommandHandler,
    },
    {
        shortcut: metaCombination('v'),
        name: 'link-paste',
        handler: linkPasteCommandHandler,
    },
    {
        name: 'link',
        handler: linkCommandHandler,
    },
    {
        name: 'unordered-list',
        handler: unorderedListCommandHandler,
    },
    {
        name: 'ordered-list',
        handler: orderedListCommandHandler,
    },
    {
        name: 'code-block',
        handler: codeBlockCommandHandler,
    },
    {
        name: 'code-inline',
        handler: codeInlineCommandHandler,
    },
    {
        name: 'code',
        handler: codeSelectedCommandHandler,
    },
    {
        name: 'block-quotes',
        handler: blockQuotesCommandHandler,
    },
    {
        shortcut: __spreadArrays(metaCombination('shift', 'x'), ['alt+shift+f5']),
        name: 'strike-through',
        handler: strikeThroughCommandHandler,
    },
    {
        name: 'h1',
        handler: createHeadlineCommandHandler(1),
    },
    {
        name: 'h2',
        handler: createHeadlineCommandHandler(2),
    },
    {
        name: 'h3',
        handler: createHeadlineCommandHandler(3),
    },
    {
        name: 'h4',
        handler: createHeadlineCommandHandler(4),
    },
    {
        name: 'h5',
        handler: createHeadlineCommandHandler(5),
    },
    {
        name: 'h6',
        handler: createHeadlineCommandHandler(6),
    },
];
