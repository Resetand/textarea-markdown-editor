/* eslint-disable jest/valid-title */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* eslint-disable react-hooks/exhaustive-deps */

import TextareaMarkdown, { TextareaMarkdownRef } from "../lib";
import React, { FC, useEffect, useRef, useState } from "react";
import { fireEvent, render } from "@testing-library/react";

import { CommandType } from "../lib/types";
import { stripIndent } from "common-tags";

type TestCase = {
    description: string;
    commandName?: CommandType;
    input: string;
    expected: string;
    before?: () => void;
    after?: () => void;
    act?: (element: HTMLTextAreaElement) => void;
    only?: boolean;
    skip?: boolean;
};

afterEach(() => jest.resetAllMocks());

/**
 *  < - selectionStart
 *  > - selectionEnd
 */
const testCases: TestCase[] = [
    {
        description: "should insert bold markup",
        commandName: "bold",
        input: "<>",
        expected: "**<bold>**",
    },

    {
        description: "should apply bold formatting for selection",
        commandName: "bold",
        input: "<some> string",
        expected: "**<some>** string",
    },
    {
        description: "should unwrap bold selected if already wrapped",
        commandName: "bold",
        input: "**<some>** string",
        expected: "<some> string",
    },
    {
        description: "should work with multiply lines",
        commandName: "bold",
        input: stripIndent`
            some information
            some <important> information
        `,
        expected: stripIndent`
            some information
            some **<important>** information
        `,
    },

    {
        skip: true,
        description: "should wrap unordered-list",
        input: stripIndent`
            - option 1
            - option 2
            - option 3<>`,

        expected: stripIndent`
            - option 1
            - option 2
            - option 3
            - <>`,
    },
    {
        skip: true,
        description: "should wrap ordered-list and increase order",
        act: (el) => fireEvent.keyPress(el, { key: "Enter", code: 13, charCode: 13 }),
        input: stripIndent`
            1. option 1
            2. option 2
            3. option 3<>`,

        expected: stripIndent`
            1. option 1
            2. option 2
            3. option 3
            4. <>`,
    },

    {
        description: "should apply tabulation",
        commandName: "indent",
        input: `some<>`,
        expected: `some    <>`,
    },
    {
        description: "should apply tabulation within list prefix",
        commandName: "indent",
        input: stripIndent`
            - option 1
            - option 2
            - <>`,

        expected: stripIndent`
            - option 1
            - option 2
                - <>`,
    },
    {
        description: "should insert title prefix (h1)",
        commandName: "h1",
        input: stripIndent`
            some content before
            headline level 1<>
            some content after`,

        expected: stripIndent`
            some content before
            # headline level 1<>
            some content after`,
    },
    {
        description: "should insert title prefix (h6)",
        commandName: "h6",
        input: stripIndent`
            some content before
            headline level 6<>
            some content after`,

        expected: stripIndent`
            some content before
            ###### headline level 6<>
            some content after`,
    },
    {
        description: "should replace title prefix on demand (h1 -> h6)",
        commandName: "h6",
        input: stripIndent`
            some content before
            # headline<>
            some content after`,

        expected: stripIndent`
            some content before
            ###### headline<>
            some content after`,
    },

    {
        description: "should replace title prefix on demand (h6 -> h1)",
        commandName: "h1",
        input: `###### some title<>`,
        expected: `# some title<>`,
    },
    {
        description: "should unprefix headline",
        commandName: "h1",
        input: `# some title<>`,
        expected: `some title<>`,
    },
    {
        description: "should insert ordered list",
        commandName: "ordered-list",
        input: `some item<>`,
        expected: `1. some item<>`,
    },
    {
        description: "should unprefix ordered list",
        commandName: "ordered-list",
        input: `1. some item<>`,
        expected: `some item<>`,
    },
    {
        description: "should insert link markup",
        commandName: "link",
        input: `some text <>`,
        expected: `some text [<example>](url)`,
    },
    {
        description: "should insert image markup",
        commandName: "image",
        input: `some text <>`,
        expected: `some text ![image](<image.png>)`,
    },
    {
        description: "should wrap inline code block",
        commandName: "code-inline",
        input: stripIndent`<print('hello, world')>`,
        expected: stripIndent`\`<print('hello, world')>\``,
    },
    {
        description: "should wrap code block",
        commandName: "code-block",
        input: stripIndent`
            <def main():
                print('hello, world')
                return 'multiline'>`,

        expected: stripIndent`
            ${"```"}
            <def main():
                print('hello, world')
                return 'multiline'>
            ${"```"}`,
    },
];

// TODO: Fix tests selection
describe("md formatting common cases", () => {
    testCases.forEach((c) => {
        const runner = c.only ? test.only : c.skip ? test.skip : test;
        runner(c.description, () => {
            c.before?.();
            const prepare = (value: string) => value.replace(/(<|>)/g, "");
            const Example: FC = () => {
                const [value, setValue] = useState(prepare(c.input));
                const ref = useRef<TextareaMarkdownRef>(null);

                useEffect(() => {
                    if (!ref.current) return;
                    const selectionStart = c.input.split("").findIndex((x) => x === "<");
                    const selectionEnd = c.input.split("").findIndex((x) => x === ">") - 1;
                    ref.current.setSelectionRange(selectionStart, selectionEnd);

                    if (c.commandName) {
                        ref.current.trigger?.(c.commandName);
                    }
                }, []);
                return <TextareaMarkdown ref={ref} value={value} onChange={(e) => setValue(e.target.value)} />;
            };

            const component = render(<Example />);
            const textArea = component.container.querySelector("textarea")!;
            c.act?.(textArea);

            // const selectionStart = c.expected.split("").findIndex((x) => x === "<");
            // const selectionEnd = c.expected.split("").findIndex((x) => x === ">") - 1;

            expect(textArea.value).toBe(prepare(c.expected));
            // expect(textArea.selectionStart).toBe(selectionStart);
            // expect(textArea.selectionEnd).toBe(selectionEnd);

            c.after?.();
        });
    });
});
