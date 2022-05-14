import { MutableRefObject, RefObject } from "react";

export const metaCombination = (...keys: string[]): string[] => {
    return [`command+${keys.join("+")}`, `ctrl+${keys.join("+")}`];
};

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(min, val), max);

export const findLast = <T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined => {
    let curIndex = array.length;
    while (curIndex--) {
        if (predicate(array[curIndex], curIndex, array)) return array[curIndex];
    }
    return undefined;
};

export const trimChars = (text: string, chars: string) => {
    return text.replace(new RegExp("^[" + escapeRegExp(chars) + "]+|[" + chars + "]+$", "g"), "");
};

export const isBtwOrEq = (value: number, a: number, b: number) => {
    return value >= Math.min(a, b) && value <= Math.max(a, b);
};

let browserSupportsTextareaTextNodes: any;
function canManipulateViaTextNodes(input: HTMLTextAreaElement | HTMLInputElement): boolean {
    if (input.nodeName !== "TEXTAREA") {
        return false;
    }
    if (typeof browserSupportsTextareaTextNodes === "undefined") {
        const textarea: HTMLTextAreaElement = document.createElement("textarea");
        textarea.value = "1";
        browserSupportsTextareaTextNodes = Boolean(textarea.firstChild);
    }
    return browserSupportsTextareaTextNodes;
}

/**
 * @param {HTMLTextAreaElement|HTMLInputElement} input
 * @param {string} value
 * @returns {void}
 */
export function changeInputValue(input: HTMLTextAreaElement | HTMLInputElement, value: string): void {
    // clear value before insertion

    // Most of the used APIs only work with the field selected
    input.focus();

    // since we replace all content
    input.select();

    // Webkit + Edge
    const isSuccess = document.execCommand && document.execCommand("insertText", false, value);

    if (!isSuccess) {
        const start = input.selectionStart!;
        const end = input.selectionEnd!;

        // Firefox (non-standard method)
        if (typeof input.setRangeText === "function") {
            input.setRangeText(value);
        } else {
            //
            // To make a change we just need a Range, not a Selection
            const range = document.createRange();
            const textNode = document.createTextNode(value);

            if (canManipulateViaTextNodes(input)) {
                let node = input.firstChild;

                // If textarea is empty, just insert the text
                if (!node) {
                    input.appendChild(textNode);
                } else {
                    // Otherwise we need to find a nodes for start and end
                    let offset = 0;
                    let startNode = null;
                    let endNode = null;

                    while (node && (startNode === null || endNode === null)) {
                        const nodeLength = node.nodeValue!.length;

                        // if start of the selection falls into current node
                        if (start >= offset && start <= offset + nodeLength) {
                            range.setStart((startNode = node), start - offset);
                        }

                        // if end of the selection falls into current node
                        if (end >= offset && end <= offset + nodeLength) {
                            range.setEnd((endNode = node), end - offset);
                        }

                        offset += nodeLength;
                        node = node.nextSibling;
                    }

                    // If there is some text selected, remove it as we should replace it
                    if (start !== end) {
                        range.deleteContents();
                    }
                }
            }

            // If the node is a textarea and the range doesn't span outside the element
            //
            // Get the commonAncestorContainer of the selected range and test its type
            // If the node is of type `#text` it means that we're still working with text nodes within our textarea element
            // otherwise, if it's of type `#document` for example it means our selection spans outside the textarea.
            if (canManipulateViaTextNodes(input) && range.commonAncestorContainer.nodeName === "#text") {
                // Finally insert a new node. The browser will automatically split start and end nodes into two if necessary
                range.insertNode(textNode);
            } else {
                // If the node is not a textarea or the range spans outside a textarea the only way is to replace the whole value
                input.value = value;
            }
        }

        // Correct the cursor position to be at the end of the insertion
        input.setSelectionRange(start + value.length, start + value.length);

        // Notify any possible listeners of the change
        const e = document.createEvent("UIEvent");
        e.initEvent("input", true, false);
        input.dispatchEvent(e);
    }
}

/**
 * 1. -> 2.
 * 1.1. -> 1.2.
 */
export const getIncrementedOrderedListPrefix = (prefix: string) => {
    const parts = trimChars(prefix.trim(), ".").split(".");
    const currentCount = parseInt(parts[parts.length - 1]);

    if (parts.length === 1) {
        return `${currentCount + 1}.`;
    }

    return `${parts.slice(0, -1).join(".")}.${currentCount + 1}.`;
};

export const isRefObject = <TAttributes extends any>(ref: React.Ref<TAttributes>): ref is MutableRefObject<TAttributes> => {
    return ref !== null && typeof ref === "object";
};

/** Will try to find textarea or throws an Error  */
export const findTextArea = (element: Element | null) => {
    const CHILDREN_ERROR_MSG =
        "TextareaMarkdown wrapper: child element must be instance of HTMLTextAreaElement or container with an textarea element";

    if (!element) {
        throw new TypeError(CHILDREN_ERROR_MSG);
    }

    if (element instanceof HTMLTextAreaElement) {
        return element;
    }

    const queried = element.querySelector("textarea");

    if (queried instanceof HTMLTextAreaElement) {
        return queried;
    }

    throw new TypeError(CHILDREN_ERROR_MSG);
};

export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
