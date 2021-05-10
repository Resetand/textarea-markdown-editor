export const metaCombination = (...keys: string[]): string[] => {
    return [`command+${keys.join("+")}`, `ctrl+${keys.join("+")}`];
};

export const arrayInsert = <T>(array: T[], position: number, value: T) => {
    return [...array.slice(0, position), value, ...array.slice(position)];
};

export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(min, val), max);

export const getClipboardText = async (): Promise<string | null> => {
    const windowClipboardText = "clipboardData" in window ? (window as any).clipboardData?.getData("text") : null;
    if (windowClipboardText) return windowClipboardText;

    return navigator.clipboard
        .readText()
        .then((text) => text)
        .catch(() => null);
};

export const findLastIndex = <T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number => {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array)) return l;
    }
    return -1;
};

export const trimChars = (text: string, chars: string) => {
    if (chars === "]") chars = "\\]";
    if (chars === "^") chars = "\\^";
    if (chars === "\\") chars = "\\\\";
    return text.replace(new RegExp("^[" + chars + "]+|[" + chars + "]+$", "g"), "");
};

export const escapeRegExp = (text: string) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};
