import * as reactTriggerChange from "react-trigger-change";

import {
    CommandConfig,
    CommandDefine,
    CommandTrigger,
    CommandTriggerInternal,
    MarkdownTextareaComponent,
    MarkdownTextareaConfig,
    MarkdownTextareaOptions,
    MarkdownTextareaProps,
    MarkdownTextareaRef,
    WELL_KNOWN_COMMANDS,
    defaultMarkdownTextareaOptions,
    isRefObject,
} from "./types";
import Mousetrap, { MousetrapInstance, MousetrapStatic } from "mousetrap";
import React, { Fragment, MutableRefObject, RefObject, forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { findLastIndex } from "./utils";
import { wellKnownCommands } from "./commands";

const CHILDREN_ERROR_MSG = "MarkdownTextarea: child element must be instance of HTMLTextAreaElement";

export const MarkdownTextarea = forwardRef<MarkdownTextareaRef, MarkdownTextareaProps>((props, ref) => {
    const { commands: userCommands, options: userOptions, ...textareaProps } = props;
    const textareaNodeRef = useRef<HTMLTextAreaElement>(null);

    useBootstrap({
        props,
        ref,
        textareaRef: textareaNodeRef,
    });

    return <textarea ref={textareaNodeRef} {...textareaProps} />;
}) as MarkdownTextareaComponent;

MarkdownTextarea.Wrapper = forwardRef<MarkdownTextareaRef, MarkdownTextareaProps>((props, ref) => {
    const { children } = props;
    const textareaNodeRef = useRef<HTMLTextAreaElement>();
    const domHolderElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (React.Children.count(children) !== 1) {
            throw new TypeError(CHILDREN_ERROR_MSG);
        }

        if (children && domHolderElementRef.current && !textareaNodeRef.current) {
            const node = domHolderElementRef.current.previousSibling;
            if (node instanceof HTMLTextAreaElement) {
                textareaNodeRef.current = node;
            } else {
                throw new TypeError(CHILDREN_ERROR_MSG);
            }
            domHolderElementRef.current.remove();
        }
    }, [children]);

    useBootstrap({
        props,
        ref,
        textareaRef: textareaNodeRef,
    });

    return (
        <Fragment>
            {children}
            <div style={{ display: "none" }} ref={domHolderElementRef} />
        </Fragment>
    );
});

type UseBootstrapOptions = {
    props: MarkdownTextareaConfig;
    ref: React.Ref<MarkdownTextareaRef>;
    textareaRef: RefObject<HTMLTextAreaElement | null | undefined>;
};

const useBootstrap = ({ props, ref, textareaRef }: UseBootstrapOptions) => {
    const { commands: userCommands, options: userOptions } = props;

    const markdownTextareaRef = ref as MutableRefObject<MarkdownTextareaRef>;
    const commands = useMemo(() => getCommandsList(userCommands ?? []), [userCommands]);
    const options = useMemo<MarkdownTextareaOptions>(() => Object.assign({}, defaultMarkdownTextareaOptions, userOptions), [userOptions]);

    const trigger = useCallback<CommandTriggerInternal>(
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

    const refTrigger = useCallback<CommandTrigger>((command) => trigger(command, { __internal: { element: textareaRef.current } }), [
        textareaRef,
        trigger,
    ]);

    useEffect(() => {
        if (isRefObject(markdownTextareaRef) && textareaRef.current) {
            markdownTextareaRef.current = Object.assign(textareaRef.current, {
                trigger: refTrigger,
            });
        }
    }, [textareaRef, markdownTextareaRef, refTrigger]);

    const mtInstanceRef = useRef<MousetrapInstance | MousetrapStatic>();

    useEffect(() => {
        if (!textareaRef.current) return;

        mtInstanceRef.current?.reset();
        mtInstanceRef.current = Mousetrap(textareaRef.current);

        commands.forEach((command) => {
            if (command.shortcut) {
                mtInstanceRef.current?.bind(command.shortcut, (keyEvent) => {
                    if (command.shortcutPreventDefault) {
                        keyEvent.preventDefault();
                    }
                    trigger(command.name, { __internal: { element: textareaRef.current, keyEvent } });
                });
            }
        });
        return () => {
            mtInstanceRef.current?.reset();
            mtInstanceRef.current = undefined;
        };
    }, [commands, textareaRef, trigger]);

    return {
        commands,
        options,
    };
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
