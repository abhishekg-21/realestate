-- ==============================================================================
-- PROPERTIESNEXUS — MASTER ALL-IN-ONE DATABASE & SUPER ADMIN SETUP SCRIPT
-- ==============================================================================
-- Run this single script in your Supabase Dashboard → SQL Editor.
-- It creates ALL required tables, storage buckets, triggers, Super Admin
-- policies, AND automatically creates the Super Admin user account!
-- ==============================================================================


-- ==============================================================================
-- PART 1: USER PROFILES & AUTH TRIGGER
-- ==============================================================================

-- 1. Create profiles table (with super_admin role included in check constraint)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'agent', 'builder', 'lister', 'admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure the check constraint includes 'super_admin' if the table already existed previously
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'agent', 'builder', 'lister', 'admin', 'super_admin'));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic profile policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent regular users from updating their own role column directly
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, updated_at) ON public.profiles TO authenticated;

-- Trigger to automatically create a profile row when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==============================================================================
-- PART 2: SUPER ADMIN HELPER & CORE ADMIN TABLES
-- ==============================================================================

-- Helper function: check if current user is a super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Admin Audit Log (records all admin actions for accountability)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email  text,
  action       text NOT NULL,
  target_type  text,
  target_id    text,
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin reads audit log" ON public.admin_audit_logs;
CREATE POLICY "super_admin reads audit log"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "deny direct insert for authenticated" ON public.admin_audit_logs;
CREATE POLICY "deny direct insert for authenticated"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Platform Settings (key-value store for global configuration)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key          text PRIMARY KEY,
  value        text NOT NULL DEFAULT '',
  description  text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   text
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin manages settings" ON public.platform_settings;
CREATE POLICY "super_admin manages settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('listing_approval_required', 'true',  'Require admin approval before a property goes live'),
  ('max_photos_per_listing',    '20',    'Maximum number of photos a user can upload per listing'),
  ('listing_fee_inr',           '0',     'Fee (in INR) charged per listing submission (0 = free)'),
  ('allowed_cities',            'Mumbai,Delhi,Bangalore,Hyderabad,Pune,Chennai,Kolkata,Ahmedabad,Surat,Jaipur', 'Comma-separated list of enabled cities'),
  ('maintenance_mode',          'false', 'Set to true to show a maintenance page to all visitors'),
  ('new_user_default_role',     'user',  'Role assigned to brand-new sign-ups'),
  ('contact_email',             'support@propertiesnexus.com', 'Public support email shown on the site')
ON CONFLICT (key) DO NOTHING;

-- Admin Notifications (broadcast messages to all users or specific roles)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  body         text NOT NULL,
  target_role  text NOT NULL DEFAULT 'all',
  sent_by      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin manages notifications" ON public.admin_notifications;
CREATE POLICY "super_admin manages notifications"
  ON public.admin_notifications FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "users read their notifications" ON public.admin_notifications;
CREATE POLICY "users read their notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (
    target_role = 'all'
    OR target_role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    OR public.is_super_admin()
  );


-- ==============================================================================
-- PART 3: PROPERTY SUBMISSIONS & MEDIA TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.property_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected')),
  intent text NOT NULL CHECK (intent IN ('sale', 'rent', 'commercial')),
  property_type text NOT NULL,
  title text NOT NULL,
  description text,
  city text NOT NULL,
  state text NOT NULL,
  locality text,
  address text,
  price numeric,
  price_period text,
  bedrooms integer,
  bathrooms integer,
  area_sqft numeric,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_submission_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.property_submissions(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_submission_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.property_submissions(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  document_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_submission_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_submission_documents ENABLE ROW LEVEL SECURITY;

-- Owner policies for property submissions
DROP POLICY IF EXISTS "Owners manage their submissions" ON public.property_submissions;
CREATE POLICY "Owners manage their submissions" ON public.property_submissions
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners manage submission media" ON public.property_submission_media;
CREATE POLICY "Owners manage submission media" ON public.property_submission_media
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.property_submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.property_submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Owners manage submission documents" ON public.property_submission_documents;
CREATE POLICY "Owners manage submission documents" ON public.property_submission_documents
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.property_submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.property_submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid()));


-- ==============================================================================
-- PART 4: SUPER ADMIN POLICIES (FULL OVERSIGHT OVER ALL USERS & LISTINGS)
-- ==============================================================================

-- Super Admin read all profiles
DROP POLICY IF EXISTS "Admin reads all profiles" ON public.profiles;
CREATE POLICY "Admin reads all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_super_admin());

-- Super Admin update any profile (including role column)
DROP POLICY IF EXISTS "Admin updates profiles" ON public.profiles;
CREATE POLICY "Admin updates profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Public and Admin read submissions (approved ones are visible to everyone)
DROP POLICY IF EXISTS "Admin reads all submissions" ON public.property_submissions;
DROP POLICY IF EXISTS "Public and owners read submissions" ON public.property_submissions;
CREATE POLICY "Public and owners read submissions"
  ON public.property_submissions FOR SELECT
  TO anon, authenticated
  USING (status = 'approved' OR owner_id = auth.uid() OR public.is_super_admin());

-- Super Admin update submission status
DROP POLICY IF EXISTS "Admin updates submission status" ON public.property_submissions;
CREATE POLICY "Admin updates submission status"
  ON public.property_submissions FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Public and Admin read submission media (media for approved ones visible to everyone)
DROP POLICY IF EXISTS "Admin reads all submission media" ON public.property_submission_media;
DROP POLICY IF EXISTS "Public and owners read submission media" ON public.property_submission_media;
CREATE POLICY "Public and owners read submission media"
  ON public.property_submission_media FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.property_submissions s
      WHERE s.id = submission_id
      AND (s.status = 'approved' OR s.owner_id = auth.uid() OR public.is_super_admin())
    )
  );

DROP POLICY IF EXISTS "Admin reads all submission docs" ON public.property_submission_documents;
CREATE POLICY "Admin reads all submission docs"
  ON public.property_submission_documents FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (SELECT 1 FROM public.property_submissions s WHERE s.id = submission_id AND s.owner_id = auth.uid())
  );


-- ==============================================================================
-- PART 5: STORAGE BUCKETS & FILE POLICIES (50MB LIMIT + ADMIN OVERSIGHT)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-media', 'property-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf']),
  ('property-documents', 'property-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('property-videos', 'property-videos', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users upload their submission files" ON storage.objects;
CREATE POLICY "Users upload their submission files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id IN ('property-media', 'property-documents', 'property-images', 'property-videos')
  );

DROP POLICY IF EXISTS "Users read their submission files" ON storage.objects;
CREATE POLICY "Users read their submission files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id IN ('property-media', 'property-documents', 'property-images', 'property-videos')
  );

DROP POLICY IF EXISTS "Users delete their submission files" ON storage.objects;
CREATE POLICY "Users delete their submission files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id IN ('property-media', 'property-documents', 'property-images', 'property-videos')
    AND ((storage.foldername(name))[1] = auth.uid()::text OR auth.uid() = owner)
  );

-- Super Admin storage oversight: allow reading all uploaded files
DROP POLICY IF EXISTS "Admin reads all files" ON storage.objects;
CREATE POLICY "Admin reads all files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id IN ('property-media', 'property-documents', 'property-images', 'property-videos')
    AND public.is_super_admin()
  );


-- ==============================================================================
-- PART 6: CREATE SUPER ADMIN USER ACCOUNT
-- Email: superadmin@propertynexus.com
-- Password: PropertyNexus@2026
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'superadmin@propertynexus.com';
  user_pass text := 'PropertyNexus@2026';
BEGIN
  -- Create user in auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      extensions.crypt(user_pass, extensions.gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Super Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- Create identity record required for Supabase Auth login
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id, user_email)::jsonb,
      'email',
      now(),
      now(),
      now(),
      user_email
    );
  ELSE
    -- If user already exists, update password and confirm email
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(user_pass, extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = user_email;
  END IF;

  -- Ensure public.profiles has super_admin role for this account
  INSERT INTO public.profiles (id, full_name, role)
  SELECT id, 'Super Admin', 'super_admin'
  FROM auth.users
  WHERE email = user_email
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', full_name = 'Super Admin';
END $$;

-- ==============================================================================
-- DONE! SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY.
-- Credentials:
-- Email: superadmin@propertynexus.com
-- Password: PropertyNexus@2026
-- ==============================================================================
