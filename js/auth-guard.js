// Shared authentication and profile gate for protected Academy pages.
document.addEventListener('DOMContentLoaded', async () => {
    const client = window.supabaseClient;
    if (!client) {
        console.error('Nexal Academy authentication client is unavailable.');
        return;
    }
    const { data: { session } = {}, error } = await client.auth.getSession();
    const currentPath = window.location.pathname;
    const publicPage = ['login.html', 'index.html', 'about.html', 'contact.html'].some(page => currentPath.includes(page));
    if (!session || error) {
        if (!publicPage) window.location.replace('login.html');
        return;
    }

    if (!currentPath.includes('onboarding.html')) {
        const { data: profile } = await client.from('profiles').select('role, username').eq('id', session.user.id).single();
        if (!profile || !profile.role) {
            window.location.replace('onboarding.html');
            return;
        }
        const display = document.getElementById('user-display-name');
        if (display) display.textContent = profile.username || session.user.user_metadata?.full_name || 'Scholar';
    }

    const logout = document.getElementById('logout-btn');
    if (logout) logout.addEventListener('click', async event => {
        event.preventDefault();
        await client.auth.signOut();
        window.location.replace('login.html');
    });
});
