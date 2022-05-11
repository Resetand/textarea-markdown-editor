import { Cursor, Line } from "./Cursor.new";
import React, { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactElement, RefAttributes } from "react";

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends U, U = string> = T | (Pick<U, never> & { _?: never });

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const BUILD_IN_COMMANDS = [
    "bold",
    "italic",
    "strike-through",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "unordered-list",
    "ordered-list",
    "code-block",
    "code-inline",
    "code",
    "link",
    "image",
    "block-quotes",
] as const;

export type CommandType = LiteralUnion<typeof BUILD_IN_COMMANDS[number], string>;

export type CommandHandlerContext = {
    textarea: HTMLTextAreaElement;
    cursor: Cursor;
    keyEvent?: KeyboardEvent;
    clipboardEvent?: ClipboardEvent;
    options: TextareaMarkdownOptions;
};

export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void>;

export type CommandConfig<TType extends CommandType = CommandType> = {
    handler: CommandHandler;
    shortcut?: string | string[];
    shortcutPreventDefault?: boolean;
    name: TType;
    enable?: boolean;
};

export type WrappingConfig = {
    markup: string | ((enteringLine: Line) => string);
    pattern: string | RegExp;
};

export type TextareaMarkdownOptions = {
    preferredUnorderedListSyntax: "-" | "*" | "+";
    preferredBoldSyntax: "**" | "__";
    preferredItalicSyntax: "*" | "_";

    enableIntentExtension: boolean;
    enableProperLineRemoveBehaviorExtension: boolean;
    enableLinkPasteExtension: boolean;
    enableListWrappingExtension: boolean;
    customWrapping: (WrappingConfig | string)[];

    boldPlaceholder: string;
    italicPlaceholder: string;
    strikeThroughPlaceholder: string;
    codeInlinePlaceholder: string;
    codeBlockPlaceholder: string;
    orderedListPlaceholder: string;
    unorderedListPlaceholder: string;
    headlinePlaceholder: string | ((level: number) => string);
    blockQuotesPlaceholder: string;
    linkTextPlaceholder: string;
    linkUrlPlaceholder?: string;
    imageTextPlaceholder: string;
    imageUrlPlaceholder: string;
};

export const defaultTextareaMarkdownOptions: TextareaMarkdownOptions = {
    preferredUnorderedListSyntax: "-",
    preferredBoldSyntax: "**",
    preferredItalicSyntax: "*",

    enableIntentExtension: true,
    enableLinkPasteExtension: true,
    enableListWrappingExtension: true,
    enableProperLineRemoveBehaviorExtension: true,
    customWrapping: [],

    boldPlaceholder: "bold",
    italicPlaceholder: "italic",
    strikeThroughPlaceholder: "strike through",
    codeInlinePlaceholder: "code",
    codeBlockPlaceholder: "code block",
    orderedListPlaceholder: "ordered list",
    unorderedListPlaceholder: "unordered list",
    headlinePlaceholder: (lvl) => `headline ${lvl}`,
    blockQuotesPlaceholder: "quote",
    linkTextPlaceholder: "example",
    linkUrlPlaceholder: "url",
    imageTextPlaceholder: "example",
    imageUrlPlaceholder: "image.png",
};

export type CommandTrigger = (command: CommandType, keyEvent?: KeyboardEvent) => void;

export type Command = PartialBy<CommandConfig, "handler">;

export type Extension = (textarea: HTMLTextAreaElement, options: TextareaMarkdownOptions) => void | (() => void);

export type TextareaMarkdownConfig = {
    commands?: Command[];
    options?: Partial<TextareaMarkdownOptions>;
};

export type TextareaMarkdownRef = HTMLTextAreaElement & {
    trigger: CommandTrigger;
};

export type TextareaMarkdownProps = Omit<TextareaMarkdownConfig & ComponentPropsWithoutRef<"textarea">, "children">;

export interface TextareaMarkdownComponent extends ForwardRefExoticComponent<TextareaMarkdownProps & RefAttributes<TextareaMarkdownRef>> {
    Wrapper: ForwardRefExoticComponent<TextareaMarkdownConfig & RefAttributes<TextareaMarkdownRef> & { children: ReactElement }>;
}
