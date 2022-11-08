import React, { Fragment, useRef, useState } from 'react';
import TextareaMarkdown, { CommandHandler, TextareaMarkdownRef } from 'textarea-markdown-editor';

/** Inserts 🙃 at the current position and select it */
const emojiCommandHandler: CommandHandler = ({ cursor }) => {
    // Cursor - marker means a cursor position, or a selection range if specified two markers
    cursor.insert(`${cursor.MARKER}🙃${cursor.MARKER}`);
};

function App() {
    const [value, setValue] = useState('');
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger('insert-emoji')}>Insert 🙃</button>
            <br />
            <TextareaMarkdown
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                commands={[
                    {
                        name: 'code',
                        shortcut: ['command+/', 'ctrl+/'],
                        shortcutPreventDefault: true,
                    },
                    {
                        name: 'insert-emoji',
                        handler: emojiCommandHandler,
                    },
                ]}
            />
        </Fragment>
    );
}

export default App;
