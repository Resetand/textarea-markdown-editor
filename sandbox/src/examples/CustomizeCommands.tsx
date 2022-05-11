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
            options={{ enableIntentExtension: false }}
            commands={[
                {
                    name: "code",
                    shortcut: ["command+/", "ctrl+/"],
                    shortcutPreventDefault: true,
                },
            ]}
        />
    );
}

export default App;
