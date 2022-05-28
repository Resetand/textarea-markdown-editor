import React, { useRef, useState } from 'react';
import TextareaMarkdown, { TextareaMarkdownRef } from 'textarea-markdown-editor';
import TextareaAutosize from 'react-textarea-autosize';

function App() {
    const [value, setValue] = useState('');
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <TextareaMarkdown.Wrapper ref={ref}>
            <TextareaAutosize value={value} onChange={(e) => setValue(e.target.value)} />
        </TextareaMarkdown.Wrapper>
    );
}

export default App;
