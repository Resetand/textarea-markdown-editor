import {
    blockQuotesCommandHandler,
    boldCommandHandler,
    codeBlockCommandHandler,
    codeInlineCommandHandler,
    codeSelectedCommandHandler,
    createHeadlineCommandHandler,
    imageCommandHandler,
    indentCommandHandler,
    italicCommandHandler,
    linkCommandHandler,
    linkPasteCommandHandler,
    nextLineCommandHandler,
    orderedListCommandHandler,
    strikeThroughCommandHandler,
    unindentCommandHandler,
    unorderedListCommandHandler,
} from "./handlers";
import { CommandConfig } from "./types";
import { metaCombination } from "./utils";

export const wellKnownCommands: CommandConfig[] = [
    {
        shortcut: metaCombination("b"),
        handler: boldCommandHandler,
        name: "bold",
    },
    {
        shortcut: metaCombination("i"),
        handler: italicCommandHandler,
        name: "italic",
    },
    {
        shortcut: "enter",
        handler: nextLineCommandHandler,
        name: "next-line",
    },
    {
        shortcut: "tab",
        name: "indent",
        handler: indentCommandHandler,
    },
    {
        shortcut: "shift+tab",
        name: "unindent",
        handler: unindentCommandHandler,
    },
    {
        shortcut: metaCombination("v"),
        name: "link-paste",
        handler: linkPasteCommandHandler,
    },
    {
        name: "link",
        handler: linkCommandHandler,
    },
    {
        name: "image",
        handler: imageCommandHandler,
    },
    {
        name: "unordered-list",
        handler: unorderedListCommandHandler,
    },
    {
        name: "ordered-list",
        handler: orderedListCommandHandler,
    },
    {
        name: "code-block",
        handler: codeBlockCommandHandler,
    },
    {
        name: "code-inline",
        handler: codeInlineCommandHandler,
    },
    {
        name: "code",
        handler: codeSelectedCommandHandler,
    },
    {
        name: "block-quotes",
        handler: blockQuotesCommandHandler,
    },
    {
        shortcut: [...metaCombination("shift", "x"), "alt+shift+f5"],
        name: "strike-through",
        handler: strikeThroughCommandHandler,
    },
    {
        name: "h1",
        handler: createHeadlineCommandHandler(1),
    },
    {
        name: "h2",
        handler: createHeadlineCommandHandler(2),
    },
    {
        name: "h3",
        handler: createHeadlineCommandHandler(3),
    },
    {
        name: "h4",
        handler: createHeadlineCommandHandler(4),
    },
    {
        name: "h5",
        handler: createHeadlineCommandHandler(5),
    },
    {
        name: "h6",
        handler: createHeadlineCommandHandler(6),
    },
];
