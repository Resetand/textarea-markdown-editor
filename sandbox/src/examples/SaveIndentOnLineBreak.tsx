import React, { useRef, useState } from 'react';
import TextareaMarkdown, { TextareaMarkdownRef, TextareaMarkdownOptions } from 'textarea-markdown-editor';

const textareaMarkdownOptions: Partial<TextareaMarkdownOptions> = {
    customPrefixWrapping: [
        {
            prefix: '', // no need to insert a prefix
            prefixPattern: /\s+/, // pattern checks that line start with indent
            shouldSaveIndent: true,
            shouldBreakIfEmpty: false,
        },
    ],
};

function App() {
    const [value, setValue] = useState('');
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <TextareaMarkdown
            options={textareaMarkdownOptions}
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
}

export default App;
