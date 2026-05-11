const SUPABASE_URL = "https://xutfbmifmiwtmtdsvzgm.supabase.co";
const SUPABASE_KEY = "sb_publishable_BgHhGVhdVp47kP6mI92QpQ_djo_LEfS";

// Global Supabase client initialization
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabaseClient = _supabase;

// Auth Guard & UI Helper
window.authGuard = async (requiredRole = null) => {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
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
