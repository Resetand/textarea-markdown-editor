import { fireEvent } from "@testing-library/react";
import { changeInputValue } from "../lib/utils";

const createTextArea = (content: string | undefined) => {
    const el = document.createElement("textarea");
    if (content) {
        el.value = content;
    }
    return el;
};

// TODO: need to test undo behavior

describe("utils", () => {
    test("should change input value and emit event", () => {
        const textarea = createTextArea("initial");
        const handleInput = jest.fn();

        textarea.addEventListener("input", handleInput);

        changeInputValue(textarea, "replaced");
        expect(textarea.value).toBe("replaced");

        expect(handleInput).toBeCalledTimes(1);
    });

    test("should change input value and emit event (without textarea.setRangeText support)", () => {
        const textarea = createTextArea("initial");

        // @ts-ignore
        textarea.setRangeText = undefined; // emulate missing

        const handleInput = jest.fn();

        textarea.addEventListener("input", handleInput);

        changeInputValue(textarea, "replaced");
        expect(textarea.value).toBe("replaced");

        expect(handleInput).toBeCalledTimes(1);
    });
});
