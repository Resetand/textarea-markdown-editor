// import { getClipboardText } from "../utils";

export const mockNavigatorClipboard = (x: { clipboardText: string }) => {
    jest.mock('getClipboardText', () => () => new Promise((res) => res(x.clipboardText)));
};
