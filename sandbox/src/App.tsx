import React, { Fragment } from "react";

import BuiltinCommands from "./examples/BuiltinCommands";
import CustomComponent from "./examples/CustomComponent";
import CustomComponentNestedTextarea from "./examples/CustomComponentNestedTextarea";
import CheckList from "./examples/CheckList";
import CustomizeCommands from "./examples/CustomizeCommands";
import ImageUpload from "./examples/ImageUpload";
import Basic from "./examples/Basic";

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
        </Fragment>
    );
}
export default App;
