[textarea-markdown-editor](README.md) / Exports

# textarea-markdown-editor

## Table of contents

### Classes

-   [Cursor](classes/Cursor.md)

### Type aliases

-   [Command](modules.md#command)
-   [CommandConfig](modules.md#commandconfig)
-   [CommandHandler](modules.md#commandhandler)
-   [CommandHandlerContext](modules.md#commandhandlercontext)
-   [CommandTrigger](modules.md#commandtrigger)
-   [CommandType](modules.md#commandtype)
-   [TextareaMarkdownConfig](modules.md#textareamarkdownconfig)
-   [TextareaMarkdownOptions](modules.md#textareamarkdownoptions)
-   [TextareaMarkdownProps](modules.md#textareamarkdownprops)
-   [TextareaMarkdownRef](modules.md#textareamarkdownref)

### Variables

-   [BUILD_IN_COMMANDS](modules.md#BUILT_IN_COMMANDS)
-   [default](modules.md#default)

### Functions

-   [bootstrapTextareaMarkdown](modules.md#bootstraptextareamarkdown)

## Type aliases

### Command

Ƭ **Command**: `PartialBy`<[`CommandConfig`](modules.md#commandconfig), `"handler"`\>

#### Defined in

[types.ts:159](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L159)

---

### CommandConfig

Ƭ **CommandConfig**<`TType`\>: `Object`

#### Type parameters

| Name    | Type                                                                                      |
| :------ | :---------------------------------------------------------------------------------------- |
| `TType` | extends [`CommandType`](modules.md#commandtype) = [`CommandType`](modules.md#commandtype) |

#### Type declaration

| Name                      | Type                                          | Description                                                           |
| :------------------------ | :-------------------------------------------- | :-------------------------------------------------------------------- |
| `enable?`                 | `boolean`                                     | Toggle command enabling                                               |
| `handler`                 | [`CommandHandler`](modules.md#commandhandler) | Handler function for custom commands                                  |
| `name`                    | `TType`                                       | Built-in or custom command name                                       |
| `shortcut?`               | `string` \| `string`[]                        | Shortcut combinations ([Mousetrap.js](https://craig.is/killing/mice)) |
| `shortcutPreventDefault?` | `boolean`                                     | Toggle key event prevent `default:false`                              |

#### Defined in

[types.ts:42](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L42)

---

### CommandHandler

Ƭ **CommandHandler**: (`context`: [`CommandHandlerContext`](modules.md#commandhandlercontext)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`context`): `void` \| `Promise`<`void`\>

##### Parameters

| Name      | Type                                                        |
| :-------- | :---------------------------------------------------------- |
| `context` | [`CommandHandlerContext`](modules.md#commandhandlercontext) |

##### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[types.ts:40](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L40)

---

### CommandHandlerContext

Ƭ **CommandHandlerContext**: `Object`

#### Type declaration

| Name              | Type                                                            |
| :---------------- | :-------------------------------------------------------------- |
| `clipboardEvent?` | `ClipboardEvent`                                                |
| `cursor`          | [`Cursor`](classes/Cursor.md)                                   |
| `keyEvent?`       | `KeyboardEvent`                                                 |
| `options`         | [`TextareaMarkdownOptions`](modules.md#textareamarkdownoptions) |
| `textarea`        | `HTMLTextAreaElement`                                           |

#### Defined in

[types.ts:32](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L32)

---

### CommandTrigger

Ƭ **CommandTrigger**: (`command`: [`CommandType`](modules.md#commandtype), `keyEvent?`: `KeyboardEvent`) => `void`

#### Type declaration

▸ (`command`, `keyEvent?`): `void`

##### Parameters

| Name        | Type                                    |
| :---------- | :-------------------------------------- |
| `command`   | [`CommandType`](modules.md#commandtype) |
| `keyEvent?` | `KeyboardEvent`                         |

##### Returns

`void`

#### Defined in

[types.ts:157](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L157)

---

### CommandType

Ƭ **CommandType**: `LiteralUnion`<typeof [`BUILT_IN_COMMANDS`](modules.md#BUILT_IN_COMMANDS)[`number`], `string`\>

#### Defined in

[types.ts:30](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L30)

---

### TextareaMarkdownConfig

Ƭ **TextareaMarkdownConfig**: `Object`

#### Type declaration

| Name        | Type                                                                        |
| :---------- | :-------------------------------------------------------------------------- |
| `commands?` | [`Command`](modules.md#command)[]                                           |
| `options?`  | `Partial`<[`TextareaMarkdownOptions`](modules.md#textareamarkdownoptions)\> |

#### Defined in

[types.ts:163](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L163)

---

### TextareaMarkdownOptions

Ƭ **TextareaMarkdownOptions**: `Object`

#### Type declaration

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

#### Defined in

[types.ts:66](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L66)

---

### TextareaMarkdownProps

Ƭ **TextareaMarkdownProps**: `Omit`<[`TextareaMarkdownConfig`](modules.md#textareamarkdownconfig) & `ComponentPropsWithoutRef`<`"textarea"`\>, `"children"`\>

#### Defined in

[types.ts:172](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L172)

---

### TextareaMarkdownRef

Ƭ **TextareaMarkdownRef**: `HTMLTextAreaElement` & { `trigger`: [`CommandTrigger`](modules.md#commandtrigger) }

#### Defined in

[types.ts:168](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L168)

## Variables

### BUILD_IN_COMMANDS

• `Const` **BUILD_IN_COMMANDS**: readonly [``"bold"``, ``"italic"``, ``"strike-through"``, ``"h1"``, ``"h2"``, ``"h3"``, ``"h4"``, ``"h5"``, ``"h6"``, ``"unordered-list"``, ``"ordered-list"``, ``"code-block"``, ``"code-inline"``, ``"code"``, ``"link"``, ``"image"``, ``"block-quotes"``]

#### Defined in

[types.ts:10](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/types.ts#L10)

---

### default

• `Const` **default**: `TextareaMarkdownComponent`

Enhanced textarea element with markdown formatting features

#### Defined in

[TextareaMarkdown.tsx:13](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/TextareaMarkdown.tsx#L13)

## Functions

### bootstrapTextareaMarkdown

▸ **bootstrapTextareaMarkdown**(`textarea`, `config?`): `Object`

#### Parameters

| Name       | Type                  |
| :--------- | :-------------------- |
| `textarea` | `HTMLTextAreaElement` |
| `config`   | `BootstrapConfig`     |

#### Returns

`Object`

| Name      | Type                                          |
| :-------- | :-------------------------------------------- |
| `dispose` | () => `void`                                  |
| `trigger` | [`CommandTrigger`](modules.md#commandtrigger) |

#### Defined in

[bootstrap.ts:20](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/bootstrap.ts#L20)
