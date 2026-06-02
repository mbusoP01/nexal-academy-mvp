// File: js/supabase-config.js

// Initialize the Supabase Client
const SUPABASE_URL = 'https://szqpkxlatzvwcxpwmewt.supabase.co'; // e.g., https://szqpkxlatzvwcxpwmewt.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cXBreGxhdHp2d2N4cHdtZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njg4MjYsImV4cCI6MjA5NTQ0NDgyNn0.OFvGOyU0bZrDX-48PlXGGZeO7hhWJoXhb37JtTQ9pzY'; // e.g., eyJhbGci...

// Make supabase globally available
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);