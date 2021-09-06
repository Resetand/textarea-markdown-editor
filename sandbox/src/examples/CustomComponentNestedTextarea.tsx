import React, { useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef } from "textarea-markdown-editor";
import TextareaAutosize from "react-textarea-autosize";
/**
 * @see https://github.com/Resetand/textarea-markdown-editor/issues/3
 */
function App() {
    const [value, setValue] = useState("");
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <TextareaMarkdown.Wrapper ref={ref}>
            <div>
                <div>
                    <TextareaAutosize value={value} onChange={(e) => setValue(e.target.value)} />
                </div>
            </div>
        </TextareaMarkdown.Wrapper>
    );
}

export default App;
