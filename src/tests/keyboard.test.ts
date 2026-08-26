import { KeyboardShortcuts } from '../lib/keyboard';

describe('KeyboardShortcuts', () => {
    let element: HTMLDivElement;
    let keyboard: KeyboardShortcuts;

    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
        keyboard = new KeyboardShortcuts(element);
    });

    afterEach(() => {
        keyboard.reset();
        document.body.removeChild(element);
    });

    const fireKeydown = (key: string, options: Partial<KeyboardEventInit> = {}) => {
        const event = new KeyboardEvent('keydown', {
            key,
            code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
            bubbles: true,
            ...options,
        });
        element.dispatchEvent(event);
        return event;
    };

    describe('basic key binding', () => {
        it('should bind and trigger simple key', () => {
            const handler = jest.fn();
            keyboard.bind('a', handler);

            fireKeydown('a');

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should not trigger for different key', () => {
            const handler = jest.fn();
            keyboard.bind('a', handler);

            fireKeydown('b');

            expect(handler).not.toHaveBeenCalled();
        });

        it('should bind Tab key', () => {
            const handler = jest.fn();
            keyboard.bind('tab', handler);

            fireKeydown('Tab', { code: 'Tab' });

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('modifier keys', () => {
        it('should bind ctrl+key', () => {
            const handler = jest.fn();
            keyboard.bind('ctrl+b', handler);

            fireKeydown('b', { ctrlKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should bind command+key (meta)', () => {
            const handler = jest.fn();
            keyboard.bind('command+b', handler);

            fireKeydown('b', { metaKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should bind shift+key', () => {
            const handler = jest.fn();
            keyboard.bind('shift+tab', handler);

            fireKeydown('Tab', { code: 'Tab', shiftKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should bind alt+key', () => {
            const handler = jest.fn();
            keyboard.bind('alt+a', handler);

            fireKeydown('a', { altKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should bind multiple modifiers', () => {
            const handler = jest.fn();
            keyboard.bind('ctrl+shift+a', handler);

            fireKeydown('a', { ctrlKey: true, shiftKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should not trigger if modifier is missing', () => {
            const handler = jest.fn();
            keyboard.bind('ctrl+b', handler);

            fireKeydown('b'); // no ctrl

            expect(handler).not.toHaveBeenCalled();
        });

        it('should not trigger if extra modifier is present', () => {
            const handler = jest.fn();
            keyboard.bind('ctrl+b', handler);

            fireKeydown('b', { ctrlKey: true, shiftKey: true }); // extra shift

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('array of shortcuts', () => {
        it('should bind multiple shortcuts to same handler', () => {
            const handler = jest.fn();
            keyboard.bind(['ctrl+b', 'command+b'], handler);

            fireKeydown('b', { ctrlKey: true });
            expect(handler).toHaveBeenCalledTimes(1);

            fireKeydown('b', { metaKey: true });
            expect(handler).toHaveBeenCalledTimes(2);
        });
    });

    describe('reset', () => {
        it('should remove all bindings on reset', () => {
            const handler = jest.fn();
            keyboard.bind('a', handler);

            keyboard.reset();
            fireKeydown('a');

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('special keys', () => {
        it('should bind backspace', () => {
            const handler = jest.fn();
            keyboard.bind('command+backspace', handler);

            fireKeydown('Backspace', { code: 'Backspace', metaKey: true });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should bind enter', () => {
            const handler = jest.fn();
            keyboard.bind('enter', handler);

            fireKeydown('Enter', { code: 'Enter' });

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('event object', () => {
        it('should pass KeyboardEvent to handler', () => {
            const handler = jest.fn();
            keyboard.bind('a', handler);

            const event = fireKeydown('a');

            expect(handler).toHaveBeenCalledWith(event);
        });

        it('should allow preventDefault in handler', () => {
            const handler = jest.fn((e: KeyboardEvent) => e.preventDefault());
            keyboard.bind('tab', handler);

            const event = fireKeydown('Tab', { code: 'Tab', cancelable: true });

            expect(event.defaultPrevented).toBe(true);
        });
    });
});
