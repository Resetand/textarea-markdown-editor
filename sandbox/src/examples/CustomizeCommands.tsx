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

export default App;
