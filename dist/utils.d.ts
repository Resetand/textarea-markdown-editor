export declare const metaCombination: (...keys: string[]) => string[];
export declare const arrayInsert: <T>(array: T[], position: number, value: T) => T[];
export declare const clamp: (val: number, min: number, max: number) => number;
export declare const getClipboardText: () => Promise<string | null>;
export declare const findLastIndex: <T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean) => number;
export declare const trimChars: (text: string, chars: string) => string;
export declare const escapeRegExp: (text: string) => string;
