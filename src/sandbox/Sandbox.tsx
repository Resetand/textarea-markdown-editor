import React, { FC, useRef, useState } from "react";
import { MarkdownTextarea, MarkdownTextareaRef } from "../lib/MarkdownTextarea";
import { WELL_KNOWN_COMMANDS } from "../lib/types";
import { MarkdownPreview } from "./MarkdownPreview";

import "./style.css";

export const Sandbox: FC = () => {
    const [value, setValue] = useState("");
    const ref = useRef<MarkdownTextareaRef>(null);

    (window as any).ta = ref.current;

    return (
        <div style={{ width: 800, marginTop: 50 }}>
            {WELL_KNOWN_COMMANDS.map((command) => (
                <button style={{ padding: "0.3px 3px", marginTop: 2, marginLeft: 5 }} onClick={() => ref.current?.trigger(command)}>
                    {command}
                </button>
            ))}

            <MarkdownTextarea
                style={{ width: "100%", height: 150, fontSize: 16, marginTop: 5 }}
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            <MarkdownPreview markdown={value} />
        </div>
    );
};
