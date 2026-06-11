(function () {
    const hiddenIcon = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
            <circle cx="12" cy="12" r="2.5" stroke-width="1.8"></circle>
        </svg>`;
    const visibleIcon = `
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16.8 16.8 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>
        </svg>`;

    function addPasswordToggle(input) {
        if (input.dataset.passwordToggleReady === 'true') return;
        input.dataset.passwordToggleReady = 'true';

        const wrapper = input.parentElement;
        wrapper.classList.add('relative');
        input.classList.add('pr-12');

        const button = wrapper.querySelector('[data-password-toggle]') || document.createElement('button');
        if (!button.isConnected) wrapper.appendChild(button);
        button.type = 'button';
        button.dataset.passwordToggle = '';
        button.setAttribute('aria-label', 'Show password');
        button.setAttribute('aria-pressed', 'false');
        button.innerHTML = hiddenIcon;

        button.addEventListener('click', () => {
            const showPassword = input.type === 'password';
            input.type = showPassword ? 'text' : 'password';
            button.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
            button.setAttribute('aria-pressed', String(showPassword));
            button.innerHTML = showPassword ? visibleIcon : hiddenIcon;
            input.focus({ preventScroll: true });
        });

    }

    function initializePasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(addPasswordToggle);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePasswordToggles, { once: true });
    } else {
        initializePasswordToggles();
    }
})();
