document.addEventListener('DOMContentLoaded', async () => {
    const appBase = window.location.pathname.replace(/[^/]*$/, '');
    const appUrl = (file) => `${window.location.origin}${appBase}${file}`;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
        window.location.replace(`${appBase}dashboard.html`);
        return;
    }

    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const signInBtn = document.getElementById('btn-signin');
    const signUpBtn = document.getElementById('btn-signup');
    const googleBtn = document.getElementById('google-signin-btn');
    const errorMsg = document.getElementById('auth-error');

    function showError(msg) {
        if (!errorMsg) return;
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    document.getElementById('email-auth-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        signInBtn.textContent = 'Verifying...'; signInBtn.disabled = true;
        try {
            const { error } = await window.supabaseClient.auth.signInWithPassword({
                email: emailInput.value.trim(),
                password: passwordInput.value
            });
            if (error) throw error;
            window.location.replace(`${appBase}dashboard.html`);
        } catch (error) {
            showError(error.message);
            signInBtn.textContent = 'Sign In'; signInBtn.disabled = false;
        }
    });

    signUpBtn?.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || password.length < 6) {
            showError('Provide a valid email and a password (min 6 characters) to create an account.');
            return;
        }
        signUpBtn.textContent = 'Creating...'; signUpBtn.disabled = true;
        try {
            const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                showError('Account exists. Please sign in instead.');
            } else {
                alert('Account created. If required, check your email for a confirmation link, then sign in.');
                emailInput.value = ''; passwordInput.value = '';
            }
        } catch (error) {
            showError(error.message);
        }
        signUpBtn.textContent = 'Create New Account'; signUpBtn.disabled = false;
    });

    googleBtn?.addEventListener('click', async () => {
        try {
            sessionStorage.setItem('nexal-auth-next', `${appBase}dashboard.html`);
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: appUrl('auth-callback.html') }
            });
            if (error) throw error;
        } catch (error) {
            showError('Google Auth Failed: ' + error.message);
        }
    });
});
