const SUPABASE_URL = "https://xutfbmifmiwtmtdsvzgm.supabase.co";
const SUPABASE_KEY = "sb_publishable_BgHhGVhdVp47kP6mI92QpQ_djo_LEfS";
const PRODUCTION_APP_URL = "https://bitis-management-system.vercel.app";

const AUTH_PUBLIC_PAGES = new Set([
    'login.html',
    'forgot-password.html',
    'set-password.html'
]);
const authPageName = window.location.pathname.split('/').pop() || 'index.html';
const requiresAuthentication = !AUTH_PUBLIC_PAGES.has(authPageName);

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

let currentUserContextPromise;

window.getCurrentUserContext = async () => {
    if (currentUserContextPromise) return currentUserContextPromise;

    currentUserContextPromise = (async () => {
        const session = requiresAuthentication
            ? await window.authReady
            : (await _supabase.auth.getSession()).data.session;
        if (!session) return null;

        const { data: profile, error } = await _supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error) console.error('Profile fetch error:', error);

        return {
            session,
            user: session.user,
            profile,
            displayName: profile?.full_name
                || session.user.user_metadata?.full_name
                || session.user.email?.split('@')[0]
                || 'User',
            email: session.user.email || profile?.email || '',
            role: profile?.role || session.user.app_metadata?.role || 'EMPLOYEE',
            avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url || ''
        };
    })();

    return currentUserContextPromise;
};

window.populateCurrentUserUI = async () => {
    const context = await window.getCurrentUserContext();
    if (!context) return null;

    ['userName', 'adminName'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = context.displayName;
    });
    ['userEmail', 'adminEmail'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = context.email;
    });
    ['userRole', 'adminRole'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = context.role;
    });
    ['userAvatar', 'adminAvatar'].forEach(id => {
        const element = document.getElementById(id);
        if (element && context.avatarUrl) element.src = context.avatarUrl;
        if (element) element.alt = context.displayName;
    });

    if (context.role !== 'MANAGER') {
        document.querySelectorAll('.manager-only').forEach(element => element.classList.add('hidden'));
    }

    return context;
};

function hydrateCurrentUserUI() {
    window.populateCurrentUserUI().catch(error => {
        console.error('Unable to populate current user UI:', error);
    });
}

if (requiresAuthentication) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hydrateCurrentUserUI, { once: true });
    } else {
        hydrateCurrentUserUI();
    }
}

// Auth Guard & UI Helper
window.authGuard = async (requiredRole = null) => {
    const context = await window.getCurrentUserContext();
    const session = context?.session;

    if (!session) {
        if (requiresAuthentication) redirectToLogin();
        return null;
    }

    const profile = context.profile;

    // Role check if needed
    if (requiredRole && context.role !== requiredRole && context.role !== 'MANAGER') {
        alert('Unauthorized access.');
        window.location.href = 'index.html';
        return null;
    }

    await window.populateCurrentUserUI();

    return { session, user: session.user, profile };
};
