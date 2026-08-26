import {
    metaCombination,
    clamp,
    findLast,
    trimChars,
    isBtwOrEq,
    getIncrementedOrderedListPrefix,
    isRefObject,
    escapeRegExp,
    isURL,
    isImageURL,
    fireInput,
} from '../lib/utils';

describe('metaCombination', () => {
    it('should return both command and ctrl combinations for single key', () => {
        const result = metaCombination('b');
        expect(result).toEqual(['command+b', 'ctrl+b']);
    });

    it('should return both command and ctrl combinations for multiple keys', () => {
        const result = metaCombination('shift', 'x');
        expect(result).toEqual(['command+shift+x', 'ctrl+shift+x']);
    });
});

describe('clamp', () => {
    it('should return value when within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min when value is below range', () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max when value is above range', () => {
        expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases at boundaries', () => {
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });
});

describe('findLast', () => {
    it('should find the last matching element', () => {
        const arr = [1, 2, 3, 2, 1];
        const result = findLast(arr, (x) => x === 2);
        expect(result).toBe(2);
    });

    it('should return undefined if no match found', () => {
        const arr = [1, 2, 3];
        const result = findLast(arr, (x) => x === 5);
        expect(result).toBeUndefined();
    });

    it('should return the last occurrence when multiple matches exist', () => {
        const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 1, name: 'c' }];
        const result = findLast(arr, (x) => x.id === 1);
        expect(result).toEqual({ id: 1, name: 'c' });
    });

    it('should handle empty array', () => {
        const result = findLast([], () => true);
        expect(result).toBeUndefined();
    });

    it('should pass correct arguments to predicate', () => {
        const arr = ['a', 'b', 'c'];
        const predicate = jest.fn(() => false);
        findLast(arr, predicate);
        
        expect(predicate).toHaveBeenCalledWith('c', 2, arr);
        expect(predicate).toHaveBeenCalledWith('b', 1, arr);
        expect(predicate).toHaveBeenCalledWith('a', 0, arr);
    });
});

describe('trimChars', () => {
    it('should trim specified characters from both ends', () => {
        expect(trimChars('...hello...', '.')).toBe('hello');
    });

    it('should trim multiple different characters', () => {
        expect(trimChars('##hello##', '#')).toBe('hello');
    });

    it('should not trim characters in the middle', () => {
        expect(trimChars('.hello.world.', '.')).toBe('hello.world');
    });

    it('should handle empty string', () => {
        expect(trimChars('', '.')).toBe('');
    });

    it('should handle string with only trim characters', () => {
        expect(trimChars('...', '.')).toBe('');
    });
});

describe('isBtwOrEq', () => {
    it('should return true when value is between a and b', () => {
        expect(isBtwOrEq(5, 0, 10)).toBe(true);
    });

    it('should return true when value equals a', () => {
        expect(isBtwOrEq(0, 0, 10)).toBe(true);
    });

    it('should return true when value equals b', () => {
        expect(isBtwOrEq(10, 0, 10)).toBe(true);
    });

    it('should return false when value is outside range', () => {
        expect(isBtwOrEq(15, 0, 10)).toBe(false);
        expect(isBtwOrEq(-5, 0, 10)).toBe(false);
    });

    it('should work when a > b (reversed range)', () => {
        expect(isBtwOrEq(5, 10, 0)).toBe(true);
        expect(isBtwOrEq(15, 10, 0)).toBe(false);
    });
});

describe('getIncrementedOrderedListPrefix', () => {
    it('should increment simple number prefix', () => {
        expect(getIncrementedOrderedListPrefix('1.')).toBe('2.');
    });

    it('should increment nested prefix', () => {
        expect(getIncrementedOrderedListPrefix('1.1.')).toBe('1.2.');
    });

    it('should increment deeply nested prefix', () => {
        expect(getIncrementedOrderedListPrefix('1.2.3.')).toBe('1.2.4.');
    });

    it('should handle prefix with spaces', () => {
        expect(getIncrementedOrderedListPrefix('  1.  ')).toBe('2.');
    });

    it('should handle larger numbers', () => {
        expect(getIncrementedOrderedListPrefix('99.')).toBe('100.');
    });
});

describe('isRefObject', () => {
    it('should return true for ref object', () => {
        const ref = { current: null };
        expect(isRefObject(ref)).toBe(true);
    });

    it('should return false for null', () => {
        expect(isRefObject(null)).toBe(false);
    });

    it('should return false for function ref', () => {
        const ref = () => {};
        expect(isRefObject(ref)).toBe(false);
    });

    it('should return false for undefined', () => {
        expect(isRefObject(undefined as any)).toBe(false);
    });
});

describe('escapeRegExp', () => {
    it('should escape special regex characters', () => {
        expect(escapeRegExp('.*+?^${}()|[]\\'))
            .toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should not modify regular strings', () => {
        expect(escapeRegExp('hello world')).toBe('hello world');
    });

    it('should handle empty string', () => {
        expect(escapeRegExp('')).toBe('');
    });

    it('should escape mixed content', () => {
        expect(escapeRegExp('hello.world*')).toBe('hello\\.world\\*');
    });
});

describe('isURL', () => {
    it('should return true for valid http URL', () => {
        expect(isURL('http://example.com')).toBe(true);
    });

    it('should return true for valid https URL', () => {
        expect(isURL('https://example.com')).toBe(true);
    });

    it('should return true for URL with path', () => {
        expect(isURL('https://example.com/path/to/page')).toBe(true);
    });

    it('should return true for URL with query params', () => {
        expect(isURL('https://example.com?foo=bar')).toBe(true);
    });

    it('should return false for invalid URL', () => {
        expect(isURL('not a url')).toBe(false);
    });

    it('should return false for empty string', () => {
        expect(isURL('')).toBe(false);
    });

    it('should return false for non-string values', () => {
        expect(isURL(null)).toBe(false);
        expect(isURL(undefined)).toBe(false);
        expect(isURL(123)).toBe(false);
        expect(isURL({})).toBe(false);
    });
});

describe('isImageURL', () => {
    it('should return true for .png URL', () => {
        expect(isImageURL('https://example.com/image.png')).toBe(true);
    });

    it('should return true for .jpg URL', () => {
        expect(isImageURL('https://example.com/image.jpg')).toBe(true);
    });

    it('should return true for .jpeg URL', () => {
        expect(isImageURL('https://example.com/image.jpeg')).toBe(true);
    });

    it('should return true for .gif URL', () => {
        expect(isImageURL('https://example.com/image.gif')).toBe(true);
    });

    it('should return false for non-image URL', () => {
        expect(isImageURL('https://example.com/document.pdf')).toBe(false);
    });

    it('should return false for URL without extension', () => {
        expect(isImageURL('https://example.com/image')).toBe(false);
    });

    it('should return false for invalid URL', () => {
        expect(isImageURL('not a url')).toBe(false);
    });
});

describe('fireInput with selection ranges', () => {
    const createTextArea = (content: string) => {
        const el = document.createElement('textarea');
        el.value = content;
        return el;
    };

    it('should replace specific range in text', () => {
        const textarea = createTextArea('hello world');
        fireInput(textarea, 'beautiful ', 6, 6);
        expect(textarea.value).toBe('hello beautiful world');
    });

    it('should replace selected text', () => {
        const textarea = createTextArea('hello world');
        fireInput(textarea, 'universe', 6, 11);
        expect(textarea.value).toBe('hello universe');
    });

    it('should insert at beginning', () => {
        const textarea = createTextArea('world');
        fireInput(textarea, 'hello ', 0, 0);
        expect(textarea.value).toBe('hello world');
    });

    it('should append at end', () => {
        const textarea = createTextArea('hello');
        fireInput(textarea, ' world', 5, 5);
        expect(textarea.value).toBe('hello world');
    });

    it('should set cursor position after insertion', () => {
        const textarea = createTextArea('hello world');
        fireInput(textarea, 'test', 6, 6);
        expect(textarea.selectionStart).toBe(10);
        expect(textarea.selectionEnd).toBe(10);
    });
});
