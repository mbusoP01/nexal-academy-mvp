document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = awai// File: js/auth-guard.js

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    const currentPath = window.location.pathname;
    
    // 1. Kick out unauthenticated users
    if (!session || error) {
        if (!currentPath.includes('login.html') && !currentPath.includes('index.html') && !currentPath.includes('about.html') && !currentPath.includes('contact.html')) {
            window.location.replace('login.html');
        }
        return;
    }

    // 2. Check if the user has completed onboarding
    if (!currentPath.includes('onboarding.html')) {
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('role, username')
            .eq('id', session.user.id)
            .single();

        // If no profile exists, or role is missing, force them to onboarding
        if (!profile || !profile.role) {
            window.location.replace('onboarding.html');
            return;
        }

        // Display Data Routing
        const userNameDisplay = document.getElementById('user-display-name');
        if (userNameDisplay) {
            userNameDisplay.textContent = profile.username || session.user.user_metadata.full_name || 'Scholar';
        }

        // If they are a teacher, we might want to hide the "Arena" from their sidebar in future updates
    }

    // 3. Global Logout Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.replace('login.html');
        });
    }
});t window.supabaseClient.auth.getSession();
    
    if (!session || error) {
        window.location.replace('login.html');
        return;
    }

    const userNameDisplay = document.getElementById('user-display-name');
    if (userNameDisplay && session.user) {
        userNameDisplay.textContent = session.user.user_metadata.full_name || session.user.email;
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.replace('login.html');
        });
    }
});