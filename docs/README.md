textarea-markdown-editor / [Exports](modules.md)

# Textarea Markdown

[![CI status][github-action-image]][github-action-url] [![codecov][codecov-image]][codecov-url] [![NPM version][npm-image]][npm-url]

[npm-image]: http://img.shields.io/npm/v/textarea-markdown-editor.svg?style=flat-square
[npm-url]: http://npmjs.org/package/textarea-markdown-editor
[github-action-image]: https://github.com/Resetand/textarea-markdown-editor/actions/workflows/test.yaml/badge.svg
[github-action-url]: https://github.com/Resetand/textarea-markdown-editor/actions/workflows/test.yaml
[codecov-image]: https://img.shields.io/codecov/c/github/resetand/textarea-markdown-editor/master.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/resetand/textarea-markdown-editor/branch/master

```bash
npm install textarea-markdown-editor
```

---

**Textarea Markdown** is a simple markdown editor using only `<textarea/>`. It extends textarea by adding formatting features like shortcuts, invoked commands, and other to make user experience better 🙃

Essentially this library just provides textarea Component. You can choose any markdown parser, create your own layout, and use your own textarea component that is styled however you like

<p align="center">
  <img src="https://raw.githubusercontent.com/Resetand/textarea-markdown-editor/master/img/overview.gif" />
</p>

## Features

-   Lists wrapping
-   Auto formatting pasted links
-   Indent tabulation
-   20 built-in customizable commands

## Usage

```tsx
import React, { Fragment, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger("bold")}>Bold</button>
            <br />
            <TextareaMarkdown ref={ref} value={value} onChange={(e) => setValue(e.target.value)} />
        </Fragment>
    );
}
```

ℹ️ Ref instance provide `trigger` function to invoke commands

### Custom textarea `Component`

You can use custom textarea Component. Just wrap it with `TextareaMarkdown.Wrapper`

```tsx
import React, { useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor";
import TextareaAutosize from "react-textarea-autosize";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <TextareaMarkdown.Wrapper ref={ref}>
            <TextareaAutosize value={value} onChange={(e) => setValue(e.target.value)} />
        </TextareaMarkdown.Wrapper>
    );
}
```

ℹ️ This solution will not create any real dom wrapper

### Customize commands

You can specify or overwrite shortcuts for built-in commands or create your own

```tsx
import React, { useRef, useState } from "react";
import TextareaMarkdown, { CommandHandler, TextareaMarkdownRef } from "textarea-markdown-editor";

/** Inserts 🙃 at the current position and select it */
const emojiCommandHandler: CommandHandler = ({ cursor }) => {
    // MARKER - means a cursor position, or a selection range if specified two markers
    cursor.insert(`${cursor.MARKER}🙃${cursor.MARKER}`);
};

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger("insert-emoji")}>Insert 🙃</button>
            <br />
            <TextareaMarkdown
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                commands={[
                    {
                        name: "code",
                        shortcut: ["command+/", "ctrl+/"],
                        shortcutPreventDefault: true,
                    },
                    {
                        name: "insert-emoji",
                        handler: emojiCommandHandler,
                    },
                ]}
            />
        </Fragment>
    );
}
```

ℹ️ [Mousetrap.js](https://craig.is/killing/mice) is used under the hood for shortcuts handling.
It is great solution with simple and intuitive api. You can read more about combination in the documentation

## API

-   [Built-in commands](#built-in)
-   [TextareaMarkdownOptions](modules.md#textareamarkdownoptions)
-   [Command](#command)

<!-- - [CommandConfig](#commandconfig) -->
<!-- - [CommandHandler](modules.md#commandhandler) -->
<!-- - [CommandHandlerContext](modules.md#commandhandlercontext) -->
<!-- - [CommandTrigger](modules.md#commandtrigger) -->
<!-- - [CommandType](modules.md#commandtype) -->
<!-- - [TextareaMarkdownConfig](modules.md#textareamarkdownconfig) -->
<!-- - [TextareaMarkdownProps](modules.md#textareamarkdownprops) -->
<!-- - [TextareaMarkdownRef](modules.md#textareamarkdownref) -->

#### `Props`

ℹ️ `TextareaMarkdown` accepts all props which native textarea support

| Property     | Description                     | Type                    |
| ------------ | ------------------------------- | ----------------------- |
| **options**  | Options config                  | TextareaMarkdownOptions |
| **commands** | Array of commands configuration | Command[]               |

---

#### `Built-in commands`

| Name               | Description                                                      | Shortcut               |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| **bold**           | Insert or wrap bold markup                                       | `ctrl/command+b`       |
| **italic**         | Insert or wrap italic markup                                     | `ctrl/command+i`       |
| **strike-through** | Insert or wrap strike-through markup                             | `ctrl/command+shift+x` |
| **link**           | Insert link markup                                               |                        |
| **image**          | Insert image markup                                              |                        |
| **unordered-list** | Insert unordered list markup                                     |                        |
| **ordered-list**   | Insert ordered list markup                                       |                        |
| **code-block**     | Insert or wrap code block markup                                 |                        |
| **code-inline**    | Insert or wrap inline code markup                                |                        |
| **code**           | Insert or wrap inline or block code markup dependent of selected |                        |
| **block-quotes**   | Insert block-quotes markup                                       |                        |
| **h1**             | Insert h1 headline                                               |                        |
| **h2**             | Insert h2 headline                                               |                        |
| **h3**             | Insert h3 headline                                               |                        |
| **h4**             | Insert h4 headline                                               |                        |
| **h5**             | Insert h5 headline                                               |                        |
| **h6**             | Insert h6 headline                                               |                        |

---

### TextareaMarkdownOptions

| Name                                      | Type                                        | Description                                                                                                                                        |
| :---------------------------------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `blockQuotesPlaceholder`                  | `string`                                    | `default: 'quote'`                                                                                                                                 |
| `boldPlaceholder`                         | `string`                                    | `default: 'bold'`                                                                                                                                  |
| `codeBlockPlaceholder`                    | `string`                                    | `default: 'code block'`                                                                                                                            |
| `codeInlinePlaceholder`                   | `string`                                    | `default: 'code'`                                                                                                                                  |
| `customPrefixWrapping`                    | (`PrefixWrappingConfig` \| `string`)[]      | Array of custom prefixes, that need to be wrapped. (Will not work with `enablePrefixWrappingExtension:false`)                                      |
| `enableIndentExtension`                   | `boolean`                                   | Will handle `tab` and `shift+tab` keystrokes, on which will insert/remove indentation instead of the default behavior `default:true`               |
| `enableLinkPasteExtension`                | `boolean`                                   | Will handle `paste` event, on which will wrap pasted with link/image markup if pasted is URL `default:true`                                        |
| `enablePrefixWrappingExtension`           | `boolean`                                   | Will handle `enter` keystroke, on which will wrap current list sequence if needed `default:true`                                                   |
| `enableProperLineRemoveBehaviorExtension` | `boolean`                                   | Will handle `tab` and `command/ctrl+backspace` keystrokes, on which will remove only a current line instead of the default behavior `default:true` |
| `headlinePlaceholder`                     | `string` \| (`level`: `number`) => `string` | `default: (lvl) => 'headline ' + lvl`                                                                                                              |
| `imageTextPlaceholder`                    | `string`                                    | Used inside default image markup `![<example>](...)` `default: 'example'`                                                                          |
| `imageUrlPlaceholder`                     | `string`                                    | Used inside default image markup `![...](<image.png>)` `default: 'image.png'`                                                                      |
| `italicPlaceholder`                       | `string`                                    | `default: 'italic'`                                                                                                                                |
| `linkTextPlaceholder`                     | `string`                                    | Used inside default link markup `[<example>](...)` `default: 'example'`                                                                            |
| `linkUrlPlaceholder?`                     | `string`                                    | Used inside default image markup `![...](<url>)` `default: 'url'`                                                                                  |
| `orderedListPlaceholder`                  | `string`                                    | `default: 'ordered list'`                                                                                                                          |
| `preferredBoldSyntax`                     | `"**"` \| `"__"`                            | Preferred bold wrap syntax `default: '**'`                                                                                                         |
| `preferredItalicSyntax`                   | `"*"` \| `"_"`                              | Preferred italic wrap syntax `default: '*'`                                                                                                        |
| `preferredUnorderedListSyntax`            | `"-"` \| `"*"` \| `"+"`                     | Preferred unordered list prefix `default: '-'`                                                                                                     |
| `strikeThroughPlaceholder`                | `string`                                    | `default: 'strike through'`                                                                                                                        |
| `unorderedListPlaceholder`                | `string`                                    | `default: 'unordered list'`                                                                                                                        |

---

#### `Command`

| Property                   | Description                                                           | Type           |
| -------------------------- | --------------------------------------------------------------------- | -------------- |
| **name**                   | Command name                                                          | string         |
| **shortcut**               | Shortcut combinations ([Mousetrap.js](https://craig.is/killing/mice)) | string         |
| **handler**                | Handler function, using for custom commands                           | CommandHandler |
| **shortcutPreventDefault** | Toggle key event prevent                                              | boolean        |
| **enable**                 | Toggle command enable                                                 | boolean        |

---

#### `TextareaMarkdownRef`

Ref `TextareaMarkdown` instance

ℹ️ Extends `HTMLTextAreaElement` instance

```typescript
trigger: (command: string) => void;
```

## Advanced usage 🧬

You can implement your **own commands**. For this you need to registry command by adding new item in `commands` array.
Item should contains `name`, `handler` and optional `shortcut`.

**Handler** - function invoked by trigger call or by pressing shortcuts, it make side effect with textarea.
Basically you can make with `element` whatever you want, but most likely you need to manipulate with content. For this
purpose you can use `Cursor`. This wrapper combines content and selection manipulation and also provide calculated information
about position context and more.

```typescript
import React, { Fragment, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef, Cursor, CommandHandler } from "textarea-markdown-editor";

/** Inserts 🙃 at the end of the line and select it */
const emojiCommandHandler: CommandHandler = ({ element }) => {
    const cursor = new Cursor(element);
    const currentLine = cursor.getLine();

    // Cursor.$ - marker means cursor position, if specified two markers indicate a selection range
    cursor.spliceContent(Cursor.raw`${currentLine} ${Cursor.$}🙃${Cursor.$}`, {
        replaceCount: 1, // replace current line
    });
};

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger("insert-emoji")}>Insert 🙃</button>
            <TextareaMarkdown
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                commands={[{ name: "insert-emoji", handler: emojiCommandHandler }]}
            />
        </Fragment>
    );
}

export default App;
```

#### `CommandHandler` signature

```typescript
export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void> | Promise<string> | string;

export type CommandHandlerContext = {
    element: HTMLTextAreaElement;
    keyEvent?: KeyboardEvent;
    options: TextareaMarkdownOptions;
};
```

👀 You can find more examples [here](https://github.com/Resetand/textarea-markdown-editor/blob/master/src/lib/handlers.ts#L91)

ℹ️ Note that mutation `element.value` will not trigger `change` event on textarea element. Use `cursor.setText(...)`
or just return new content from handler.
