import React, { Fragment } from "react";

import Advanced from "./examples/Advanced";
import BuiltinCommands from "./examples/BuiltinCommands";
import CustomComponent from "./examples/CustomComponent";
import CustomComponentNestedTextarea from "./examples/CustomComponentNestedTextarea";
import CustomWrapping from "./examples/CustomWrapping";
import CustomizeCommands from "./examples/CustomizeCommands";
import ImageUpload from "./examples/ImageUpload";
import QuickStart from "./examples/Basic";

function App() {
    return (
        <Fragment>
            <h2>BuiltinCommands</h2>
            <BuiltinCommands />
            <h2>QuickStart</h2>
            <QuickStart />
            <h2>CustomizeCommands</h2>
            <CustomizeCommands />
            <h2>CustomComponent</h2>
            <CustomComponent />
            <h2>Advanced</h2>
            <Advanced />
            <h2>ImageUpload</h2>
            <ImageUpload />
            <h2>CustomComponentNestedTextarea</h2>
            <CustomComponentNestedTextarea />
            <h2>CustomWrapping</h2>
            <CustomWrapping />
        </Fragment>
    );
}
export default App;
