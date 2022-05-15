import React, { Fragment, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef, BUILT_IN_COMMANDS } from "textarea-markdown-editor";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            {BUILT_IN_COMMANDS.map((c) => (
                <button onClick={() => ref.current?.trigger(c)}>{c}</button>
            ))}
            <br />
            <TextareaMarkdown
                options={{ preferredUnorderedListSyntax: "*" }}
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </Fragment>
    );
}

export default App;
