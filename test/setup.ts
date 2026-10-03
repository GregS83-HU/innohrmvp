// Dummy env for the unit/API suite. Every external client (Supabase, Stripe,
// OpenAI, SMTP) is mocked per test, but several modules construct their
// client eagerly at import time and throw if the key is missing - so the
// suite must never depend on (or reach) a developer's real keys - values are
// force-assigned, not defaulted, so a real key exported in the shell is
// overridden too.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_dummy';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.CALENDLY_ONBOARDING_URL = 'https://calendly.test/onboarding';
process.env.IP_SALT = 'test-ip-salt';
process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret';
