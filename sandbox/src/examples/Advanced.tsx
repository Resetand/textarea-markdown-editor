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
