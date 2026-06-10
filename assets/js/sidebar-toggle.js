(function () {
    const STORAGE_KEY = 'bitis-sidebar-collapsed';
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    const style = document.createElement('style');
    style.textContent = `
        #bitisSidebar {
            width: 16rem;
            min-width: 16rem;
            transition: width 180ms ease, min-width 180ms ease;
        }

        #bitisSidebar .bitis-sidebar-brand {
            min-height: 7.25rem;
            transition: padding 180ms ease;
        }

        #bitisSidebar .bitis-sidebar-brand-copy,
        #bitisSidebar .bitis-sidebar-label {
            opacity: 1;
            white-space: nowrap;
            transition: opacity 100ms ease;
        }

        #bitisSidebar .bitis-sidebar-link {
            position: relative;
            display: flex;
            width: 100%;
            align-items: center;
            min-height: 2.75rem;
            transition: padding 180ms ease, background-color 150ms ease;
        }

        #bitisSidebar .bitis-sidebar-link > svg,
        #bitisSidebar .bitis-sidebar-link > .material-symbols-outlined {
            width: 1.25rem;
            min-width: 1.25rem;
            height: 1.25rem;
            margin-right: 1rem;
            flex-shrink: 0;
            transition: margin 180ms ease;
        }

        #bitisSidebarToggle {
            position: absolute;
            top: 1.5rem;
            right: 1rem;
            z-index: 2;
            display: inline-flex;
            width: 2rem;
            height: 2rem;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            color: #94a3b8;
            transition: color 150ms ease, background-color 150ms ease, right 180ms ease;
        }

        #bitisSidebarToggle:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.08);
        }

        #bitisSidebarToggle svg {
            width: 1.1rem;
            height: 1.1rem;
            transition: transform 180ms ease;
        }

        #bitisSidebar.is-collapsed {
            width: 4.75rem;
            min-width: 4.75rem;
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-brand {
            padding-left: 0;
            padding-right: 0;
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-brand-copy,
        #bitisSidebar.is-collapsed .bitis-sidebar-label {
            width: 0;
            opacity: 0;
            overflow: hidden;
            pointer-events: none;
        }

        #bitisSidebar.is-collapsed #bitisSidebarToggle {
            right: 1.375rem;
        }

        #bitisSidebar.is-collapsed #bitisSidebarToggle svg {
            transform: rotate(180deg);
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-link {
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-link > svg,
        #bitisSidebar.is-collapsed .bitis-sidebar-link > .material-symbols-outlined {
            margin-right: 0;
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-link::after {
            content: attr(data-tooltip);
            position: absolute;
            left: calc(100% + 0.65rem);
            top: 50%;
            z-index: 100;
            padding: 0.4rem 0.65rem;
            border-radius: 0.4rem;
            color: #fff;
            background: #1e293b;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
            font-size: 0.75rem;
            font-weight: 600;
            line-height: 1.2;
            opacity: 0;
            pointer-events: none;
            transform: translate(0.25rem, -50%);
            transition: opacity 120ms ease, transform 120ms ease;
        }

        #bitisSidebar.is-collapsed .bitis-sidebar-link:hover::after {
            opacity: 1;
            transform: translate(0, -50%);
        }

        @media (prefers-reduced-motion: reduce) {
            #bitisSidebar,
            #bitisSidebar *,
            #bitisSidebar *::after {
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    sidebar.id = 'bitisSidebar';
    sidebar.classList.remove('w-64');
    sidebar.style.position = 'sticky';

    const iconPaths = {
        dashboard: '<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        products: '<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        inventory: '<path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        orders: '<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        assistant: '<path d="M8 10h.01M12 10h.01M16 10h.01M7 16l-3 3V7a4 4 0 014-4h8a4 4 0 014 4v5a4 4 0 01-4 4H7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        staff: '<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>',
        signout: '<path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>'
    };

    function getLinkIconKey(link) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = link.textContent.trim().toLowerCase();
        if (href.includes('index.html') || text === 'dashboard') return 'dashboard';
        if (href.includes('product_catalog') || text === 'products') return 'products';
        if (href.includes('inventory_tracker') || text === 'inventory') return 'inventory';
        if (href.includes('order_management') || text === 'orders') return 'orders';
        if (href.includes('chatbot') || text.includes('ai assistant')) return 'assistant';
        if (href.includes('staff_management') || text.includes('staff')) return 'staff';
        if (text.includes('sign out') || link.hasAttribute('onclick')) return 'signout';
        return null;
    }

    function ensureLinkIcon(link) {
        if (link.querySelector(':scope > svg, :scope > .material-symbols-outlined')) return;
        const iconKey = getLinkIconKey(link);
        if (!iconKey) return;

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = iconPaths[iconKey];
        link.prepend(icon);
    }

    function ensureAssistantLink() {
        const nav = sidebar.querySelector('nav');
        if (!nav || nav.querySelector('a[href*="chatbot"]')) return;
        const ordersLink = nav.querySelector('a[href*="order_management"]');
        if (!ordersLink) return;

        const assistantLink = document.createElement('a');
        const isActive = /chatbot\.html$/i.test(window.location.pathname);
        assistantLink.href = 'chatbot.html';
        assistantLink.className = isActive
            ? 'flex items-center px-6 py-3 text-sm font-semibold bg-white/10 border-l-4 border-[#E30016] text-white transition'
            : 'flex items-center px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition';
        assistantLink.textContent = 'AI Assistant';
        ordersLink.insertAdjacentElement('afterend', assistantLink);
    }

    ensureAssistantLink();

    const brand = sidebar.firstElementChild;
    if (brand) {
        brand.classList.add('bitis-sidebar-brand');
        brand.style.position = 'relative';

        const brandRow = brand.firstElementChild;
        if (brandRow) {
            const brandChildren = Array.from(brandRow.children);
            const arrowContainer = brandChildren.find(child =>
                child.querySelector('svg path[d*="M11 5v11.17"]')
            );
            arrowContainer?.remove();

            const brandCopy = Array.from(brandRow.children).find(child =>
                child.querySelector('h2')
            );
            brandCopy?.classList.add('bitis-sidebar-brand-copy');
        }

        const toggle = document.createElement('button');
        toggle.id = 'bitisSidebarToggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Collapse sidebar');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.title = 'Collapse sidebar';
        toggle.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
        `;
        brand.appendChild(toggle);
    }

    sidebar.querySelectorAll('nav a, nav button, nav + div a, nav + div button').forEach(link => {
        link.classList.add('bitis-sidebar-link');
        ensureLinkIcon(link);

        const textNodes = Array.from(link.childNodes).filter(node =>
            node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );
        const labelText = textNodes.map(node => node.textContent.trim()).join(' ');
        if (labelText) {
            const label = document.createElement('span');
            label.className = 'bitis-sidebar-label';
            label.textContent = labelText;
            textNodes.forEach(node => node.remove());
            link.appendChild(label);
            link.dataset.tooltip = labelText;
            link.setAttribute('aria-label', labelText);
        }
    });

    function setCollapsed(collapsed) {
        sidebar.classList.toggle('is-collapsed', collapsed);
        document.documentElement.classList.toggle('bitis-sidebar-collapsed', collapsed);
        const toggle = document.getElementById('bitisSidebarToggle');
        if (!toggle) return;
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
        toggle.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    }

    setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');

    document.getElementById('bitisSidebarToggle')?.addEventListener('click', () => {
        const collapsed = !sidebar.classList.contains('is-collapsed');
        setCollapsed(collapsed);
        localStorage.setItem(STORAGE_KEY, String(collapsed));
    });
})();
