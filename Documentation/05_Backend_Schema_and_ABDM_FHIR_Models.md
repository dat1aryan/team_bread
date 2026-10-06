# 05. Backend Schema & ABDM FHIR Data Models
## Project Name: SetuHealth AI Copilot (सेतु हेल्थ)
**Supabase PostgreSQL Schema, RLS Security Policies, & HL7 FHIR R4 Mapping**  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  

---

## 1. Relational Database Architecture (Supabase PostgreSQL)

```
                    +--------------------+
                    |    auth.users      |
                    +--------------------+
                              | 1
                              |
                              v 1
                    +--------------------+
                    |      profiles      |
                    +--------------------+
                     /        |        \
                   1/        1|         \1
                   v*         v*         v1
      +----------------+ +---------------+ +------------------+
      |   documents    | |timeline_events| |  abha_profiles   |
      +----------------+ +---------------+ +------------------+
             | 1
             |
             +-----------------------+
             |                       |
             v*                      v*
      +----------------+      +------------------+
      |  medications   |      | lab_observations |
      +----------------+      +------------------+
```

---

## 2. PostgreSQL DDL Specification

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'unknown')),
    blood_group TEXT,
    phone_number TEXT,
    emergency_contact TEXT,
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
    linked_facilities JSONB DEFAULT '[]'::jsonb,
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
    issuing_facility TEXT, -- Doctor clinic or hospital name
    doctor_name TEXT,
    ocr_raw_text TEXT,
    ai_summary JSONB, -- Plain-language summary, key takeaways, questions for doctor
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
    timing TEXT, -- "Before Food" or "After Food"
    duration TEXT, -- e.g. "30 days"
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Extracted Lab Test Observations Table
CREATE TABLE IF NOT EXISTS public.lab_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    category TEXT, -- e.g. "Lipid Profile", "Complete Blood Count", "Diabetic Panel"
    measured_value NUMERIC,
    measured_value_string TEXT, -- for non-numeric (e.g. "Negative", "Trace")
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
```

---

## 3. Row-Level Security (RLS) Policies

All tables enforce PostgreSQL Row-Level Security to guarantee complete patient data privacy:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abha_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Standard Policy: Users can only view and manage their own health records
CREATE POLICY "Users can access own profile" 
ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own ABHA profile" 
ON public.abha_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own documents" 
ON public.documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own medications" 
ON public.medications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own lab observations" 
ON public.lab_observations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own timeline events" 
ON public.timeline_events FOR ALL USING (auth.uid() = user_id);
```

---

## 4. HL7 FHIR R4 & ABDM Data Model Alignment

Under India's Ayushman Bharat Digital Mission (ABDM), health data is exchanged using standard HL7 FHIR R4 Bundles. SetuHealth automatically synthesizes compliant FHIR resources from parsed documents:

### 4.1 FHIR Bundle Structure
```json
{
  "resourceType": "Bundle",
  "id": "setu-health-bundle-001",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2026-10-06T12:00:00Z",
    "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
  },
  "type": "document",
  "timestamp": "2026-10-06T12:00:00Z",
  "entry": [
    {
      "fullUrl": "urn:uuid:patient-01",
      "resource": {
        "resourceType": "Patient",
        "id": "patient-01",
        "identifier": [
          {
            "system": "https://healthid.ndhm.gov.in",
            "type": { "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR", "display": "Medical Record Number" }] },
            "value": "91-2048-5892-1144"
          }
        ],
        "name": [{ "text": "Rajesh Kumar" }],
        "gender": "male",
        "birthDate": "1974-05-14"
      }
    },
    {
      "fullUrl": "urn:uuid:diagnosticreport-01",
      "resource": {
        "resourceType": "DiagnosticReport",
        "id": "diagnosticreport-01",
        "status": "final",
        "category": [
          {
            "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v2-0074", "code": "LAB", "display": "Laboratory" }]
          }
        ],
        "code": { "text": "Comprehensive Diabetic & Lipid Health Panel" },
        "subject": { "reference": "urn:uuid:patient-01" },
        "effectiveDateTime": "2026-10-05T09:30:00Z",
        "result": [
          { "reference": "urn:uuid:observation-hba1c" },
          { "reference": "urn:uuid:observation-glucose" }
        ],
        "conclusion": "Elevated HbA1c indicative of sub-optimally controlled glycemic levels. Lipid profile within borderline parameters."
      }
    },
    {
      "fullUrl": "urn:uuid:observation-hba1c",
      "resource": {
        "resourceType": "Observation",
        "id": "observation-hba1c",
        "status": "final",
        "category": [{ "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "laboratory" }] }],
        "code": {
          "coding": [{ "system": "http://loinc.org", "code": "4548-4", "display": "Hemoglobin A1c/Hemoglobin.total in Blood" }],
          "text": "HbA1c (Glycated Hemoglobin)"
        },
        "subject": { "reference": "urn:uuid:patient-01" },
        "valueQuantity": { "value": 7.4, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%" },
        "interpretation": [{ "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", "code": "H", "display": "High" }] }],
        "referenceRange": [{ "low": { "value": 4.0, "unit": "%" }, "high": { "value": 5.6, "unit": "%" } }]
      }
    },
    {
      "fullUrl": "urn:uuid:medicationrequest-01",
      "resource": {
        "resourceType": "MedicationRequest",
        "id": "medicationrequest-01",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": { "text": "Metformin Hydrochloride 500mg" },
        "subject": { "reference": "urn:uuid:patient-01" },
        "dosageInstruction": [
          {
            "text": "1 tablet twice daily after meals",
            "timing": { "repeat": { "frequency": 2, "period": 1, "periodUnit": "d" } },
            "route": { "coding": [{ "system": "http://snomed.info/sct", "code": "260548002", "display": "Oral" }] }
          }
        ]
      }
    }
  ]
}
```
