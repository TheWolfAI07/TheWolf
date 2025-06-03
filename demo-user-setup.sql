-- Demo user setup script
-- Run this in your Supabase SQL editor to create the demo user

-- First, let's make sure we can create users
-- Insert demo user directly into auth.users (requires admin access)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@wolf.com',
  crypt('demo123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo User"}',
  false,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create profile for demo user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  created_at,
  updated_at
) 
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  created_at,
  updated_at
FROM auth.users 
WHERE email = 'demo@wolf.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Create preferences for demo user
INSERT INTO public.user_preferences (
  user_id,
  theme,
  notifications_enabled,
  email_notifications,
  push_notifications,
  marketing_emails,
  security_alerts,
  language,
  timezone,
  created_at,
  updated_at
)
SELECT 
  id,
  'dark',
  true,
  true,
  false,
  false,
  true,
  'en',
  'UTC',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'demo@wolf.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the demo user was created
SELECT 
  u.email,
  u.email_confirmed_at,
  p.full_name,
  up.theme
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.user_preferences up ON u.id = up.user_id
WHERE u.email = 'demo@wolf.com';
