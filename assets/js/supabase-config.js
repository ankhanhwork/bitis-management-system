const SUPABASE_URL = "https://xutfbmifmiwtmtdsvzgm.supabase.co";
const SUPABASE_KEY = "sb_publishable_BgHhGVhdVp47kP6mI92QpQ_djo_LEfS";
const PRODUCTION_APP_URL = "https://bitis-management-system.vercel.app";

const AUTH_PUBLIC_PAGES = new Set([
    'login.html',
    'forgot-password.html',
    'set-password.html'
]);
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const requiresAuthentication = !AUTH_PUBLIC_PAGES.has(currentPage);

if (requiresAuthentication) {
    document.documentElement.style.visibility = 'hidden';
}

// Auth email links may fall back to the configured Site URL. Route those
// sessions to the password page while preserving the URL fragment tokens.
const authHashParams = new URLSearchParams(window.location.hash.slice(1));
const authLinkType = authHashParams.get('type');
const isPasswordPage = window.location.pathname.endsWith('/set-password.html');
if (['recovery', 'invite'].includes(authLinkType) && !isPasswordPage) {
    const passwordUrl = new URL('set-password.html', window.location.href);
    passwordUrl.hash = window.location.hash;
    window.location.replace(passwordUrl.href);
}

// Global Supabase client initialization
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabaseClient = _supabase;
window.getAuthRedirectUrl = () => {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const appUrl = isLocal ? PRODUCTION_APP_URL : window.location.origin;
    return new URL('/set-password.html', appUrl).href;
};

function redirectToLogin() {
    const loginUrl = new URL('login.html', window.location.href);
    const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    loginUrl.searchParams.set('next', returnPath);
    window.location.replace(loginUrl.href);
}

window.authReady = requiresAuthentication
    ? _supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error || !session) {
            redirectToLogin();
            return null;
        }

        document.documentElement.style.visibility = '';
        return session;
    }).catch(error => {
        console.error('Authentication check failed:', error);
        redirectToLogin();
        return null;
    })
    : Promise.resolve(null);

// Auth Guard & UI Helper
window.authGuard = async (requiredRole = null) => {
    const session = requiresAuthentication
        ? await window.authReady
        : (await _supabase.auth.getSession()).data.session;

    if (!session) {
        if (requiresAuthentication) redirectToLogin();
        return null;
    }

    // Fetch Profile for Role & Name
    const { data: profile, error } = await _supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        console.error("Profile fetch error:", error);
        return { session, user: session.user, profile: null };
    }

    // Role check if needed
    if (requiredRole && profile.role !== requiredRole && profile.role !== 'MANAGER') {
        alert('Unauthorized access.');
        window.location.href = 'index.html';
        return null;
    }

    // Update UI Sidebar/Header if elements exist
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    if (userNameEl) userNameEl.innerText = profile.full_name;
    if (userRoleEl) userRoleEl.innerText = profile.role;

    // Handle Sidebar Visibility based on role
    const managerOnlyLinks = document.querySelectorAll('.manager-only');
    if (profile.role !== 'MANAGER') {
        managerOnlyLinks.forEach(el => el.classList.add('hidden'));
    }

    return { session, user: session.user, profile };
};
