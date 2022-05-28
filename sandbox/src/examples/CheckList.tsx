import React, { useRef, useState } from 'react';
import TextareaMarkdown, { CommandHandler, TextareaMarkdownRef } from 'textarea-markdown-editor';

const checklistHandler: CommandHandler = ({ cursor }) => {
    cursor.replaceCurrentLines((line) => `- [] ${line.text.replace('- []', '')}`, {
        selectReplaced: Boolean(cursor.selection),
    });
};

function App() {
    const [value, setValue] = useState('');
    const mdRef = useRef<TextareaMarkdownRef>(null);

    return (
        <div>
            <div>
                <button onClick={() => mdRef.current?.trigger('checklist')}>checklist</button>
            </div>
            <TextareaMarkdown
                ref={mdRef}
                options={{ customPrefixWrapping: ['- [] '] }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                commands={[{ name: 'checklist', handler: checklistHandler }]}
            />
        </div>
    );
}

export default App;
