export type MnemonicConfig = {
    attr?: string;
    activeClass?: string;
    color?: string; // e.g. "#000"
    textColor?: string; // e.g. "#fff"
    animationDuration?: `${number}s`; // e.g. 150 (ms)
};

let isAltActive = false;
let config: Required<MnemonicConfig>;
const accessMap = new Map<string, HTMLElement[]>();
let observer: MutationObserver | null = null;
let pendingGroup: HTMLElement[] | null = null;

export function initMnemonics(userConfig: MnemonicConfig = {}) {
    config = {
        attr: userConfig.attr ?? 'data-accesskey',
        activeClass: userConfig.activeClass ?? 'mnemonic-active',
        color: userConfig.color ?? '',
        textColor: userConfig.textColor ?? '',
        animationDuration: userConfig.animationDuration ?? '0.15s',
    };

    scanDocument();
    setupObserver();
    setupKeyEvents();
}

function scanDocument() {
    accessMap.clear();
    const elements = document.querySelectorAll<HTMLElement>(`[${config.attr}]`);

    elements.forEach((el) => {
        const key = el.getAttribute(config.attr)?.toLowerCase();
        if (!key) return;

        if (accessMap.has(key)) {
            accessMap.get(key)!.push(el);
        } else {
            accessMap.set(key, [el]);
        }
    });
}

function setupObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(scanDocument);
    observer.observe(document.body, { childList: true, subtree: true });
}

function setupKeyEvents() {
    window.addEventListener('keydown', (e) => {
        // Escape = cancel
        if (e.key === 'Escape') {
            resetMnemonics();
            return;
        }

        // ALT pressed
        if (e.key === 'Alt') {
            e.preventDefault();
            if (!isAltActive) {
                isAltActive = true;
                // hover(true);
                markMnemonics(true);
            }
            return;
        }

        // Number pressed (1–9) → trigger in group
        if (pendingGroup && /^[1-9]$/.test(e.key)) {
            const index = parseInt(e.key, 10) - 1;
            if (pendingGroup[index]) {
                triggerElement(pendingGroup[index]);
            }
            resetMnemonics();
            return;
        }

        // Regular letter while ALT active
        if (isAltActive && e.key.length === 1) {
            const key = e.key.toLowerCase();
            const elements = accessMap.get(key);
            if (!elements || elements.length === 0) return;

            e.preventDefault();

            if (elements.length === 1) {
                triggerElement(elements[0]);
                resetMnemonics();
            } else {
                // Multiple → show indexed labels and wait for 1–9
                pendingGroup = elements;
                markMnemonics(true, key);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Alt') {
            resetMnemonics();
        }
    });
}

function triggerElement(el: HTMLElement) {
    el.focus();
    const keydown = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
    });
    el.dispatchEvent(keydown);

    const keyup = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
    });
    el.dispatchEvent(keyup);
}

function markMnemonics(show: boolean, activeKey?: string, classes?: string[]) {
    ensureMnemoStyles();

    // Remove previous ones (with animation)
    document.querySelectorAll('.mnemo-label').forEach((n) => {
        n.classList.add('fade-out');
        n.addEventListener('animationend', () => n.remove(), { once: true });
    });

    if (!show) return;

    accessMap.forEach((elements, key) => {
        elements.forEach((el, i) => {
            const label = document.createElement('span');
            label.className = 'mnemo-label';
            label.textContent =
                elements.length > 1
                    ? `${key.toUpperCase()}${i + 1}`
                    : key.toUpperCase();

            // If showing duplicates, only highlight that key group
            if (activeKey && key !== activeKey) return;

            if (classes) {
                classes.forEach((c) => label.classList.add(c));
            } else {
                const rect = el.getBoundingClientRect();
                label.style.position = 'absolute';
                label.style.left = `${rect.left + window.scrollX}px`;
                label.style.top = `${rect.top + window.scrollY - 10}px`;
                label.style.zIndex = '9999';
                label.style.backgroundColor = '#000';
                label.style.color = '#fff';
                label.style.fontSize = '10px';
                label.style.padding = '2px 4px';
                label.style.borderRadius = '6px';
                label.style.border = '1px grey solid';
                label.style.opacity = '0.9';
            }

            document.body.appendChild(label);
        });
    });
}

function resetMnemonics() {
    isAltActive = false;
    pendingGroup = null;
    // hover(false);
    markMnemonics(false);
}

function ensureMnemoStyles() {
    if (document.getElementById('mnemo-style')) return;
    const style = document.createElement('style');
    style.id = 'mnemo-style';
    style.textContent = `
        @keyframes mnemo-fade-in {
            from { opacity: 0; transform: translateY(4px) scale(0.9); }
            to { opacity: 0.9; transform: translateY(0) scale(1); }
        }
        @keyframes mnemo-fade-out {
            from { opacity: 0.9; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-4px) scale(0.95); }
        }
        .mnemo-label {
            position: absolute;
            background-color: ${config.color};
            color: ${config.textColor};
            font-size: 10px;
            padding: 2px 4px;
            border-radius: 6px;
            border: 1px solid grey;
            opacity: 0;
            z-index: 9999;
            pointer-events: none;
            transform: scale(0.9);
            animation: mnemo-fade-in ${config.animationDuration} ease-out forwards;
        }
        .mnemo-label.fade-out {
            animation: mnemo-fade-out 0.12s ease-in forwards;
        }
    `;
    document.head.appendChild(style);
}
