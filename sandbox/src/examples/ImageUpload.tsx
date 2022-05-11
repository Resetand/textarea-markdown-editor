import React, { Fragment, useEffect, useRef, useState } from "react";
import TextareaMarkdown, { TextareaMarkdownRef, Cursor } from "textarea-markdown-editor";

const sleep = (n: number) => new Promise((res) => setTimeout(res, n));

function App() {
    const [value, setValue] = useState("");
    const mdRef = useRef<TextareaMarkdownRef>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current && mdRef.current) {
            const input = inputRef.current;
            const cursor = new Cursor(mdRef.current); // you are free to use Cursor util
            const handler = async () => {
                Array.from(input.files ?? []).forEach(async (file, index) => {
                    if (cursor.position.line.text) {
                        cursor.insert("\n"); // wrap to next line if some line is not empty
                    }
                    const loadingPlaceholder = `[uploading image (${index})...]\n`;
                    cursor.insert(loadingPlaceholder);

                    await sleep(2000); // place to send upload request to you API
                    const resultUrl = URL.createObjectURL(file); // for academic purpose form URL from blob

                    cursor.setValue(
                        cursor.value.replace(loadingPlaceholder, `![${Cursor.MARKER}${file.name}${Cursor.MARKER}](${resultUrl})\n`)
                    );
                });
            };

            input.addEventListener("change", handler);

            return () => input?.removeEventListener("change", handler);
        }
    }, []);

    return (
        <Fragment>
            <div>
                <button>
                    <label htmlFor="fileUpload">Upload file</label>
                    <input ref={inputRef} style={{ display: "none" }} type="file" id="fileUpload" />
                </button>
            </div>
            <TextareaMarkdown ref={mdRef} value={value} onChange={(e) => setValue(e.target.value)} />
        </Fragment>
    );
}

export default App;
