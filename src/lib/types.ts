import { Cursor, Line } from "./Cursor.new";
import React, { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactElement, RefAttributes } from "react";

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends U, U = string> = T | (Pick<U, never> & { _?: never });

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const BUILT_IN_COMMANDS = [
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

export type CommandType = LiteralUnion<typeof BUILT_IN_COMMANDS[number], string>;

export type CommandHandlerContext = {
    textarea: HTMLTextAreaElement;
    cursor: Cursor;
    keyEvent?: KeyboardEvent;
    clipboardEvent?: ClipboardEvent;
    options: TextareaMarkdownOptions;
};

export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void>;

export type CommandConfig<TType extends CommandType = CommandType> = {
    /** Handler function for custom commands */
    handler: CommandHandler;

    /** Shortcut combinations ([Mousetrap.js](https://craig.is/killing/mice)) */
    shortcut?: string | string[];

    /** Toggle key event prevent `default:false` */
    shortcutPreventDefault?: boolean;

    /** Built-in or custom command name */
    name: TType;

    /** Toggle command enabling */
    enable?: boolean;
};

export type PrefixWrappingConfig = {
    prefix: string | ((enteringLine: Line) => string);
    prefixPattern?: RegExp;
    shouldBreakIfEmpty?: boolean;
    shouldSaveIndent?: boolean;
};

export type TextareaMarkdownOptions = {
    /** Preferred unordered list prefix `default: '-'` */
    preferredUnorderedListSyntax: "-" | "*" | "+";

    /** Preferred bold wrap syntax `default: '**'` */
    preferredBoldSyntax: "**" | "__";

    /** Preferred italic wrap syntax `default: '*'` */
    preferredItalicSyntax: "*" | "_";

    /** Will handle `tab` and `shift+tab` keystrokes, on which will insert/remove indentation instead of the default behavior `default:true` */
    enableIndentExtension: boolean;

    /** Will handle `tab` and `command/ctrl+backspace` keystrokes, on which will remove only a current line instead of the default behavior `default:true` */
    enableProperLineRemoveBehaviorExtension: boolean;

    /** Will handle `paste` event, on which will wrap pasted with link/image markup if pasted is URL `default:true` */
    enableLinkPasteExtension: boolean;

    /** Will handle `enter` keystroke, on which will wrap current list sequence if needed `default:true` */
    enablePrefixWrappingExtension: boolean;

    /** Array of custom prefixes, that need to be wrapped. (Will not work with `enablePrefixWrappingExtension:false`) */
    customPrefixWrapping: (PrefixWrappingConfig | string)[];

    /** `default: 'bold'` */
    boldPlaceholder: string;

    /** `default: 'italic'` */
    italicPlaceholder: string;

    /** `default: 'strike through'` */
    strikeThroughPlaceholder: string;

    /** `default: 'code'` */
    codeInlinePlaceholder: string;

    /** `default: 'code block'` */
    codeBlockPlaceholder: string;

    /** `default: 'ordered list'` */
    orderedListPlaceholder: string;

    /** `default: 'unordered list'` */
    unorderedListPlaceholder: string;

    /** `default: (lvl) => 'headline ' + lvl` */
    headlinePlaceholder: string | ((level: number) => string);

    /** `default: 'quote'` */
    blockQuotesPlaceholder: string;

    /** Used inside default link markup `[<example>](...)`  `default: 'example'` */
    linkTextPlaceholder: string;

    /** Used inside default image markup `![...](<url>)`  `default: 'url'` */
    linkUrlPlaceholder: string;

    /** Used inside default image markup `![<example>](...)`  `default: 'example'` */
    imageTextPlaceholder: string;

    /** Used inside default image markup `![...](<image.png>)`  `default: 'image.png'` */
    imageUrlPlaceholder: string;
};

export const defaultTextareaMarkdownOptions: TextareaMarkdownOptions = {
    preferredUnorderedListSyntax: "-",
    preferredBoldSyntax: "**",
    preferredItalicSyntax: "*",

    enableIndentExtension: true,
    enableLinkPasteExtension: true,
    enablePrefixWrappingExtension: true,
    enableProperLineRemoveBehaviorExtension: true,
    customPrefixWrapping: [],

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
