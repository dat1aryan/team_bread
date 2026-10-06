# 01. Product Requirements Document (PRD)
## Project Name: SetuHealth AI Copilot (सेतु हेल्थ)
**Tagline**: *Bridging Complex Medical Data to Actionable Human Health*  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  
**Round**: Round 1 — 24-Hour Campus Hackathon  
**Problem Statement**: AI-Powered Personal Health Copilot  
**Author / Team**: SetuHealth Innovation Team  
**Date**: October 2026  

---

## 1. Executive Summary & Problem Context
Modern healthcare is notoriously fragmented. When a patient experiences a medical event or manages chronic conditions (e.g., Diabetes, Hypertension, Thyroid disorders), they accumulate a disparate stack of physical and digital artifacts:
- Handwritten and printed doctor prescriptions with abbreviated clinical notes (e.g., *Tab Metformin 500mg 1-0-1 BD PC*).
- Complex laboratory pathology reports (CBC, Lipid profiles, LFT, KFT, HbA1c) dense with acronyms, reference intervals, and flagged values.
- Multi-page hospital discharge summaries detailing diagnoses, clinical procedures, inpatient medications, and follow-up directives.
- Imaging reports (Ultrasound, X-Ray, MRI summaries).

### The Critical Gaps:
1. **Medical Jargon & Comprehension Barrier**: Over 78% of patients cannot interpret whether a borderline lab value requires emergency care or routine monitoring.
2. **Fragmented Records & Lost History**: Patients carry envelopes of paper reports to consultations. Prior trend history (e.g., how HbA1c changed over 12 months) is inaccessible.
3. **Linguistic Isolation**: In diverse populations (especially India), the majority of diagnostic and prescription reports are in English, while patients and elderly family caregivers think and speak in regional languages (Hindi, Telugu, Tamil, Bengali, Marathi).
4. **Lack of Interoperability**: Healthcare systems operate in data silos. India's Ayushman Bharat Digital Mission (ABDM) and global FHIR (Fast Healthcare Interoperability Resources) standards are emerging, but existing consumer apps do not translate legacy paper records into ABDM-ready digital health records.

---

## 2. Product Vision & Value Proposition
**SetuHealth Copilot** is an AI-powered personal health companion that ingests, digitizes, interprets, and unifies fragmented medical documents into an intuitive, interactive, patient-first health ecosystem.

### Value Pillars:
- **Zero-Friction Ingestion**: Ingest photos, scans, and PDFs of prescriptions, lab sheets, and discharge summaries via intelligent multi-modal OCR.
- **Explainable Clinical AI**: Transform cryptic test values and Latin medical abbreviations into compassionate, clear, plain-language explanations with clear clinical context.
- **Unified Health Timeline & Dynamic Trends**: Automatically organize every prescription, lab test, and doctor consultation into a chronological timeline with visual trend charts for key health markers.
- **Linguistic Inclusivity**: Real-time AI explanations and voice read-aloud in regional Indian languages (Hindi, Telugu, Tamil, Marathi, Bengali) and global languages.
- **ABDM / ABHA Digital Public Infrastructure**: Connects to the Ayushman Bharat Digital Mission (ABDM) standard, generating compliant FHIR R4 resources (`DiagnosticReport`, `Observation`, `MedicationRequest`, `Patient`) with mock ABHA ID linking.

---

## 3. Target User Personas

### Persona A: Rajesh Kumar (52, Managing Type-2 Diabetes & Hypertension)
- **Profile**: Working professional managing dual chronic conditions for 6 years. Visits 2 different doctors; receives blood tests every 3 months.
- **Pain Point**: Struggles to remember if his creatinine or cholesterol has been rising or falling over the past 2 years. Gets anxious seeing red asterisk marks on lab sheets.
- **Need**: Longitudinal trend tracking, simple explanations of abnormal values, and clear drug-drug interaction alerts.

### Persona B: Sunita Devi (68, Rural/Semi-Urban Caregiver & Patient)
- **Profile**: Primary language is Hindi; struggles with complex English medical reports. Her daughter helps manage her prescriptions remotely.
- **Pain Point**: Cannot read English prescription directions. Doesn't know when to take which tablet.
- **Need**: Hindi summaries, voice read-aloud, and simplified morning/afternoon/night medication schedules.

### Persona C: Dr. Ananya Sharma (Primary Care Physician)
- **Profile**: Consults 40 patients per day in an OPD setting.
- **Pain Point**: Spends 6 to 8 minutes per patient flipping through dog-eared paper folders trying to reconstruct patient history.
- **Need**: A 30-second "Clinical Summary Brief" showing active medications, recent abnormal lab trends, and chronological hospital encounters.

---

## 4. Core Scope & Feature Requirements (Round 1)

### 4.1 Feature 1: Medical Record Intelligence & Multi-Modal OCR
- **Ingestion**: Supports image formats (PNG, JPG, WEBP) and multi-page PDFs, camera capture, and 1-click sample document test cases for instant evaluation.
- **Entity Extraction**:
  - **Medications**: Brand name, generic molecule, dosage strength (e.g., 500mg), frequency (OD, BD, TID, PRN), timing (Before Food / After Food), duration, and administration route.
  - **Laboratory Tests**: Test analyte name, measured value, standardized units (mg/dL, mmol/L, g/dL), reference normal ranges, abnormal status (`NORMAL`, `ELEVATED`, `LOW`, `CRITICAL`).
  - **Clinical Diagnoses & Findings**: Primary diagnosis, secondary conditions, ICD-10 suggested codes, clinical notes.
  - **Administrative Metadata**: Doctor/Hospital name, specialty, report date, patient demographic info.

### 4.2 Feature 2: Plain-Language AI Health Summary & Clinical Explanations
- **Plain-Language Translation**: Summarizes complex findings at an 8th-grade reading level.
- **Abnormal Value Interpretation**: Explains *why* a biomarker is out of range, potential lifestyle or metabolic contributors, and physiological context.
- **Clinical Triage Level**: Categorizes severity into `ROUTINE`, `MONITOR`, `CONSULT_SOON`, or `IMMEDIATE_CARE`.
- **Actionable Steps**: Lifestyle, hydration, dietary adjustments, and a generated checklist of *"Targeted Questions for your Doctor at your next appointment"*.
- **Safety Guardrails & Disclaimers**: Strict adherence to medical disclaimer protocols (AI assistant, not a replacement for medical diagnosis).

### 4.3 Feature 3: Unified Health Profile & Interactive Timeline
- **Chronological Health Journey**: Interactive visual feed of all health encounters, categorized by type (Prescription, Pathology, Discharge Summary, Consultation).
- **Interactive Vital Trends Engine**: Dynamic historical charting for crucial chronic biomarkers:
  - Glycemic Control: Fasting Blood Glucose, Post-Prandial Glucose, HbA1c
  - Cardiovascular / Lipid Profile: Total Cholesterol, LDL, HDL, Triglycerides, Blood Pressure (Systolic/Diastolic)
  - Renal & Hepatic: Serum Creatinine, eGFR, SGPT/ALT
  - Hematology: Hemoglobin, White Blood Cell (WBC), Platelets
- **Active Medication Management**: Smart medication dashboard grouping active drugs by time of day (Morning, Afternoon, Evening, Night) with adherence tracking and drug interaction warnings.

---

## 5. Bonus Features (Round 1 Criteria — 10 Bonus Points)

### 5.1 Bonus Feature A: Multi-Language & Regional Inclusivity
- **Multi-lingual AI Engine**: Instant switching of all summaries and analysis into regional languages:
  - हिन्दी (Hindi)
  - తెలుగు (Telugu)
  - தமிழ் (Tamil)
  - বাংলা (Bengali)
  - मराठी (Marathi)
  - Español (Spanish)
- **Audio Read-Aloud (Text-to-Speech)**: Integrated browser SpeechSynthesis API that speaks the explanation aloud in the selected regional language for elderly and visually impaired users.
- **Bilingual & Handwritten OCR Handling**: Capable of reading bilingual prescription notations (e.g., Hindi/English instructions like "१ गोली सुबह खाने के बाद").

### 5.2 Bonus Feature B: ABDM & ABHA National Health Stack Readiness
- **ABDM Data Modeling**: System schema strictly aligns with National Health Authority (NHA) ABDM standards and HL7 FHIR R4 profiles.
- **Mock ABHA ID Integration**:
  - Verification & generation of 14-digit ABHA ID (`91-XXXX-XXXX-XXXX`) and ABHA Address (`name@abdm`).
  - Mock OTP authentication flow simulating the ABDM Gateway.
- **FHIR R4 Bundle Generation & Export**:
  - Transforms extracted records into compliant FHIR R4 JSON resources:
    - `Bundle` (type: document)
    - `Patient`
    - `DiagnosticReport` (Pathology / Radiology)
    - `Observation` (Quantitative Lab Measurements with LOINC codes)
    - `MedicationRequest` (Prescribed therapies with dosage instructions)
    - `Condition` (Diagnoses with clinical status)
  - 1-click FHIR JSON download and interactive FHIR Schema Inspector for judges and technical evaluators.

---

## 6. Success Metrics & Hackathon Evaluation Alignment

| Evaluation Criterion | Hackathon Weight | How SetuHealth Excels |
| :--- | :---: | :--- |
| **AI Utilization** | **35%** | High-precision multi-entity OCR extraction (medications, doses, abnormal lab values, dates), medical entity classification, plain-language empathetic explanations, contextual abnormal value breakdowns. |
| **Technical Architecture** | **25%** | Clean data pipeline, Supabase PostgreSQL with RLS, Supabase Storage, offline/mock fallback for 100% demo uptime, ABDM FHIR R4 schema compliance. |
| **User Experience (UX)** | **20%** | Ultra-clean modern UI, drag-and-drop file upload, 1-click sample document test bench, interactive timeline, dynamic vital trend charts, regional language toggle. |
| **Healthcare Impact & Safety** | **10%** | Medically verified clinical guardrails, no hallucinated diagnostics, clear triage guidance, proactive drug interaction alerts, persistent ethical disclaimers. |
| **Presentation & Demo** | **10%** | Built-in interactive pitch deck slide viewer, live architecture visualizer, exportable patient health summaries, end-to-end working flow. |
| **Bonus: Multi-Language** | **+5%** | Full Hindi, Telugu, Tamil, Bengali, Marathi translations + regional voice read-aloud. |
| **Bonus: ABDM / ABHA** | **+5%** | Mock ABHA ID linking + complete FHIR R4 compliant bundle generator and viewer. |
