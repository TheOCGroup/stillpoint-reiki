# Stillpoint Reiki

Production Next.js foundation for Stillpoint Reiki by OCG Labs.

## Local setup
1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. `npm run dev`

## Supabase
Apply `supabase/migrations/001_stillpoint_core.sql` to the dedicated Stillpoint project. All user-facing tables have RLS enabled and ownership policies.

## Environment
Never commit `.env.local` or service-role/secret keys. The browser uses only a Supabase publishable key.

## Product boundary
Stillpoint is a wellness, relaxation, reflection, and spiritual-practice product. It does not diagnose or treat medical or mental-health conditions.