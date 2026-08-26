const stripIndent = (strings: TemplateStringsArray, ...values: unknown[]): string => {
    const raw = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
    const lines = raw.split('\n');
    const minIndent = lines
        .filter((line) => line.trim())
        .reduce((min, line) => {
            const indent = line.match(/^\s*/)?.[0].length ?? 0;
            return Math.min(min, indent);
        }, Infinity);
    return lines
        .map((line) => line.slice(minIndent === Infinity ? 0 : minIndent))
        .join('\n')
        .trim();
};

describe('stripIndent', () => {
    it('should strip common indentation from multiline string', () => {
        const result = stripIndent`
            line 1
            line 2
            line 3
        `;
        expect(result).toBe('line 1\nline 2\nline 3');
    });

    it('should preserve relative indentation', () => {
        const result = stripIndent`
            parent
                child
                    grandchild
        `;
        expect(result).toBe('parent\n    child\n        grandchild');
    });

    it('should handle single line', () => {
        const result = stripIndent`hello world`;
        expect(result).toBe('hello world');
    });

    it('should handle empty string', () => {
        const result = stripIndent``;
        expect(result).toBe('');
    });

    it('should handle string with only whitespace lines', () => {
        const result = stripIndent`
            
            content
            
        `;
        // trim() removes leading/trailing empty lines
        expect(result).toBe('content');
    });

    it('should interpolate values', () => {
        const name = 'world';
        const result = stripIndent`
            hello ${name}
            goodbye ${name}
        `;
        expect(result).toBe('hello world\ngoodbye world');
    });

    it('should handle mixed indentation levels', () => {
        const result = stripIndent`
            - item 1
              - nested 1
            - item 2
        `;
        expect(result).toBe('- item 1\n  - nested 1\n- item 2');
    });

    it('should handle code blocks with backticks', () => {
        const result = stripIndent`
            ${'```'}
            code here
            ${'```'}
        `;
        expect(result).toBe('```\ncode here\n```');
    });
});
