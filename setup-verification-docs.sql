-- ==============================================================================
-- PROPERTIESNEXUS — USER VERIFICATION DOCUMENTS & PROVIDER SCHEMAS
-- ==============================================================================

-- 1. Update profiles table constraint to include all 6 roles & provider fields
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN ('buyer', 'seller', 'agent', 'builder', 'developer', 'investor', 'user', 'lister', 'admin', 'super_admin')
);

-- Add provider metadata columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- 2. User Verification Documents Table
CREATE TABLE IF NOT EXISTS public.user_verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  doc_category text NOT NULL,
  doc_type text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_verification_documents ENABLE ROW LEVEL SECURITY;

-- User Policies for verification docs
DROP POLICY IF EXISTS "Users manage their verification docs" ON public.user_verification_documents;
CREATE POLICY "Users manage their verification docs" ON public.user_verification_documents
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin reads all verification docs" ON public.user_verification_documents;
CREATE POLICY "Admin reads all verification docs" ON public.user_verification_documents
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin updates verification docs" ON public.user_verification_documents;
CREATE POLICY "Admin updates verification docs" ON public.user_verification_documents
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 3. Storage Bucket for User Verification Docs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-verification-docs',
  'user-verification-docs',
  false,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for user-verification-docs
DROP POLICY IF EXISTS "Users upload their verification docs storage" ON storage.objects;
CREATE POLICY "Users upload their verification docs storage" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'user-verification-docs'
  );

DROP POLICY IF EXISTS "Users read their verification docs storage" ON storage.objects;
CREATE POLICY "Users read their verification docs storage" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'user-verification-docs'
  );

-- 4. Property Submissions Document Updates
-- Add fields for key facts & extra listing documents
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS rera_number text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS tax_receipt_path text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS occupancy_cert_path text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS building_plan_path text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS floor_plan_path text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS ownership_proof_path text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS ownership_doc_type text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'Apartment';
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS is_duplex boolean DEFAULT false;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS has_loft boolean DEFAULT false;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS floor_info text DEFAULT 'Floor 2 of 15';
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS move_in_status text DEFAULT 'Vacant';
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS maintenance_fee text;
ALTER TABLE public.property_submissions ADD COLUMN IF NOT EXISTS deposit_amount text;
