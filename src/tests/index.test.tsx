import React, { FC, useEffect, useRef, useState } from "react";
import TextareaMarkdown, { Command, CommandType, TextareaMarkdownOptions, TextareaMarkdownRef } from "../lib";
import { act, render } from "@testing-library/react";

import { stripIndent } from "common-tags";
import userEvent from "@testing-library/user-event";

type TestCase = {
    description: string;
    commandName?: CommandType;
    input: string;
    expected: string;
    act?: (element: HTMLTextAreaElement) => void;
    only?: boolean;
    skip?: boolean;
    options?: Partial<TextareaMarkdownOptions>;
    commands?: Command[];
};

afterEach(() => jest.resetAllMocks());

/**
 *  `<` - selectionStart
 *  `>` - selectionEnd
 *  @note It required to use both `<` and `>` to indicate cursor selection/position
 *  @note Use &lt and &gt to escape `<` and `>`
 */
const testCases: TestCase[] = [
    // ! bold
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
        description: "should apply bold formatting for multiply line selection",
        commandName: "bold",
        input: stripIndent`
            <some information
            some important information>
        `,
        expected: stripIndent`
            **<some information
            some important information>**
        `,
    },
    {
        description: "should unwrap bold selected if already wrapped",
        commandName: "bold",
        input: "**<some>** string",
        expected: "<some> string",
    },

    // ! italic
    {
        description: "should apply italic formatting for selection",
        commandName: "italic",
        input: "<some> string",
        expected: "*<some>* string",
    },

    // ! link
    {
        description: "should insert link markup",
        commandName: "link",
        input: `some text <>`,
        expected: `some text [example](<url>)`,
    },
    {
        description: "should apply link formatting for selection",
        commandName: "link",
        input: `<name>`,
        expected: `[name](<url>)`,
    },

    // ! image
    {
        description: "should insert image markup",
        commandName: "image",
        input: `some text <>`,
        expected: `some text ![example](<image.png>)`,
    },

    {
        description: "should apply image formatting for selection",
        commandName: "image",
        input: `<image-name>`,
        expected: `![image-name](<image.png>)`,
    },

    // ! ordered-list
    {
        description: "should insert ordered list markup",
        commandName: "ordered-list",
        input: `some item<>`,
        expected: `1. some item<>`,
    },
    {
        description: "should unprefix ordered list markup",
        commandName: "ordered-list",
        input: `1. some item<>`,
        expected: `some item<>`,
    },

    {
        description: "should apply ordered list formatting for selected lines",
        commandName: "ordered-list",
        input: stripIndent`
            o<ne
            two
            tree>
        `,
        expected: stripIndent`
            <1. one
            2. two
            3. tree>  
        `,
    },

    // ! unordered-list
    {
        description: "should insert unordered list markup",
        commandName: "unordered-list",
        input: `some item<>`,
        expected: `- some item<>`,
    },

    // ! code-inline
    {
        description: "should wrap inline code block",
        commandName: "code-inline",
        input: stripIndent`<print('hello, world')>`,
        expected: stripIndent`\`<print('hello, world')>\``,
    },

    // ! code-block
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
    {
        description: "should unwrap code block",
        commandName: "code-block",

        input: stripIndent`
            ${"```"}
            <def main():
                print('hello, world')
                return 'multiline'>
            ${"```"}`,

        expected: stripIndent`
            <def main():
                print('hello, world')
                return 'multiline'>`,
    },

    // ! code
    {
        description: "should wrap inline code block because of single line",
        commandName: "code",
        input: stripIndent`<print('hello, world')>`,
        expected: stripIndent`\`<print('hello, world')>\``,
    },
    {
        description: "should auto wrap code block because of multiply lines",
        commandName: "code",
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

    // ! block-quotes
    {
        description: "should insert block-quotes markup",
        commandName: "block-quotes",
        input: "<>",
        expected: "&gt <quote>",
    },
    {
        description: "should apply block-quotes formatting for selection",
        commandName: "block-quotes",
        input: stripIndent`
            Lorem <ipsum dolor sit amet consectetur adipisicing elit. 
            Qui ab sed sunt voluptate?
            >
        `,
        expected: stripIndent`
            &gt <Lorem ipsum dolor sit amet consectetur adipisicing elit. 
            Qui ab sed sunt voluptate?
            >
        `,
    },

    // ! strike-through
    {
        description: "should apply strike-through formatting for selection",
        commandName: "strike-through",
        input: "<outdated> string",
        expected: "~~<outdated>~~ string",
    },

    // ! headline
    {
        description: "should insert title prefix (h1)",
        commandName: "h1",
        input: stripIndent`
            some content before
            headline level 1<>
            some content after`,

        expected: stripIndent`
            some content before
            # <headline level 1>
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
            ###### <headline level 6>
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
            ###### <headline>
            some content after`,
    },

    {
        description: "should replace title prefix on demand (h6 -> h1)",
        commandName: "h1",
        input: `###### some title<>`,
        expected: `# <some title>`,
    },
    {
        description: "should unprefix headline",
        commandName: "h1",
        input: `# some title<>`,
        expected: `<some title>`,
    },

    // ! Extension: list-wrapping
    {
        description: "should wrap unordered-list",
        input: stripIndent`
            - option 1
            - option 2
            - option 3<>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            - option 1
            - option 2
            - option 3
            - <>`,
    },

    {
        description: "should wrap unordered-list within content",
        input: stripIndent`
            - option 1
            - option 2
            - option 3 <>option 4`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            - option 1
            - option 2
            - option 3 
            - <>option 4`,
    },

    {
        description: "should wrap unordered-list within intent",
        input: stripIndent`
            some content
                - option 1
                - option 2<>
            `,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            some content
                - option 1
                - option 2
                - <>
            `,
    },

    {
        description: "should wrap ordered-list and increase order",
        input: stripIndent`
            1. option 1
            2. option 2
            3. option 3<>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            1. option 1
            2. option 2
            3. option 3
            4. <>`,
    },

    {
        description: "should break wrap on empty unordered-list line",
        input: stripIndent`
            - option 1
            - option 2
            - <>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            - option 1
            - option 2
            
            <>`,
    },

    {
        description: "should break wrap on empty ordered-list line",
        input: stripIndent`
            1. option 1
            2. option 2
            3. <>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            1. option 1
            2. option 2
            
            <>`,
    },

    {
        description: "should wrap custom checklist",
        options: { customWrapping: ["- [] "] },
        input: stripIndent`
            - [] todo 1
            - [] todo 2<>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            - [] todo 1
            - [] todo 2
            - [] <>`,
    },

    {
        description: "should break wrap on empty custom checklist line",
        options: { customWrapping: ["- [] "] },

        input: stripIndent`
            - [] todo 1
            - [] todo 2 
            - [] <>`,

        act: () => userEvent.keyboard("{enter}"),

        expected: stripIndent`
            - [] todo 1
            - [] todo 2 
            
            <>`,
    },

    // ! Extension: link/image paste
    {
        description: "should handle link paste event",
        input: `<title>`,
        act: () => userEvent.paste("https://example.com"),
        expected: `[title](https://example.com) <>`,
    },
    {
        description: "should prevent link paste handling if text is already inside link markup",
        input: `[<title>](https://example.com)`,
        act: () => userEvent.paste("https://example.com"),
        expected: `[https://example.com<>](https://example.com)`,
    },
    {
        description: "should prevent link paste handling if text is already inside link markup #2",
        input: `[<title](https>://example.com)`,
        act: () => userEvent.paste("https://example.com"),
        expected: `[https://example.com<>://example.com)`,
    },
    {
        description: "should handle image link paste event",
        input: `<image>`,
        act: () => userEvent.paste("https://example/image.png"),
        expected: `![image](https://example/image.png) <>`,
    },

    // ! Custom command
    {
        description: "should insert and wrap emoji (custom command)",
        commands: [{ name: "emoji", handler: ({ cursor }) => cursor.insert(`${cursor.MARKER}🙃${cursor.MARKER}`) }],
        commandName: "emoji",
        input: "some text <>",
        expected: "some text <🙃>",
    },

    // ! Extension: intent
    // TODO: Mousetrap bind doesn't trigger on `userEvent.keyboard` | `fireEvent.keydown` | `Mousetrap.trigger`
];

const parseContent = (value: string) => {
    const chars = value.replace(/&lt|&gt/g, " ").split("");
    const text = value.replace(/(<|>)/g, "").replace(/&lt/g, "<").replace(/&gt/g, ">");
    const selectionStart = chars.findIndex((x) => x === "<");
    const selectionEnd = chars.findIndex((x) => x === ">") - 1;
    return { text, selectionEnd, selectionStart };
};

describe("md formatting common cases", () => {
    testCases.forEach((c) => {
        const runner = c.only ? test.only : c.skip ? test.skip : test;
        runner(c.description, async () => {
            const Example: FC = () => {
                const inputData = parseContent(c.input);
                const ref = useRef<TextareaMarkdownRef>(null);
                const [value, setValue] = useState(inputData.text);

                useEffect(() => {
                    ref.current?.setSelectionRange(inputData.selectionStart, inputData.selectionEnd);

                    if (c.commandName) {
                        ref.current?.trigger?.(c.commandName);
                    }
                }, []);

                return (
                    <TextareaMarkdown
                        commands={c.commands}
                        options={c.options}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        ref={ref}
                    />
                );
            };

            const rendered = render(<Example />);
            const textarea = rendered.container.querySelector("textarea")!;

            textarea.focus();

            await act(() => c.act?.(textarea));

            const { selectionEnd, selectionStart, text } = parseContent(c.expected);

            expect(textarea.value).toBe(text);
            expect(textarea.selectionEnd).toBe(selectionEnd);
            expect(textarea.selectionStart).toBe(selectionStart);
        });
    });
});

describe("TextareaMarkdown component usage", () => {
    test("should render textarea", () => {
        const rendered = render(<TextareaMarkdown />);
        expect(rendered.container.firstElementChild).toBeInstanceOf(HTMLTextAreaElement);
    });

    test("should throw an error if using invalid children with TextareaMarkdown.Wrapper", () => {
        const invalidChildren: any[] = [
            null,
            "some string",
            <input />,
            <span>here</span>,
            <div>
                <div></div>
            </div>,
        ];
        for (const invalidChild of invalidChildren) {
            expect(() => render(<TextareaMarkdown.Wrapper>{invalidChild}</TextareaMarkdown.Wrapper>)).toThrow(TypeError);
        }
    });

    test("should use child textarea if using valid children with TextareaMarkdown.Wrapper", () => {
        const validChildren = [
            <textarea />,
            <div>
                <textarea />
            </div>,
            <div>
                <div>some text</div>
                <textarea />
            </div>,
        ];

        for (const validChild of validChildren) {
            const rendered = render(<TextareaMarkdown.Wrapper>{validChild}</TextareaMarkdown.Wrapper>);
            expect(rendered.container.querySelector("textarea")).toBeInstanceOf(HTMLTextAreaElement);
        }
    });
});
