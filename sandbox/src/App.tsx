import React, { Fragment } from "react";
import Advanced from "./examples/Advanced";
import CustomComponent from "./examples/CustomComponent";
import CustomizeCommands from "./examples/CustomizeCommands";
import QuickStart from "./examples/Basic";
import BuiltinCommands from "./examples/BuiltinCommands";
import CustomComponentNestedTextarea from "./examples/CustomComponentNestedTextarea";

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
            <h2>CustomComponentNestedTextarea</h2>
            <CustomComponentNestedTextarea />
        </Fragment>
    );
}
export default App;
