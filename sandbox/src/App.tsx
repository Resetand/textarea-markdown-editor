import React, { Fragment } from "react";

import Basic from "./examples/Basic";
import BuiltinCommands from "./examples/BuiltinCommands";
import CheckList from "./examples/CheckList";
import CustomComponent from "./examples/CustomComponent";
import CustomComponentNestedTextarea from "./examples/CustomComponentNestedTextarea";
import CustomizeCommands from "./examples/CustomizeCommands";
import ImageUpload from "./examples/ImageUpload";
import SaveIndentOnLineBreak from "./examples/SaveIndentOnLineBreak";

function App() {
    return (
        <Fragment>
            <h2>BuiltinCommands</h2>
            <BuiltinCommands />
            <h2>Basic</h2>
            <Basic />
            <h2>CustomizeCommands</h2>
            <CustomizeCommands />
            <h2>CustomComponent</h2>
            <CustomComponent />
            <h2>ImageUpload</h2>
            <ImageUpload />
            <h2>CustomComponentNestedTextarea</h2>
            <CustomComponentNestedTextarea />
            <h2>CheckList</h2>
            <CheckList />
            <h2>SaveIndentOnLineBreak</h2>
            <SaveIndentOnLineBreak />
        </Fragment>
    );
}
export default App;
