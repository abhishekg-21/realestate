-- Create an ENUM for property status
CREATE TYPE property_status AS ENUM ('draft', 'published', 'sold', 'rented');

-- Create an ENUM for property type
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'builder_floor', 'plot', 'commercial');

-- Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('buy', 'rent', 'lease', 'pg')),
    price DECIMAL(15, 2) NOT NULL,
    is_negotiable BOOLEAN DEFAULT false,
    
    -- Location details
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    zip_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Specifications
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft DECIMAL(10, 2),
    furnishing TEXT CHECK (furnishing IN ('unfurnished', 'semi-furnished', 'fully-furnished')),
    property_age TEXT,
    
    -- Status and Timestamps
    status property_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Property Media Table for Images/Videos
CREATE TABLE IF NOT EXISTS public.property_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'floorplan')) DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
-- Anyone can view published properties
CREATE POLICY "Public properties are viewable by everyone." 
ON public.properties FOR SELECT 
USING (status = 'published');

-- Owners can view all their own properties (including drafts)
CREATE POLICY "Users can view their own properties." 
ON public.properties FOR SELECT 
USING (auth.uid() = owner_id);

-- Owners can insert their own properties
CREATE POLICY "Users can insert their own properties." 
ON public.properties FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own properties
CREATE POLICY "Users can update their own properties." 
ON public.properties FOR UPDATE 
USING (auth.uid() = owner_id);

-- Owners can delete their own properties
CREATE POLICY "Users can delete their own properties." 
ON public.properties FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS Policies for property media
CREATE POLICY "Media is viewable by everyone." 
ON public.property_media FOR SELECT 
USING (true);

CREATE POLICY "Users can insert media for their properties." 
ON public.property_media FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        SELECT owner_id FROM public.properties WHERE id = property_id
    )
);

CREATE POLICY "Users can update media for their properties." 
ON public.property_media FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT owner_id FROM public.properties WHERE id = property_id
    )
);

CREATE POLICY "Users can delete media for their properties." 
ON public.property_media FOR DELETE 
USING (
    auth.uid() IN (
        SELECT owner_id FROM public.properties WHERE id = property_id
    )
);

-- Create storage bucket for property images if not exists (run this via dashboard usually)
-- insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true);
