import { supabase } from './supabase-config.js';

const consentCheckbox = document.getElementById('popia-consent');
const googleSignInButton = document.getElementById('google-signin-btn');
const loginFeedback = document.getElementById('login-feedback');

function setGoogleButtonState(enabled) {
  if (!googleSignInButton) return;

  googleSignInButton.disabled = !enabled;
  googleSignInButton.classList.toggle('pointer-events-none', !enabled);
  googleSignInButton.classList.toggle('opacity-60', !enabled);
  googleSignInButton.classList.toggle('opacity-100', enabled);
}

function initConsentLogic() {
  if (!consentCheckbox || !googleSignInButton) return;

  setGoogleButtonState(consentCheckbox.checked);

  consentCheckbox.addEventListener('change', () => {
    setGoogleButtonState(consentCheckbox.checked);
    loginFeedback.textContent = '';
    loginFeedback.classList.add('hidden');
  });
}

async function signInWithGoogle() {
  if (!consentCheckbox?.checked) {
    loginFeedback.textContent = 'Please confirm parental consent before signing in.';
    loginFeedback.classList.remove('hidden');
    return;
  }

  const redirectTo = window.location.protocol === 'file:'
    ? 'dashboard.html'
    : `${window.location.origin}/dashboard.html`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo
    }
  });

  if (error) {
    loginFeedback.textContent = `Sign-in failed: ${error.message}`;
    loginFeedback.classList.remove('hidden');
  }
}

function initAuthLogic() {
  if (!googleSignInButton) return;

  initConsentLogic();
  googleSignInButton.addEventListener('click', signInWithGoogle);
}

window.addEventListener('DOMContentLoaded', initAuthLogic);
