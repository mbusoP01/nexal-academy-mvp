document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if already logged in
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
        window.location.replace('dashboard.html');
        return;
    }

    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const signInBtn = document.getElementById('btn-signin');
    const signUpBtn = document.getElementById('btn-signup');
    const googleBtn = document.getElementById('google-signin-btn');
    const errorMsg = document.getElementById('auth-error');

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    // Email/Password Sign In
    document.getElementById('email-auth-form').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents page reload
        signInBtn.textContent = "Verifying..."; signInBtn.disabled = true;
        
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: emailInput.value.trim(),
                password: passwordInput.value
            });
            if (error) throw error;
            window.location.replace('dashboard.html');
        } catch (error) {
            showError(error.message);
            signInBtn.textContent = "Sign In"; signInBtn.disabled = false;
        }
    });

    // Email/Password Sign Up
    signUpBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || password.length < 6) {
            showError("Provide a valid email and a password (min 6 characters) to create an account.");
            return;
        }

        signUpBtn.textContent = "Creating..."; signUpBtn.disabled = true;

        try {
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
            });
            if (error) throw error;
            
            // Note: If Supabase has "Confirm Email" enabled, the user is not signed in yet.
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 showError("Account exists. Please sign in instead.");
            } else {
                 alert("Account Created! If required, check your email for a confirmation link, then sign in.");
                 emailInput.value = ''; passwordInput.value = '';
            }
        } catch (error) {
            showError(error.message);
        }
        signUpBtn.textContent = "Create New Account"; signUpBtn.disabled = false;
    });

    // Google Sign In
    googleBtn.addEventListener('click', async () => {
        try {
            const { error } = await window.supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/dashboard.html` }
            });
            if (error) throw error;
        } catch (error) {
            showError("Google Auth Failed: " + error.message);
        }
    });
});