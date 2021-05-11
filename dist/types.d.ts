import React, { ComponentPropsWithoutRef, ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
/** https://github.com/Microsoft/TypeScript/issues/29729 */
export declare type LiteralUnion<T extends U, U = string> = T | (Pick<U, never> & {
    _?: never;
});
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare const WELL_KNOWN_COMMANDS: readonly ["bold", "italic", "strike-through", "h1", "h2", "h3", "h4", "h5", "h6", "unordered-list", "ordered-list", "next-line", "indent", "code-block", "code-inline", "code", "link", "link-paste", "block-quotes"];
export declare type CommandType = LiteralUnion<typeof WELL_KNOWN_COMMANDS[number], string>;
export declare type CommandHandlerContext = {
    element: HTMLTextAreaElement;
    keyEvent?: KeyboardEvent;
    options: MarkdownTextareaOptions;
};
export declare type CommandHandler = (context: CommandHandlerContext) => void | Promise<void> | Promise<string> | string;
export declare type CommandConfig<TType extends CommandType = CommandType> = {
    handler: CommandHandler;
    shortcut?: string | string[];
    shortcutPreventDefault?: boolean;
    name: TType;
    enable?: boolean;
};
export declare type TextareaElement = HTMLTextAreaElement | null | undefined;
export declare type MarkdownTextareaOptions = {
    useLinkMarkupOnSelectionPasteUrl: boolean;
    useIndentListPrefixTabulation: boolean;
    unorderedListSyntax: "-" | "*";
    boldSyntax: "**" | "__";
    italicSyntax: "*" | "_";
};
export declare type CommandTrigger = (command: CommandType) => void | string;
export declare type CommandTriggerInternal = (command: CommandType, options: {
    __internal: {
        element: TextareaElement;
        keyEvent?: KeyboardEvent;
    };
}) => Promise<any> | any;
export declare type CommandDefine = PartialBy<CommandConfig, "handler">;
export declare type MarkdownTextareaConfig = {
    commands?: CommandDefine[];
    options?: Partial<MarkdownTextareaOptions>;
};
export declare const defaultMarkdownTextareaOptions: MarkdownTextareaOptions;
export declare const isRefObject: <TAttributes extends unknown>(ref: React.Ref<TAttributes>) => ref is React.RefObject<TAttributes>;
export declare type MarkdownTextareaRef = HTMLTextAreaElement & {
    trigger: CommandTrigger;
};
export declare type MarkdownTextareaProps = Omit<MarkdownTextareaConfig & ComponentPropsWithoutRef<"textarea">, "children">;
export interface MarkdownTextareaComponent extends ForwardRefExoticComponent<MarkdownTextareaProps & RefAttributes<MarkdownTextareaRef>> {
    Wrapper: ForwardRefExoticComponent<MarkdownTextareaConfig & RefAttributes<MarkdownTextareaRef> & {
        children: ReactNode;
    }>;
}
export {};
