import React, { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactNode, RefAttributes, RefObject } from "react";

/** https://github.com/Microsoft/TypeScript/issues/29729 */
export type LiteralUnion<T extends U, U = string> = T | (Pick<U, never> & { _?: never });

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const WELL_KNOWN_COMMANDS = [
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
    "next-line",
    "indent",
    "code-block",
    "code-inline",
    "code",
    "link",
    "link-paste",
    "block-quotes",
] as const;

export type CommandType = LiteralUnion<typeof WELL_KNOWN_COMMANDS[number], string>;

export type CommandHandlerContext = {
    element: HTMLTextAreaElement;
    keyEvent?: KeyboardEvent;
    options: MarkdownTextareaOptions;
};

export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void> | Promise<string> | string;

export type CommandConfig<TType extends CommandType = CommandType> = {
    handler: CommandHandler;
    shortcut?: string | string[];
    shortcutPreventDefault?: boolean;
    name: TType;
    enable?: boolean;
};

export type TextareaElement = HTMLTextAreaElement | null | undefined;

export type MarkdownTextareaOptions = {
    /** toggle auto wrapping with link markup when pasting the selected word */
    useLinkMarkupOnSelectionPasteUrl: boolean;

    /** toggle tabulation lists prefix with content  */
    useIndentListPrefixTabulation: boolean;

    /** unordered list prefix syntax  */
    unorderedListSyntax: "-" | "*";

    /** bold wrapper syntax  */
    boldSyntax: "**" | "__";

    /** italic wrapper syntax  */
    italicSyntax: "*" | "_";
};

export type CommandTrigger = (command: CommandType) => void | string;
export type CommandTriggerInternal = (
    command: CommandType,
    options: { __internal: { element: TextareaElement; keyEvent?: KeyboardEvent } }
) => Promise<any> | any;
export type CommandDefine = PartialBy<CommandConfig, "handler">;

export type MarkdownTextareaConfig = {
    commands?: CommandDefine[];
    options?: Partial<MarkdownTextareaOptions>;
};

export const defaultMarkdownTextareaOptions: MarkdownTextareaOptions = {
    useIndentListPrefixTabulation: true,
    useLinkMarkupOnSelectionPasteUrl: true,
    unorderedListSyntax: "-",
    boldSyntax: "**",
    italicSyntax: "*",
};

export const isRefObject = <TAttributes extends any>(ref: React.Ref<TAttributes>): ref is RefObject<TAttributes> => {
    return ref !== null && typeof ref === "object";
};

export type MarkdownTextareaRef = HTMLTextAreaElement & {
    trigger: CommandTrigger;
};

export type MarkdownTextareaProps = Omit<MarkdownTextareaConfig & ComponentPropsWithoutRef<"textarea">, "children">;

export interface MarkdownTextareaComponent extends ForwardRefExoticComponent<MarkdownTextareaProps & RefAttributes<MarkdownTextareaRef>> {
    Wrapper: ForwardRefExoticComponent<MarkdownTextareaConfig & RefAttributes<MarkdownTextareaRef> & { children: ReactNode }>;
}
