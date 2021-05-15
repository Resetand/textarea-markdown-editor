import React, { Fragment, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef, WELL_KNOWN_COMMANDS } from "textarea-markdown-editor";

function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            {WELL_KNOWN_COMMANDS.map((c) => (
                <button onClick={() => ref.current?.trigger(c)}>{c}</button>
            ))}
            <br />
            <TextareaMarkdown ref={ref} value={value} onChange={(e) => setValue(e.target.value)} />
        </Fragment>
    );
}

export default App;
