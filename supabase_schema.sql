-- ========================================================================
-- SetuHealth AI Copilot (सेतु हेल्थ) - Supabase PostgreSQL Database Schema
-- Aligned with India ABDM (Ayushman Bharat Digital Mission) & HL7 FHIR R4
-- ========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE DEFAULT '1974-05-14',
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')) DEFAULT 'male',
    blood_group TEXT DEFAULT 'B+',
    phone_number TEXT DEFAULT '+91 98765 43210',
    emergency_contact TEXT DEFAULT '+91 98765 43211',
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ABDM / ABHA Profile Table
CREATE TABLE IF NOT EXISTS public.abha_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    abha_number TEXT UNIQUE NOT NULL, -- e.g. "91-2048-5892-1144"
    abha_address TEXT UNIQUE NOT NULL, -- e.g. "rajesh.kumar@abdm"
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
    kyc_verified BOOLEAN DEFAULT TRUE,
    linked_facilities JSONB DEFAULT '[
      {"name": "Max Super Speciality Hospital", "hip_id": "IN0710001", "type": "HOSPITAL"},
      {"name": "Dr. Lal PathLabs", "hip_id": "IN0710045", "type": "DIAGNOSTIC_LAB"},
      {"name": "Apollo Clinic OPD", "hip_id": "IN0710099", "type": "CLINIC"}
    ]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Ingested Medical Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'DIAGNOSTIC_IMAGING', 'OTHER')),
    document_date DATE DEFAULT CURRENT_DATE,
    issuing_facility TEXT DEFAULT 'City Diagnostics & Hospital',
    doctor_name TEXT DEFAULT 'Dr. Arvind Mehra, MD',
    ocr_raw_text TEXT,
    ai_summary JSONB,
    urgency_level TEXT DEFAULT 'ROUTINE' CHECK (urgency_level IN ('ROUTINE', 'MONITOR', 'CONSULT_SOON', 'IMMEDIATE_CARE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Extracted Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    drug_name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT NOT NULL, -- e.g. "500mg"
    frequency TEXT NOT NULL, -- e.g. "Twice Daily (BD)"
    route TEXT DEFAULT 'Oral',
    timing TEXT DEFAULT 'After Food', -- "Before Food" or "After Food"
    duration TEXT DEFAULT '30 days',
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Extracted Lab Test Observations Table (Biomarkers)
CREATE TABLE IF NOT EXISTS public.lab_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    category TEXT, -- e.g. "Diabetic Panel", "Lipid Profile", "Complete Blood Count"
    measured_value NUMERIC,
    measured_value_string TEXT,
    unit TEXT, -- e.g. "mg/dL", "%", "g/dL"
    reference_low NUMERIC,
    reference_high NUMERIC,
    reference_range_string TEXT,
    status TEXT NOT NULL CHECK (status IN ('NORMAL', 'HIGH', 'LOW', 'CRITICAL')),
    loinc_code TEXT, -- e.g. "4548-4" for HbA1c
    clinical_interpretation TEXT,
    observation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Unified Timeline Events Table
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('PRESCRIPTION', 'LAB_RESULT', 'DISCHARGE', 'DOCTOR_VISIT', 'AI_INSIGHT')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================================
-- Row Level Security (RLS) Setup
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abha_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own ABHA" ON public.abha_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own medications" ON public.medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own lab observations" ON public.lab_observations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own timeline events" ON public.timeline_events FOR ALL USING (auth.uid() = user_id);

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-records', 'medical-records', true)
ON CONFLICT (id) DO NOTHING;
