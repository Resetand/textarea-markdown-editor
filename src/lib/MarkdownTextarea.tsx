import * as reactTriggerChange from "react-trigger-change";

import {
    CommandConfig,
    CommandDefine,
    CommandTrigger,
    CommandTriggerInternal,
    MarkdownTextareaConfig,
    MarkdownTextareaOptions,
    TextareaElement,
    WELL_KNOWN_COMMANDS,
    defaultMarkdownTextareaOptions,
    isRefObject,
} from "./types";
import Mousetrap, { MousetrapInstance, MousetrapStatic } from "mousetrap";
import React, {
    ComponentProps,
    ComponentPropsWithoutRef,
    ForwardRefExoticComponent,
    JSXElementConstructor,
    MutableRefObject,
    ReactElement,
    RefAttributes,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";

// import type {For} from 'react'

import { findLastIndex } from "./utils";
import { wellKnownCommands } from "./commands";

export type MarkdownTextareaRef = HTMLTextAreaElement & {
    trigger: CommandTrigger;
};

type TextareaComponentShape = ForwardRefExoticComponent<ComponentPropsWithoutRef<"textarea">> & RefAttributes<any>;

type InferComponentRef<TComponent extends TextareaComponentShape> = "ref" extends keyof React.PropsWithRef<ComponentProps<TComponent>>
    ? React.PropsWithRef<ComponentProps<TComponent>>["ref"] extends (...args: any[]) => any
        ? unknown
        : Exclude<React.PropsWithRef<ComponentProps<TComponent>>["ref"], (...args: any[]) => any>
    : unknown;

type MarkdownTextareaInnerProps<TComponent extends TextareaComponentShape> = MarkdownTextareaConfig & {
    Component?: TComponent;
    extractElementFromComponentRef?: (ref: InferComponentRef<TComponent>) => TextareaElement;
};

export type MarkdownTextareaProps<TComponent extends TextareaComponentShape> = ComponentPropsWithoutRef<"textarea"> &
    MarkdownTextareaInnerProps<TComponent> &
    RefAttributes<MarkdownTextareaRef> &
    ComponentProps<TComponent>;

type MarkdownTextareaComponentWithoutRef = <TComponent extends TextareaComponentShape>(
    props: MarkdownTextareaProps<TComponent>
) => ReactElement<any, string | JSXElementConstructor<any>>;

type MarkdownTextareaComponent = MarkdownTextareaComponentWithoutRef & ForwardRefExoticComponent<RefAttributes<MarkdownTextareaRef>>;

const REF_TYPE_ERROR_MSG = `Component ref is not instance of HTMLTextAreaElement, you can provide extractElementFromComponentRef function to extract element from Component ref`;
const REF_EXTRACTED_TYPE_ERROR_MSG = `extracted element is not instance of HTMLTextAreaElement`;

export const MarkdownTextarea: MarkdownTextareaComponent = forwardRef(
    (props: MarkdownTextareaProps<any>, markdownTextareaRef: React.Ref<MarkdownTextareaRef>) => {
        const {
            commands: userCommands,
            options: userOptions,
            Component: CustomComponent,
            extractElementFromComponentRef,
            ...textareaProps
        } = props;

        const commands = useMemo(() => getCommandsList(userCommands ?? []), [userCommands]);

        const options = useMemo<MarkdownTextareaOptions>(() => Object.assign({}, defaultMarkdownTextareaOptions, userOptions), [
            userOptions,
        ]);

        const componentRef = useRef<InferComponentRef<any>>(null);
        const elementRef = useRef<HTMLTextAreaElement>(null) as MutableRefObject<HTMLTextAreaElement>;

        const trigger = useCommandTrigger({ commands, options });

        useEffect(() => {
            if (CustomComponent) {
                const hasExtractor = extractElementFromComponentRef !== undefined && extractElementFromComponentRef instanceof Function;

                if (hasExtractor) {
                    const supposedExtractedElement = extractElementFromComponentRef?.(componentRef as any);
                    if (!(supposedExtractedElement instanceof HTMLTextAreaElement)) {
                        throw new TypeError(REF_EXTRACTED_TYPE_ERROR_MSG);
                    }
                    elementRef.current = supposedExtractedElement;
                }
                const supposedElement = componentRef.current;
                if (supposedElement instanceof HTMLTextAreaElement && !hasExtractor) {
                    throw new TypeError(REF_TYPE_ERROR_MSG);
                }
            }
            if (isRefObject(markdownTextareaRef) && elementRef.current) {
                const refTrigger: CommandTrigger = (command) => {
                    trigger(command, { __internal: { element: elementRef.current } });
                };
                (markdownTextareaRef as any).current = Object.assign(elementRef.current, { trigger: refTrigger });
            }
        }, [CustomComponent, markdownTextareaRef, trigger, extractElementFromComponentRef]);

        const mtInstanceRef = useRef<MousetrapInstance | MousetrapStatic>();

        useEffect(() => {
            if (!elementRef.current) return;

            mtInstanceRef.current?.reset();
            mtInstanceRef.current = Mousetrap(elementRef.current);

            commands.forEach((command) => {
                if (command.shortcut) {
                    mtInstanceRef.current?.bind(command.shortcut, (keyEvent) => {
                        trigger(command.name, { __internal: { element: elementRef.current, keyEvent } });
                    });
                }
            });
            return () => {
                mtInstanceRef.current?.reset();
                mtInstanceRef.current = undefined;
            };
        }, [commands, trigger]);

        return CustomComponent ? (
            <CustomComponent ref={componentRef} {...(textareaProps as any)} />
        ) : (
            <textarea ref={elementRef} {...textareaProps} />
        );
    }
) as any;

type UseCommandTriggerOptions = {
    commands: CommandConfig[];
    options: MarkdownTextareaOptions;
};

const useCommandTrigger = ({ commands, options }: UseCommandTriggerOptions) => {
    return useCallback<CommandTriggerInternal>(
        async (name, { __internal: { element, keyEvent } }) => {
            const index = findLastIndex(commands, (c) => c.name === name);
            if (!element) return;

            if (index === -1) {
                throw new TypeError(`Command with name "${name}" is not defined`);
            }

            const command = commands[index];

            if (command.enable === false) {
                return;
            }

            const result = await command.handler({ element, keyEvent, options });

            if (result) {
                element.value = result;
                reactTriggerChange(element);
            }
        },
        [commands, options]
    );
};

const getCommandsList = (userCommands: CommandDefine[]) => {
    const resultCommands = [...wellKnownCommands];

    userCommands?.forEach((command) => {
        if (WELL_KNOWN_COMMANDS.includes(command.name as any)) {
            const commandIndex = wellKnownCommands.findIndex((x) => x.name === command.name)!;

            const overrides: CommandConfig = {
                name: resultCommands[commandIndex].name,
                handler: resultCommands[commandIndex].handler,
                enable: command.enable,
                shortcut: command.shortcut,
            };

            resultCommands[commandIndex] = overrides;
        } else {
            if (!command.handler || !(command.handler instanceof Function)) {
                throw new TypeError("Custom command should have a handler function");
            }
            resultCommands.push(command as any);
        }
    });

    return resultCommands;
};
