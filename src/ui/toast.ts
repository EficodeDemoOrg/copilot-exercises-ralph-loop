export type ToastVariant = 'info' | 'error';

interface ToastOptions {
    variant?: ToastVariant;
    durationMs?: number;
}

const CONTAINER_ID = 'toast-container';

function getContainer(): HTMLDivElement {
    let container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null;
    if (container) return container;
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
}

export function showToast(message: string, options: ToastOptions = {}): void {
    const { variant = 'info', durationMs = 3200 } = options;
    const container = getContainer();

    const toast = document.createElement('div');
    toast.className = `toast${variant === 'error' ? ' is-error' : ''}`;

    const dot = document.createElement('span');
    dot.className = 'toast-dot';
    dot.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'toast-text';
    text.textContent = message;

    toast.appendChild(dot);
    toast.appendChild(text);
    container.appendChild(toast);

    const dismiss = (): void => {
        toast.classList.add('is-leaving');
        toast.addEventListener(
            'animationend',
            () => {
                toast.remove();
            },
            { once: true },
        );
    };

    window.setTimeout(dismiss, durationMs);
}
