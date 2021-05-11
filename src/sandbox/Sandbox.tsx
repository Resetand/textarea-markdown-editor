// import React, { FC, useRef, useState } from "react";
// import TextareaAutosize from "react-textarea-autosize";
// import { MarkdownTextarea } from "../lib/MarkdownTextarea";
// import { MarkdownTextareaRef, WELL_KNOWN_COMMANDS } from "../lib/types";
// import { MarkdownPreview } from "./MarkdownPreview";
// import "./style.css";

// export const Sandbox: FC = () => {
//     const [value, setValue] = useState("");
//     const ref = useRef<MarkdownTextareaRef>(null);

//     return (
//         <div style={{ width: 800, marginTop: 50 }}>
//             {WELL_KNOWN_COMMANDS.map((command) => (
//                 <button
//                     key={command}
//                     style={{ padding: "0.3px 3px", marginTop: 2, marginLeft: 5 }}
//                     onClick={() => ref.current?.trigger(command)}
//                 >
//                     {command}
//                 </button>
//             ))}

//             <MarkdownTextarea.Wrapper ref={ref}>
//                 <TextareaAutosize
//                     value={value}
//                     onChange={(e) => setValue(e.target.value)}
//                     style={{ width: "100%", height: 150, fontSize: 16, marginTop: 5 }}
//                 />
//             </MarkdownTextarea.Wrapper>

//             <MarkdownPreview markdown={value} />
//         </div>
//     );
// };

import React, { FC, Fragment, useRef, useState } from "react";
import MarkdownTextarea, { MarkdownTextareaRef, Cursor } from "../lib";
import { CommandHandler } from "../lib/types";

/** Inserts 🙃 at the end of the line and select it */
const emojiCommandHandler: CommandHandler = ({ element }) => {
    const cursor = new Cursor(element);
    const currentLine = cursor.getLine();

    // Cursor.$ - marker means cursor position, if specified two markers mean selection range
    cursor.spliceContent(Cursor.raw`${currentLine} ${Cursor.$}🙃${Cursor.$}`, {
        replaceCount: 1, // replace current line
    });
};

export const Sandbox: FC = () => {
    const [value, setValue] = useState("");
    const ref = useRef<MarkdownTextareaRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger("insert-emoji")}>Insert 🙃</button>
            <MarkdownTextarea
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                commands={[{ name: "insert-emoji", handler: emojiCommandHandler }]}
            />
        </Fragment>
    );
};
