import { bootstrapTextareaMarkdown } from '../lib/bootstrap';
import { Cursor } from '../lib/Cursor';

const createTextArea = (content: string = '') => {
    const el = document.createElement('textarea');
    el.value = content;
    document.body.appendChild(el);
    return el;
};

describe('bootstrapTextareaMarkdown', () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
        textarea = createTextArea();
    });

    afterEach(() => {
        document.body.removeChild(textarea);
    });

    it('should return trigger, dispose, and cursor', () => {
        const result = bootstrapTextareaMarkdown(textarea);

        expect(result).toHaveProperty('trigger');
        expect(result).toHaveProperty('dispose');
        expect(result).toHaveProperty('cursor');
        expect(typeof result.trigger).toBe('function');
        expect(typeof result.dispose).toBe('function');
        expect(result.cursor).toBeInstanceOf(Cursor);

        result.dispose();
    });

    it('should trigger built-in command', () => {
        textarea.value = 'hello';
        textarea.selectionStart = 0;
        textarea.selectionEnd = 5;

        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea);

        trigger('bold');

        expect(textarea.value).toBe('**hello**');
        dispose();
    });

    it('should throw error for undefined command', () => {
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea);

        expect(() => trigger('nonexistent-command')).toThrow(TypeError);
        expect(() => trigger('nonexistent-command')).toThrow('Command with name "nonexistent-command" is not defined');

        dispose();
    });

    it('should support custom commands', () => {
        let called = false;
        let receivedCtx: any = null;
        const handler = function(ctx: any) {
            called = true;
            receivedCtx = ctx;
        };
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'custom', handler }],
        });

        trigger('custom');

        expect(called).toBe(true);
        expect(receivedCtx.textarea).toBe(textarea);
        expect(receivedCtx.cursor).toBeInstanceOf(Cursor);
        expect(receivedCtx.options).toBeDefined();

        dispose();
    });

    it('should pass arguments to command handler', () => {
        let receivedArgs: any[] = [];
        const handler = function(_ctx: any, ...args: any[]) {
            receivedArgs = args;
        };
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'custom', handler }],
        });

        trigger('custom', 'arg1', 'arg2');

        expect(receivedArgs).toEqual(['arg1', 'arg2']);

        dispose();
    });

    it('should not trigger disabled command', () => {
        let called = false;
        const handler = function() {
            called = true;
        };
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'custom', handler, enable: false }],
        });

        trigger('custom');

        expect(called).toBe(false);

        dispose();
    });

    it('should override built-in command shortcut', () => {
        const { dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'bold', shortcut: 'ctrl+shift+b' }],
        });

        // Just verify it doesn't throw
        dispose();
    });

    it('should throw error for custom command without handler', () => {
        expect(() => {
            bootstrapTextareaMarkdown(textarea, {
                commands: [{ name: 'invalid-custom' } as any],
            });
        }).toThrow(TypeError);
        expect(() => {
            bootstrapTextareaMarkdown(textarea, {
                commands: [{ name: 'invalid-custom' } as any],
            });
        }).toThrow('Custom command should have a handler function');
    });

    it('should merge custom options with defaults', () => {
        let receivedOptions: any = null;
        const handler = function(ctx: any) {
            receivedOptions = ctx.options;
        };
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'test', handler }],
            options: { boldPlaceholder: 'custom-bold' },
        });

        trigger('test');

        expect(receivedOptions.boldPlaceholder).toBe('custom-bold');
        expect(receivedOptions.italicPlaceholder).toBe('italic');

        dispose();
    });

    it('should disable extension when option is false', () => {
        const { dispose } = bootstrapTextareaMarkdown(textarea, {
            options: {
                enableIndentExtension: false,
                enableLinkPasteExtension: false,
                enablePrefixWrappingExtension: false,
                enableProperLineRemoveBehaviorExtension: false,
            },
        });

        // Just verify it doesn't throw
        dispose();
    });

    it('should use last command when multiple commands have same name', () => {
        let called1 = false;
        let called2 = false;
        const handler1 = function() { called1 = true; };
        const handler2 = function() { called2 = true; };
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [
                { name: 'duplicate', handler: handler1 },
                { name: 'duplicate', handler: handler2 },
            ],
        });

        trigger('duplicate');

        expect(called1).toBe(false);
        expect(called2).toBe(true);

        dispose();
    });

    it('should focus textarea when triggering command', () => {
        const handler = function() {};
        const { trigger, dispose } = bootstrapTextareaMarkdown(textarea, {
            commands: [{ name: 'test', handler }],
        });

        const focusSpy = jest.spyOn(textarea, 'focus');

        trigger('test');

        expect(focusSpy).toHaveBeenCalled();

        dispose();
    });
});

describe('bootstrapTextareaMarkdown dispose', () => {
    it('should clean up event listeners on dispose', () => {
        const textarea = createTextArea();
        const removeEventListenerSpy = jest.spyOn(textarea, 'removeEventListener');

        const { dispose } = bootstrapTextareaMarkdown(textarea);
        dispose();

        expect(removeEventListenerSpy).toHaveBeenCalled();

        document.body.removeChild(textarea);
    });
});
