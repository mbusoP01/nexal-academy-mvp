# Google sign-in owner setup

The browser flow is implemented with Supabase OAuth and a dedicated local callback page. Live provider verification remains an owner configuration step because client secrets and dashboard access are not stored in this repository.

## Values for this project

- Supabase project reference: `szqpkxlatzvwcxpwmewt`
- Google authorized redirect URI: `https://szqpkxlatzvwcxpwmewt.supabase.co/auth/v1/callback`
- Local application origin used for smoke testing: `http://127.0.0.1:4188`
- Local application callback URL: `http://127.0.0.1:4188/auth-callback.html`

Do not commit the Google client secret.

## Google Cloud

1. Open the Google Cloud project that owns the OAuth client.
2. Create or select an OAuth client of type **Web application**.
3. Add `http://127.0.0.1:4188` to **Authorized JavaScript origins**. Add the final HTTPS production origin only after it exists.
4. Add the exact Supabase callback URI above to **Authorized redirect URIs**.
5. Copy the client ID and secret into Supabase only; never into static JavaScript.

## Supabase

1. Authentication → Providers → Google: enable the provider and enter the client ID and secret.
2. Authentication → URL Configuration: add `http://127.0.0.1:4188/auth-callback.html` to Redirect URLs for local testing.
3. Set Site URL to the approved production origin when deployment is established; do not guess a production URL.
4. Test `login.html?next=/dashboard.html`: Google consent should return to `auth-callback.html`, create a session, and land on the intended page.

## Verification

The owner should verify provider enabled, OAuth consent succeeds, refresh keeps the session, and logout redirects protected routes. If Supabase reports a redirect mismatch, compare the exact origin/path (including protocol and port) with the allow-list.
