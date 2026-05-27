import { supabase } from './supabase-config.js';

(async () => {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) {
    window.location.href = 'login.html';
  }
})();
