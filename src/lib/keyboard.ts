type KeyHandler = (event: KeyboardEvent) => void;

type KeyBinding = {
    shortcut: string;
    handler: KeyHandler;
};

const KEY_ALIASES: Record<string, string> = {
    command: 'meta',
    cmd: 'meta',
    ctrl: 'control',
    option: 'alt',
    mod: navigator?.platform?.includes('Mac') ? 'meta' : 'control',
};

const parseShortcut = (shortcut: string): { key: string; modifiers: Set<string> } => {
    const parts = shortcut.toLowerCase().split('+');
    const modifiers = new Set<string>();
    let key = '';

    for (const part of parts) {
        const normalized = KEY_ALIASES[part] || part;
        if (['meta', 'control', 'alt', 'shift'].includes(normalized)) {
            modifiers.add(normalized);
        } else {
            key = normalized;
        }
    }

    return { key, modifiers };
};

const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
    const { key, modifiers } = parseShortcut(shortcut);

    const eventKey = event.key.toLowerCase();
    const eventCode = event.code.toLowerCase();

    // Match key by key name or code (for special keys like Tab)
    const keyMatches =
        eventKey === key ||
        eventCode === key ||
        eventCode === `key${key}` ||
        (key === 'backspace' && (eventKey === 'backspace' || eventCode === 'backspace'));

    if (!keyMatches) return false;

    // Check modifiers
    const hasCtrl = event.ctrlKey;
    const hasMeta = event.metaKey;
    const hasAlt = event.altKey;
    const hasShift = event.shiftKey;

    const wantsCtrl = modifiers.has('control');
    const wantsMeta = modifiers.has('meta');
    const wantsAlt = modifiers.has('alt');
    const wantsShift = modifiers.has('shift');

    return hasCtrl === wantsCtrl && hasMeta === wantsMeta && hasAlt === wantsAlt && hasShift === wantsShift;
};

export class KeyboardShortcuts {
    private element: HTMLElement;
    private bindings: KeyBinding[] = [];
    private listener: (event: KeyboardEvent) => void;

    constructor(element: HTMLElement) {
        this.element = element;
        this.listener = (event: KeyboardEvent) => {
            for (const binding of this.bindings) {
                if (matchesShortcut(event, binding.shortcut)) {
                    binding.handler(event);
                    return;
                }
            }
        };
        this.element.addEventListener('keydown', this.listener);
    }

    bind(shortcut: string | string[], handler: KeyHandler): void {
        const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
        for (const s of shortcuts) {
            this.bindings.push({ shortcut: s, handler });
        }
    }

    reset(): void {
        this.bindings = [];
        this.element.removeEventListener('keydown', this.listener);
    }
}
