import { CommandHandler, CommandHandlerContext } from "./types";
export declare const mapCurrentLine: (element: HTMLTextAreaElement, mapper: (line: string) => string) => void;
declare type SingleLineWrapperOptions = {
    element: HTMLTextAreaElement;
    markup: string;
    placeholder?: string;
    useUnwrapping?: boolean;
};
/**
 * Wraps the current selection in markup within the current line
 * or removes markup if target is already wrapped (with useUnwrapping = true)
 */
export declare const singleLineWrapper: ({ element, markup, useUnwrapping, placeholder }: SingleLineWrapperOptions) => void;
export declare const linkCommandHandler: CommandHandler;
export declare const nextLineCommandHandler: CommandHandler;
export declare const indentCommandHandler: CommandHandler;
export declare const linkPasteCommandHandler: (ctx: CommandHandlerContext) => Promise<void>;
export declare const codeBlockCommandHandler: CommandHandler;
export declare const codeSelectedCommandHandler: CommandHandler;
export declare const boldCommandHandler: CommandHandler;
export declare const italicCommandHandler: CommandHandler;
export declare const createHeadlineCommandHandler: (level: number) => CommandHandler;
export declare const orderedListCommandHandler: CommandHandler;
export declare const unorderedListCommandHandler: CommandHandler;
export declare const blockQuotesCommandHandler: CommandHandler;
export declare const codeInlineCommandHandler: CommandHandler;
export declare const strikeThroughCommandHandler: CommandHandler;
export {};
