import {
    blockQuotesCommandHandler,
    boldCommandHandler,
    codeBlockCommandHandler,
    codeInlineCommandHandler,
    codeCommandHandler,
    createHeadlineCommandHandler,
    imageCommandHandler,
    italicCommandHandler,
    linkCommandHandler,
    orderedListCommandHandler,
    strikeThroughCommandHandler,
    unorderedListCommandHandler,
} from './handlers';
import { CommandConfig } from './types';
import { metaCombination } from './utils';

export const buildInCommands: CommandConfig[] = [
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
        name: 'link',
        handler: linkCommandHandler,
    },
    {
        name: 'image',
        handler: imageCommandHandler,
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
        handler: codeCommandHandler,
    },
    {
        name: 'block-quotes',
        handler: blockQuotesCommandHandler,
    },
    {
        shortcut: [...metaCombination('shift', 'x'), 'alt+shift+f5'],
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
