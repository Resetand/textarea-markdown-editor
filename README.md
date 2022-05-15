# Textarea Markdown

[![CI status][github-action-image]][github-action-url] [![codecov][codecov-image]][codecov-url] [![NPM version][npm-image]][npm-url]

[npm-image]: http://img.shields.io/npm/v/textarea-markdown-editor.svg
[npm-url]: http://npmjs.org/package/textarea-markdown-editor
[github-action-image]: https://github.com/Resetand/textarea-markdown-editor/actions/workflows/ci.yaml/badge.svg
[github-action-url]: https://github.com/Resetand/textarea-markdown-editor/actions/workflows/ci.yaml
[codecov-image]: https://codecov.io/gh/Resetand/textarea-markdown-editor/branch/master/graph/badge.svg?token=OBD8KR7Y98
[codecov-url]: https://codecov.io/gh/Resetand/textarea-markdown-editor

```bash
npm install textarea-markdown-editor
```

> There are some breaking changes since v1.0.0 released, checkout the [release note](https://github.com/Resetand/textarea-markdown-editor/releases)

---

**Textarea Markdown** is a simple markdown editor using only `<textarea/>`. It extends textarea by adding formatting features like shortcuts, list-wrapping, invoked commands and other to make user experience better 🙃

Essentially this library just provides the textarea Component. You can choose any markdown parser, create your own layout, and use your own textarea component that is styled and behaves however you like

<p style='max-width:800px;margin-top:8%' align="center">
  <img src="https://raw.githubusercontent.com/Resetand/textarea-markdown-editor/master/img/overview.gif" />
</p>

## Features

-   Lists wrapping
-   Auto formatting pasted links
-   Indent tabulation
-   Keyboard shortcuts handling
-   17 built-in customizable commands

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

ℹ️ Ref instance provide the `trigger` function to invoke commands

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

ℹ️ Note that mutation `element.value` will not trigger `change` event on textarea element. Use `cursor.setValue(...)` or other method of `Cursor`.

ℹ️ [Mousetrap.js](https://craig.is/killing/mice) is used under the hood for shortcuts handling.
It is great solution with simple and intuitive api. You can read more about combination in the documentation

### `β` Usage without `react`

```js
import { bootstrapTextareaMarkdown } from "textarea-markdown-editor/dist/bootstrap";

const textarea = document.querySelector("textarea"); // element can be obtained from anywhere, this is just an example;

const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
    options: {}, // optional options config
    commands: [], // optional commands configs
});
```

ℹ️ Checkout [sandbox example](https://codesandbox.io/s/vanila-textarea-markdown-editor-5q6bqb?file=/src/index.js)

ℹ️ Although this is possible, this feature is more of a workaround, since the library was originally written to be used with react, your package manager probably will warn you about missing peer-dependencies

---

### 👀 You can find more examples [here](https://github.com/Resetand/textarea-markdown-editor/tree/master/sandbox/src/examples)

---

## API

-   [TextareaMarkdownProps](#textareamarkdownprops)
-   [Command](#command)
-   [CommandHandler](#commandhandler)
-   [Built-in commands](#built-in-commands)
-   [TextareaMarkdownOptions](#textareamarkdownoptions)
-   [TextareaMarkdownRef](#textareamarkdownref)

#### `TextareaMarkdownProps`

ℹ️ `TextareaMarkdown` accepts all props which native textarea supports

| Property     | Description                     | Type                                                  |
| ------------ | ------------------------------- | ----------------------------------------------------- |
| **options**  | Options config                  | [`TextareaMarkdownOptions`](#textareamarkdownoptions) |
| **commands** | Array of commands configuration | [`Command`](#command)[]                               |

---

#### `Command`

| Name                        | Type                                | Description                                                           |
| :-------------------------- | :---------------------------------- | :-------------------------------------------------------------------- |
| **name**                    | `TType`                             | Built-in or custom command name                                       |
| **shortcut?**               | `string` \| `string`[]              | Shortcut combinations ([Mousetrap.js](https://craig.is/killing/mice)) |
| **shortcutPreventDefault?** | `boolean`                           | Toggle key event prevent `default:false`                              |
| **handler?**                | [`CommandHandler`](#commandhandler) | Handler function for custom commands                                  |
| **enable?**                 | `boolean`                           | Toggle command enabling                                               |

---

#### `CommandHandler`

```ts
export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void>;

export type CommandHandlerContext = {
    textarea: HTMLTextAreaElement;
    cursor: Cursor;
    keyEvent?: KeyboardEvent;
    clipboardEvent?: ClipboardEvent;
    options: TextareaMarkdownOptions;
};
```

---

#### `Built-in commands`

| Name               | Description                                                        | Shortcut               |
| ------------------ | ------------------------------------------------------------------ | ---------------------- |
| **bold**           | Inserts or wraps bold markup                                       | `ctrl/command+b`       |
| **italic**         | Inserts or wraps italic markup                                     | `ctrl/command+i`       |
| **strike-through** | Inserts or wraps strike-through markup                             | `ctrl/command+shift+x` |
| **link**           | Inserts or wraps link markup                                       |                        |
| **image**          | Inserts or wraps image markup                                      |                        |
| **unordered-list** | Inserts or wraps unordered list markup                             |                        |
| **ordered-list**   | Inserts or wraps ordered list markup                               |                        |
| **code-block**     | Inserts or wraps code block markup                                 |                        |
| **code-inline**    | Inserts or wraps inline code markup                                |                        |
| **code**           | Inserts or wraps inline or block code markup dependent of selected |                        |
| **block-quotes**   | Inserts or wraps block-quotes markup                               |                        |
| **h1**             | Inserts h1 headline                                                |                        |
| **h2**             | Inserts h2 headline                                                |                        |
| **h3**             | Inserts h3 headline                                                |                        |
| **h4**             | Inserts h4 headline                                                |                        |
| **h5**             | Inserts h5 headline                                                |                        |
| **h6**             | Inserts h6 headline                                                |                        |

---

### TextareaMarkdownOptions

| Name                                        | Type                                        | Description                                                                                                                              |
| :------------------------------------------ | :------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **preferredBoldSyntax**                     | `"**"` \| `"__"`                            | Preferred bold wrap syntax `default: '**'`                                                                                               |
| **preferredItalicSyntax**                   | `"*"` \| `"_"`                              | Preferred italic wrap syntax `default: '*'`                                                                                              |
| **preferredUnorderedListSyntax**            | `"-"` \| `"*"` \| `"+"`                     | Preferred unordered list prefix `default: '-'`                                                                                           |
| **enableIndentExtension**                   | `boolean`                                   | Will handle `tab` and `shift+tab` keystrokes, on which will insert/remove indentation instead of the default behavior `default:true`     |
| **enableLinkPasteExtension**                | `boolean`                                   | Will handle `paste` event, on which will wrap pasted with link/image markup if pasted is URL `default:true`                              |
| **enablePrefixWrappingExtension**           | `boolean`                                   | Will handle `enter` keystroke, on which will wrap current list sequence if needed `default:true`                                         |
| **enableProperLineRemoveBehaviorExtension** | `boolean`                                   | Will handle `command/ctrl+backspace` keystrokes, on which will remove only a current line instead of the default behavior `default:true` |
| **customPrefixWrapping**                    | (`PrefixWrappingConfig` \| `string`)[]      | Array of custom prefixes, that need to be wrapped. (Will not work with `enablePrefixWrappingExtension:false`)                            |
| **blockQuotesPlaceholder**                  | `string`                                    | `default: 'quote'`                                                                                                                       |
| **boldPlaceholder**                         | `string`                                    | `default: 'bold'`                                                                                                                        |
| **codeBlockPlaceholder**                    | `string`                                    | `default: 'code block'`                                                                                                                  |
| **codeInlinePlaceholder**                   | `string`                                    | `default: 'code'`                                                                                                                        |
| **headlinePlaceholder**                     | `string` \| (`level`: `number`) => `string` | `default: (lvl) => 'headline ' + lvl`                                                                                                    |
| **imageTextPlaceholder**                    | `string`                                    | Used inside default image markup `![<example>](...)` `default: 'example'`                                                                |
| **imageUrlPlaceholder**                     | `string`                                    | Used inside default image markup `![...](<image.png>)` `default: 'image.png'`                                                            |
| **italicPlaceholder**                       | `string`                                    | `default: 'italic'`                                                                                                                      |
| **linkTextPlaceholder**                     | `string`                                    | Used inside default link markup `[<example>](...)` `default: 'example'`                                                                  |
| **linkUrlPlaceholder**                      | `string`                                    | Used inside default image markup `![...](<url>)` `default: 'url'`                                                                        |
| **orderedListPlaceholder**                  | `string`                                    | `default: 'ordered list'`                                                                                                                |
| **strikeThroughPlaceholder**                | `string`                                    | `default: 'strike through'`                                                                                                              |
| **unorderedListPlaceholder**                | `string`                                    | `default: 'unordered list'`                                                                                                              |

---

#### `TextareaMarkdownRef`

ℹ️ Extends `HTMLTextAreaElement` instance

```typescript
trigger: (command: string) => void;
```
