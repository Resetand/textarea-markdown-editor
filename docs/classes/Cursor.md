[textarea-markdown-editor](../README.md) / [Exports](../modules.md) / Cursor

# Class: Cursor

Util for manipulation with textarea content and text selection

## Table of contents

### Constructors

- [constructor](Cursor.md#constructor)

### Properties

- [MARKER](Cursor.md#marker)
- [MARKER](Cursor.md#marker-1)

### Accessors

- [lines](Cursor.md#lines)
- [position](Cursor.md#position)
- [selection](Cursor.md#selection)
- [value](Cursor.md#value)

### Methods

- [execRaw](Cursor.md#execraw)
- [insert](Cursor.md#insert)
- [insertAtCursor](Cursor.md#insertatcursor)
- [isSelectedWrappedWith](Cursor.md#isselectedwrappedwith)
- [lineAt](Cursor.md#lineat)
- [normalizeSelection](Cursor.md#normalizeselection)
- [replaceCurrentLines](Cursor.md#replacecurrentlines)
- [replaceLine](Cursor.md#replaceline)
- [select](Cursor.md#select)
- [setValue](Cursor.md#setvalue)
- [wrap](Cursor.md#wrap)

## Constructors

### constructor

• **new Cursor**(`element`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `element` | `HTMLTextAreaElement` |

#### Defined in

[Cursor.new.ts:62](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L62)

## Properties

### MARKER

• **MARKER**: `Marker`

#### Defined in

[Cursor.new.ts:60](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L60)

___

### MARKER

▪ `Static` **MARKER**: `Marker` = `MARKER`

#### Defined in

[Cursor.new.ts:59](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L59)

## Accessors

### lines

• `get` **lines**(): `Line`[]

#### Returns

`Line`[]

information about each line of text

#### Defined in

[Cursor.new.ts:71](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L71)

___

### position

• `get` **position**(): `Position`

#### Returns

`Position`

information about current position

#### Defined in

[Cursor.new.ts:107](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L107)

___

### selection

• `get` **selection**(): ``null`` \| `Selection`

#### Returns

``null`` \| `Selection`

information about current selection

#### Defined in

[Cursor.new.ts:82](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L82)

___

### value

• `get` **value**(): `string`

#### Returns

`string`

#### Defined in

[Cursor.new.ts:66](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L66)

## Methods

### execRaw

▸ `Private` **execRaw**(`sourceText`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sourceText` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `selectionEnd` | ``null`` \| `number` |
| `selectionStart` | ``null`` \| `number` |
| `text` | `string` |

#### Defined in

[Cursor.new.ts:283](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L283)

___

### insert

▸ **insert**(`content`): `void`

Insert text at the cursor position.
if some content is selected will replace it

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:147](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L147)

___

### insertAtCursor

▸ `Private` **insertAtCursor**(`content`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `content` | `string` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:158](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L158)

___

### isSelectedWrappedWith

▸ `Private` **isSelectedWrappedWith**(`markup`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `markup` | `string` \| [`string`, `string`] |

#### Returns

`boolean`

#### Defined in

[Cursor.new.ts:242](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L242)

___

### lineAt

▸ **lineAt**(`lineNumber`): ``null`` \| `Line`

#### Parameters

| Name | Type |
| :------ | :------ |
| `lineNumber` | `number` |

#### Returns

``null`` \| `Line`

information about line

#### Defined in

[Cursor.new.ts:139](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L139)

___

### normalizeSelection

▸ `Private` **normalizeSelection**(`text`, `defaultBehavior?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `text` | `string` | `undefined` |
| `defaultBehavior` | ``"TO_START"`` \| ``"TO_END"`` \| ``"SELECT_ALL"`` | `"TO_END"` |

#### Returns

`string`

#### Defined in

[Cursor.new.ts:268](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L268)

___

### replaceCurrentLines

▸ **replaceCurrentLines**(`callback`, `options?`): `void`

Replace all selected lines
if nothing is selected will replace the current line

**`note`** line is considered as selected even if it is partially selected

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`this`: [`Cursor`](Cursor.md), `line`: `Line`, `index`: `number`, `currentLines`: `Line`[]) => ``null`` \| `string` | The map function will be called once for each selected line and will replace the contents of the line with the result of the call |
| `options?` | `Object` | - |
| `options.selectReplaced?` | `boolean` | - |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:171](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L171)

___

### replaceLine

▸ **replaceLine**(`lineNumber`, `content`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `lineNumber` | `number` |
| `content` | ``null`` \| `string` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:191](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L191)

___

### select

▸ **select**(`options`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `SelectRange` \| `SelectRelative` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:256](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L256)

___

### setValue

▸ **setValue**(`text`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:113](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L113)

___

### wrap

▸ **wrap**(`markup`, `options?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `markup` | `string` \| [`string`, `string`] |
| `options?` | `WrapOptions` |

#### Returns

`void`

#### Defined in

[Cursor.new.ts:208](https://github.com/Resetand/markdown-textarea/blob/371c3b8b/src/lib/Cursor.new.ts#L208)
