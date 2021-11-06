# Textarea Markdown

[![forthebadge](http://forthebadge.com/images/badges/made-with-typescript.svg)](http://forthebadge.com)
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)

## Basic Overview

**Textarea Markdown** is a simple markdown editor using only `<textarea/>`. It extends textarea by adding formatting features like shortcuts, invoked commands, and other to make user experience better 🙃

Essentially this library just provide textarea Component. You can choose any markdown parser, any layout. Can use any existing textarea Component and style it as you prefer

<p align="center">
  <img src="https://raw.githubusercontent.com/Resetand/textarea-markdown-editor/master/img/overview.gif" />
</p>

### 🎯 Features

-   Lists wrapping
-   Auto formatting pasted links
-   Indent tabulation
-   20 built-in customizable commands

## Installation and usage

### Quick Start ⚡️

```bash
$ npm install textarea-markdown-editor
```

```typescript
import React, { Fragment, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger("bold")}>Bold</button>
            <TextareaMarkdown ref={ref} value={value} onChange={(e) => setValue(e.target.value)} />
        </Fragment>
    );
}
```

ℹ️ Ref instance provide `trigger` function to invoke commands

### Customize commands

You can specify or overwrite shortcuts and toggle commands

```typescript
import React, { useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
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
                    name: "indent",
                    enable: false,
                },
            ]}
        />
    );
}
```

ℹ️ [Mousetrap.js](https://craig.is/killing/mice) is used under the hood for shortcuts handling.
It is great solution with simple and intuitive api. You can read more about combination in the documentation if necessary

### Custom textarea `Component`

You can use custom textarea Component. Just wrap it with `TextareaMarkdown.Wrapper`

```typescript
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

## API

#### `Props`

ℹ️ `TextareaMarkdown` accepts all props which native textarea support

| Property     | Description                     | Type                    |
| ------------ | ------------------------------- | ----------------------- |
| **options**  | Options config                  | TextareaMarkdownOptions |
| **commands** | Array of commands configuration | CommandDefine           |

---

#### `Built-in commands`

| Name               | Description                                                      | Shortcut               |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| **bold**           | Insert or wrap bold markup                                       | `ctrl/command+b`       |
| **italic**         | Insert or wrap italic markup                                     | `ctrl/command+i`       |
| **strike-through** | Insert or wrap strike-through markup                             | `ctrl/command+shift+x` |
| **next-line**      | Wrapping sequence `meta`                                         | `enter`                |
| **indent**         | Insert tabulation intent on tab                                  | `tab`                  |
| **unindent**       | Remove line tabulation intent                                    | `shift+tab`            |
| **link-paste**     | Wrap pasted links in markup if text selected `meta`              | `ctrl/command+v`       |
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

ℹ️ Do not need to trigger `meta` commands

---

#### `TextareaMarkdownOptions`

| Property                     | Description                                   | Type               | Default                      |
| ---------------------------- | --------------------------------------------- | ------------------ | ---------------------------- |
| **useListTabulation**        | Toggle tabulation lists prefix within content | boolean            | `true`                       |
| **unorderedListSyntax**      | Unordered list prefix syntax                  | string             | `-`                          |
| **boldSyntax**               | Bold wrapper syntax                           | string             | `**`                         |
| **italicSyntax**             | Italic wrapper syntax                         | string             | `*`                          |
| **boldPlaceholder**          |                                               | string             | `bold`                       |
| **italicPlaceholder**        |                                               | string             | `italic`                     |
| **strikeThroughPlaceholder** |                                               | string             | `strike through`             |
| **codeInlinePlaceholder**    |                                               | string             | `code`                       |
| **codeBlockPlaceholder**     |                                               | string             | `code block`                 |
| **unorderedListPlaceholder** |                                               | string             | `ordered list`               |
| **headlinePlaceholder**      |                                               | string \| Function | `(lvl) => 'headline ' + lvl` |
| **blockQuotesPlaceholder**   |                                               | string             | `quote`                      |

---

#### `CommandDefine`

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
