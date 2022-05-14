import Mousetrap from "mousetrap";
import { buildInCommands } from "./commands";
import { Cursor } from "./Cursor.new";
import { properLineRemoveBehaviorExtension, indentExtension, linkPasteExtension, prefixWrappingExtension } from "./extensions";
import {
    Command,
    CommandConfig,
    CommandTrigger,
    defaultTextareaMarkdownOptions,
    TextareaMarkdownOptions,
    BUILT_IN_COMMANDS,
} from "./types";
import { findLast } from "./utils";

type BootstrapConfig = {
    commands?: Command[];
    options?: Partial<TextareaMarkdownOptions>;
};

export const bootstrapTextareaMarkdown = (textarea: HTMLTextAreaElement, config: BootstrapConfig = {}) => {
    const cursor = new Cursor(textarea);
    const mousetrap = new Mousetrap(textarea);

    const commands = mergedCommandsList(config.commands);
    const options = { ...defaultTextareaMarkdownOptions, ...config.options };

    const trigger: CommandTrigger = async (name, keyEvent) => {
        const command = findLast(commands, (c) => c.name === name);

        if (!command) {
            throw new TypeError(`Command with name "${name}" is not defined`);
        }

        // ! disabled only if `false`
        if (command.enable === false) {
            return;
        }

        textarea.focus();
        command.handler({ textarea, keyEvent, options, cursor });
    };

    // subscribe on shortcuts
    commands.forEach((command) => {
        if (command.shortcut) {
            mousetrap.bind(command.shortcut, (keyEvent) => {
                if (command.shortcutPreventDefault) {
                    keyEvent.preventDefault();
                }
                trigger(command.name, keyEvent);
            });
        }
    });

    // bootstrap extensions if enabled, extension can optionally returns a cleanup function, which will be called inside dispose
    const extensions = [
        options.enableIndentExtension && indentExtension(textarea, options),
        options.enableLinkPasteExtension && linkPasteExtension(textarea, options),
        options.enablePrefixWrappingExtension && prefixWrappingExtension(textarea, options),
        options.enableProperLineRemoveBehaviorExtension && properLineRemoveBehaviorExtension(textarea, options),
    ];

    // unsubscribe from all listeners
    const dispose = () => {
        mousetrap.reset();
        extensions.forEach((cleanupExtension) => cleanupExtension instanceof Function && cleanupExtension());
    };

    return {
        trigger,
        dispose,
    };
};

const mergedCommandsList = (customCommands: Command[] = []) => {
    const commands = [...buildInCommands];

    customCommands?.forEach((command) => {
        if (BUILT_IN_COMMANDS.includes(command.name as any)) {
            const commandIndex = buildInCommands.findIndex((x) => x.name === command.name)!;

            const overrides: CommandConfig = {
                name: commands[commandIndex].name,
                handler: commands[commandIndex].handler!,
                enable: command.enable,
                shortcut: command.shortcut,
            };

            commands[commandIndex] = overrides;
        } else {
            if (!command.handler || !(command.handler instanceof Function)) {
                throw new TypeError("Custom command should have a handler function");
            }
            commands.push(command as any);
        }
    });

    return commands;
};
