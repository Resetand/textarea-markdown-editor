import React, { useRef, useState } from 'react';
import TextareaMarkdown, { TextareaMarkdownRef, CommandHandler } from 'textarea-markdown-editor';

const mentionHandler: CommandHandler<[string]> = ({ cursor }, name) => {
    if (name) {
        cursor.insert(`@${name.replace('@', '')} ${cursor.MARKER}`);
    } else {
        cursor.insert(`@${cursor.MARKER}unknown${cursor.MARKER}`);
    }
};

function App() {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    ref.current?.trigger('mention', name);
                }}
            >
                <input placeholder='@user-name' onChange={(e) => setName(e.target.value)} value={name} />
                <button type='submit'>mention</button>
            </form>
            <TextareaMarkdown
                commands={[{ name: 'mention', handler: mentionHandler, shortcut: 'command+shift+2' }]}
                ref={ref}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}

export default App;
