(function () {
    const collapsed = localStorage.getItem('bitis-sidebar-collapsed') === 'true';
    document.documentElement.classList.toggle('bitis-sidebar-collapsed', collapsed);

    const style = document.createElement('style');
    style.textContent = `
        html.bitis-sidebar-collapsed body > .flex > aside {
            width: 4.75rem !important;
            min-width: 4.75rem !important;
        }

        body > .flex > aside > div:first-child .flex.items-start > svg:has(path[d^="M11 5v11.17"]),
        body > .flex > aside > div:first-child .flex.items-start > div:has(> svg path[d^="M11 5v11.17"]) {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
})();
