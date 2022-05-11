import React, { forwardRef, Fragment, ReactElement, RefObject, useEffect, useRef } from "react";
import { bootstrapTextareaMarkdown } from "./bootstrap";
import { Command, TextareaMarkdownComponent, TextareaMarkdownOptions, TextareaMarkdownProps, TextareaMarkdownRef } from "./types";
import { findTextArea, isRefObject } from "./utils";

type TextareaMarkdownWrapperProps = TextareaMarkdownProps & {
    children: ReactElement;
};

/**
 * Enhanced textarea element with markdown formatting features
 */
export const TextareaMarkdown = forwardRef<TextareaMarkdownRef, TextareaMarkdownProps>(({ commands, options, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useBootstrap({
        ref,
        options,
        commands,
        textareaRef,
    });

    return <textarea ref={textareaRef} {...props} />;
}) as TextareaMarkdownComponent;

/**
 * Allows you to wrap a custom textarea component
 */
const TextareaMarkdownWrapper = forwardRef<TextareaMarkdownRef, TextareaMarkdownWrapperProps>(({ children, commands, options }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>();
    const holderElementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!textareaRef.current && holderElementRef.current) {
            if (React.Children.count(children) !== 1) {
                throw new TypeError("TextareaMarkdownWrapper: expected one react-element as a child");
            }
            textareaRef.current = findTextArea(holderElementRef.current.previousElementSibling);
        }
    }, [children]);

    useBootstrap({
        ref,
        options,
        commands,
        textareaRef,
    });

    return (
        <Fragment>
            {children}
            <div style={{ display: "none" }} ref={holderElementRef} />
        </Fragment>
    );
});

TextareaMarkdown.Wrapper = TextareaMarkdownWrapper;

type UseBootstrapOptions = {
    commands?: Command[];
    options?: Partial<TextareaMarkdownOptions>;

    // TextareaMarkdown ref
    ref: React.Ref<TextareaMarkdownRef>;

    // current HTMLTextAreaElement ref
    textareaRef: RefObject<HTMLTextAreaElement | null | undefined>;
};

const useBootstrap = ({ commands, options, ref, textareaRef }: UseBootstrapOptions) => {
    useEffect(() => {
        if (!textareaRef.current) {
            return;
        }

        const { dispose, trigger } = bootstrapTextareaMarkdown(textareaRef.current, {
            commands,
            options,
        });

        // initialize the TextareaMarkdown ref
        if (isRefObject(ref)) {
            ref.current = Object.assign(textareaRef.current, { trigger });
        }

        return dispose;

        // reinitialize only on demand
    }, [JSON.stringify({ commands, options })]);
};
