export interface ConfirmOptions {
    readonly title: string;
    readonly message?: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly destructive?: boolean;
}

const FOCUSABLE_SELECTOR = 'button, [href], input, [tabindex]:not([tabindex="-1"])';

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
        const {
            title,
            message,
            confirmLabel = 'Confirm',
            cancelLabel = 'Cancel',
            destructive = false,
        } = options;

        const previouslyFocused = document.activeElement as HTMLElement | null;

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');

        const titleId = `modal-title-${crypto.randomUUID()}`;
        const messageId = `modal-msg-${crypto.randomUUID()}`;
        modal.setAttribute('aria-labelledby', titleId);
        if (message) modal.setAttribute('aria-describedby', messageId);

        const titleEl = document.createElement('h2');
        titleEl.className = 'modal-title';
        titleEl.id = titleId;
        titleEl.textContent = title;
        modal.appendChild(titleEl);

        if (message) {
            const messageEl = document.createElement('p');
            messageEl.className = 'modal-message';
            messageEl.id = messageId;
            messageEl.textContent = message;
            modal.appendChild(messageEl);
        }

        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'button';
        confirmBtn.className = `modal-btn ${destructive ? 'is-destructive' : 'is-primary'}`;
        confirmBtn.textContent = confirmLabel;

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'modal-btn is-secondary';
        cancelBtn.textContent = cancelLabel;

        actions.appendChild(confirmBtn);
        actions.appendChild(cancelBtn);
        modal.appendChild(actions);

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const close = (result: boolean): void => {
            backdrop.classList.add('is-leaving');
            backdrop.addEventListener(
                'animationend',
                () => {
                    backdrop.remove();
                    previouslyFocused?.focus?.();
                    resolve(result);
                },
                { once: true },
            );
            document.removeEventListener('keydown', onKeydown, true);
        };

        const onKeydown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close(false);
                return;
            }
            if (e.key === 'Tab') {
                const focusable = Array.from(
                    modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
                ).filter((el) => !el.hasAttribute('disabled'));
                if (focusable.length === 0) return;
                const first = focusable[0]!;
                const last = focusable[focusable.length - 1]!;
                const active = document.activeElement as HTMLElement | null;
                if (e.shiftKey && active === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && active === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        confirmBtn.addEventListener('click', () => close(true));
        cancelBtn.addEventListener('click', () => close(false));
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close(false);
        });
        document.addEventListener('keydown', onKeydown, true);

        // Focus the safer (non-destructive) action by default.
        (destructive ? cancelBtn : confirmBtn).focus();
    });
}
