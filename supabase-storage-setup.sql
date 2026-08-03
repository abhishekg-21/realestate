-- ==============================================================================
-- SUPABASE STORAGE SETUP SCRIPT FOR PROPERTIESNEXUS (50MB UPLOAD LIMIT)
-- ==============================================================================
-- Run this script once in your Supabase Dashboard → SQL Editor to configure
-- storage buckets for property photos and videos with a 50MB file size limit.
-- ==============================================================================

-- 1. Create storage buckets for property images, videos, and general media
--    file_size_limit is set to 52428800 bytes (exactly 50 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'property-images', 
    'property-images', 
    true, 
    52428800, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
  ),
  (
    'property-videos', 
    'property-videos', 
    true, 
    52428800, 
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'property-media', 
    'property-media', 
    true, 
    52428800, 
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Note: RLS is enabled by default on storage.objects in Supabase.
-- (No need to run ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;)

-- 3. Drop existing policies if they conflict or need updating
DROP POLICY IF EXISTS "Public access to property media objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property media" ON storage.objects;
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload property images" ON storage.objects;

-- 4. Create comprehensive RLS Policies for Storage Buckets
-- Allow public viewing of any file in property-images, property-videos, or property-media
CREATE POLICY "Public access to property media objects"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('property-images', 'property-videos', 'property-media')
);

-- Allow authenticated users to upload files to these buckets
CREATE POLICY "Authenticated users can upload property media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('property-images', 'property-videos', 'property-media')
);

-- Allow authenticated users to update their own files (where folder prefix matches user id or they own the object)
CREATE POLICY "Users can update their own property media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('property-images', 'property-videos', 'property-media') AND
  (auth.uid() = owner OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own property media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('property-images', 'property-videos', 'property-media') AND
  (auth.uid() = owner OR (storage.foldername(name))[1] = auth.uid()::text)
);

-- Note: Once executed in Supabase SQL Editor, photo and video uploads up to 50MB will be fully enabled!
