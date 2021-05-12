[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://forthebadge.com)

## Basic Overview

**Markdown textarea** is a simple markdown UI headless editor using only `<textarea/>`. It extend textarea by adding formatting features like shortcuts, invoked commands, and other to make user experience better 🙃

Essentially this library - just provide textarea Component. You can choose any engine for markdown rendering, any layout. Can use any existing textarea Component and style it as you prefer

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

#### `TextareaMarkdownProps`

`TextareaMarkdown` Component props

ℹ️ extends `HTMLTextAreaElement` props

```typescript
options?: TextareaMarkdownOptions;
commands?: CommandDefine[];
```

#### `TextareaMarkdownWrapperProps`

`TextareaMarkdown.Wrapper` Component props

```typescript
options?: TextareaMarkdownOptions;
commands?: CommandDefine[];
```

#### `TextareaMarkdownOptions`

Option prop config

```typescript
/** toggle auto wrapping with link markup when pasting the selected word */
useLinkMarkupOnSelectionPasteUrl?: boolean;

/** toggle tabulation lists prefix with content  */
useIndentListPrefixTabulation?: boolean;

/** unordered list prefix syntax  */
unorderedListSyntax?: "-" | "*";

/** bold wrapper syntax  */
boldSyntax?: "**" | "__";

/** italic wrapper syntax  */
italicSyntax?: "*" | "_";
```

#### `CommandDefine`

Commands array item

```typescript
name: string;
/** for custom commands */
handler?: CommandHandler;
shortcut?: string | string[];
shortcutPreventDefault?: boolean;
enable?: boolean;
```

#### `CommandHandler`

Custom handler signature

```typescript
export type CommandHandler = (context: CommandHandlerContext) => void | Promise<void> | Promise<string> | string;

export type CommandHandlerContext = {
    element: HTMLTextAreaElement;
    keyEvent?: KeyboardEvent;
    options: TextareaMarkdownOptions;
};
```

#### `TextareaMarkdownRef`

Ref `TextareaMarkdown` or `TextareaMarkdown.Wrapper` instance

ℹ️ extends `HTMLTextAreaElement` instance

```typescript
trigger: (command: string) => void;
```

## Advanced usage 🧬

You can implement your **own commands**. For this you need to registry command by adding new item in `commands` array.
CommandConfig contain `name`, `handler` and optional `shortcut`.

**Handler** - invoked by trigger call or by pressing shortcuts and it make side effect with textarea.
Basically you can make with `element` whatever you want, but most likely you need to manipulate with content. For this
purpose you can use `Cursor` service. This wrapper combines content and selection manipulation and also proved calculated information
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

👀 You can find more examples [here](https://github.com/Resetand/textarea-markdown-editor/blob/master/src/lib/handlers.ts#L62)

ℹ️ Note that mutation `element.value` will not trigger `change` event on textarea element. Use `cursor.setValue(...)`
or just return new content from handler.
