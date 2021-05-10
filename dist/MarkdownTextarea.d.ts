import { CommandTrigger, MarkdownTextareaConfig, TextareaElement } from "./types";
import React, { ComponentProps, ComponentPropsWithoutRef, ForwardRefExoticComponent, JSXElementConstructor, ReactElement, RefAttributes } from "react";
export declare type MarkdownTextareaRef = HTMLTextAreaElement & {
    trigger: CommandTrigger;
};
declare type TextareaComponentShape = ForwardRefExoticComponent<ComponentPropsWithoutRef<"textarea">> & RefAttributes<any>;
declare type InferComponentRef<TComponent extends TextareaComponentShape> = "ref" extends keyof React.PropsWithRef<ComponentProps<TComponent>> ? React.PropsWithRef<ComponentProps<TComponent>>["ref"] extends (...args: any[]) => any ? unknown : Exclude<React.PropsWithRef<ComponentProps<TComponent>>["ref"], (...args: any[]) => any> : unknown;
declare type MarkdownTextareaInnerProps<TComponent extends TextareaComponentShape> = MarkdownTextareaConfig & {
    Component?: TComponent;
    extractElementFromComponentRef?: (ref: InferComponentRef<TComponent>) => TextareaElement;
};
export declare type MarkdownTextareaProps<TComponent extends TextareaComponentShape> = ComponentPropsWithoutRef<"textarea"> & MarkdownTextareaInnerProps<TComponent> & RefAttributes<MarkdownTextareaRef> & ComponentProps<TComponent>;
declare type MarkdownTextareaComponentWithoutRef = <TComponent extends TextareaComponentShape>(props: MarkdownTextareaProps<TComponent>) => ReactElement<any, string | JSXElementConstructor<any>>;
declare type MarkdownTextareaComponent = MarkdownTextareaComponentWithoutRef & ForwardRefExoticComponent<RefAttributes<MarkdownTextareaRef>>;
export declare const MarkdownTextarea: MarkdownTextareaComponent;
export {};
