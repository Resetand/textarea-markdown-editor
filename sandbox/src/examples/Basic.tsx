import React, { Fragment, useRef, useState } from 'react';
import TextareaMarkdown, { TextareaMarkdownRef } from 'textarea-markdown-editor';

function App() {
    const [value, setValue] = useState('');
    const ref = useRef<TextareaMarkdownRef>(null);

    return (
        <Fragment>
            <button onClick={() => ref.current?.trigger('bold')}>Bold</button>
            <br />
            <TextareaMarkdown ref={ref} value={value} onChange={(e) => setValue(e.target.value)} />
        </Fragment>
    );
}

export default App;
