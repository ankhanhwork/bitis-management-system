(function () {
    const TRANSITION_DURATION = 120;

    const style = document.createElement('style');
    style.textContent = `
        #bitisPageProgress {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99999;
            width: 100%;
            height: 3px;
            pointer-events: none;
            opacity: 0;
            overflow: hidden;
            background: transparent;
            transition: opacity 120ms ease;
        }

        #bitisPageProgress::before {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            background: #E30016;
            box-shadow: 0 0 8px rgba(227, 0, 22, 0.28);
            transform: translateX(-100%);
        }

        #bitisPageProgress.is-running {
            opacity: 1;
        }

        #bitisPageProgress.is-running::before {
            transform: translateX(-18%);
            transition: transform 650ms cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        #bitisPageProgress.is-finishing::before {
            transform: translateX(0);
            transition: transform 140ms ease-out;
        }

        body {
            transition: opacity ${TRANSITION_DURATION}ms ease-out,
                        transform ${TRANSITION_DURATION}ms ease-out;
        }

        body.bitis-page-leaving {
            opacity: 0.94;
            transform: translateY(-2px);
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            #bitisPageProgress,
            #bitisPageProgress::before,
            body {
                transition: none !important;
            }

            body.bitis-page-leaving {
                opacity: 1;
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);

    const progress = document.createElement('div');
    progress.id = 'bitisPageProgress';
    progress.setAttribute('aria-hidden', 'true');

    let navigationStarted = false;
    let finishTimer;

    function mountProgress() {
        if (!progress.isConnected && document.body) {
            document.body.appendChild(progress);
        }
    }

    function startTransition() {
        if (navigationStarted) return;
        navigationStarted = true;
        mountProgress();

        progress.classList.remove('is-finishing');
        progress.classList.add('is-running');
        document.body.classList.add('bitis-page-leaving');
    }

    function resetTransition() {
        navigationStarted = false;
        clearTimeout(finishTimer);
        mountProgress();

        document.body.classList.remove('bitis-page-leaving');
        progress.classList.add('is-finishing');

        finishTimer = window.setTimeout(() => {
            progress.classList.remove('is-running', 'is-finishing');
        }, 160);
    }

    function getInternalDestination(link, event) {
        if (!link || event.defaultPrevented || event.button !== 0) return null;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
        if (link.target && link.target !== '_self') return null;
        if (link.hasAttribute('download')) return null;

        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return null;

        const destination = new URL(link.href, window.location.href);
        if (!['http:', 'https:', 'file:'].includes(destination.protocol)) return null;
        if (destination.protocol !== 'file:' && destination.origin !== window.location.origin) return null;
        if (destination.href === window.location.href) return null;

        return destination.href;
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        const destination = getInternalDestination(link, event);
        if (!destination) return;

        event.preventDefault();
        startTransition();

        window.setTimeout(() => {
            window.location.assign(destination);
        }, TRANSITION_DURATION);
    }, true);

    window.addEventListener('beforeunload', startTransition);
    window.addEventListener('pageshow', resetTransition);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountProgress, { once: true });
    } else {
        mountProgress();
    }
})();
