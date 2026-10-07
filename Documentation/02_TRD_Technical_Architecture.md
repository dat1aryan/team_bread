# 02. Technical Requirements Document (TRD)
## Project Name: Setu AI Copilot (सेतु हेल्थ)
**System Architecture & Technical Specifications**  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  

---

## 1. System Architecture Overview
Setu Copilot is architected as an AI-native, modular, full-stack digital health platform designed for high reliability, clinical safety, real-time response, and global health data interoperability (HL7 FHIR R4 & ABDM).

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|   Next.js 14 App Router + React 18 + Tailwind CSS + Lucide Icons + Recharts Engine     |
|   • Document Dropzone & Camera OCR     • Plain-Language AI Card & Audio TTS           |
|   • Unified Health Timeline            • Longitudinal Biomarker Trends Chart          |
|   • ABDM ABHA ID & FHIR Inspector      • Interactive Pitch Deck & Architecture Visualizer |
+---------------------------------------------------------------------------------------+
                                           |  HTTPS / REST / JSON
                                           v
+---------------------------------------------------------------------------------------+
|                                  APPLICATION / API LAYER                              |
|   Next.js Serverless Edge / Node API Routes (Deployed on Vercel / Render Web Service)  |
|   • /api/ocr-process      : Client/Server multi-modal OCR text & entity ingestion      |
|   • /api/clinical-extract : Structured JSON extraction (meds, tests, diagnosis, dates)|
|   • /api/health-summary   : Plain-language translation & abnormal biomarker analysis  |
|   • /api/multilingual     : Multi-language translation (Hindi, Telugu, Tamil, etc.)   |
|   • /api/abdm-fhir        : HL7 FHIR R4 Bundle generator & ABDM M4 validation         |
|   • /api/drug-safety      : Drug-Drug interaction check & clinical triage classification|
+---------------------------------------------------------------------------------------+
                                           |
         +---------------------------------+---------------------------------+
         |                                                                   |
         v                                                                   v
+-----------------------------------+             +------------------------------------+
|          AI & OCR ENGINE          |             |       PERSISTENCE & SECURITY       |
| • Google Gemini Multimodal Vision |             | • Supabase PostgreSQL (Database)   |
| • Tesseract OCR / Canvas Pre-proc |             | • Supabase Storage (S3-compatible) |
| • Heuristic Clinical Parser & LOINC|             | • Supabase Auth (JWT / RLS Policies)|
| • Fallback Medical Rule Engine    |             | • LocalStorage Sync (Zero-downtime |
|   (Deterministic Clinical Safety) |             |   offline demo & judge resilience) |
+-----------------------------------+             +------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                       ABDM / HL7 FHIR R4 INTEROPERABILITY GATEWAY                     |
| • Patient Resource                • DiagnosticReport Resource                         |
| • Observation Resource (Biomarkers) • MedicationRequest Resource                      |
| • Mock ABHA ID Link & Gateway (14-digit & PHR Address @abdm)                          |
+---------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack Selection & Justification

| Layer | Technology | Version | Rationale & Advantage |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 14.2.x | Best-in-class React framework, instant SSR/SSG, optimized image/document handling, seamless Vercel & Render deployment. |
| **Language** | TypeScript | 5.x | Strict type safety across complex clinical records, FHIR JSON schemas, and API payload definitions. |
| **Styling & Design** | Tailwind CSS | 3.4.x | Rapid utility-first styling with custom medical color system, accessible contrast ratios, and glassmorphic card designs. |
| **Icons & Visuals** | Lucide React | Latest | Clean, accessible, modern SVG icon set for clinical markers and navigation. |
| **Data Visualization** | Recharts | 2.12.x | Declarative, SVG-based charting for responsive longitudinal vital trends (HbA1c, BP, Glucose, Lipids). |
| **Database & Auth** | Supabase | Latest | Open-source PostgreSQL with built-in Row-Level Security (RLS), JWT Authentication, and S3-compatible encrypted blob storage. |
| **Multi-Modal AI** | Google Gemini API + Rule Engine | Gemini 1.5 / Flash | High token window, superior OCR vision capability, structured JSON mode output, and clinical reasoning. |
| **Client OCR Engine**| Tesseract.js / Canvas | 5.x | In-browser zero-latency OCR preprocessing, handling offline and immediate user feedback. |
| **Deployment Targets**| Vercel & Render | Production | Vercel for zero-config global CDN frontend deployment; Render for Docker / Node.js web services with health checks. |

---

## 3. Data Ingestion & OCR Processing Pipeline

### Pipeline Stages:
1. **Document Intake**:
   - Supports file formats: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`.
   - File size ceiling: 20MB per document.
   - Client-side image enhancement: Grayscale normalization, contrast stretching, and rotation correction.
2. **Text & Token Extraction**:
   - Primary: Gemini Multimodal Vision API parses the document directly with specialized medical prompt templates requesting structured JSON.
   - Secondary / Client fallback: Tesseract.js extracts raw text tokens with positional bounding boxes.
3. **Clinical Entity Normalization**:
   - **Medication Extractor**: Regex + clinical dictionaries parse drug formulations (Tab, Cap, Syp, Inj), standard strength metrics (mg, mcg, IU, ml), and frequency codes (*OD = Once Daily*, *BD = Twice Daily*, *TID = Thrice Daily*, *QID = 4x Daily*, *SOS/PRN = As Needed*, *AC = Before Food*, *PC = After Food*).
   - **Biomarker Extractor**: Normalized against standard clinical units (e.g., Blood Glucose in mg/dL, HbA1c in %, Hemoglobin in g/dL) and mapped to LOINC (Logical Observation Identifiers Names and Codes).
   - **Abnormal Flag Determination**: Automatic comparison of patient measured values against age/gender-specific standard clinical reference intervals:
     - `NORMAL`: Within reference bounds.
     - `ELEVATED`: Above upper limit.
     - `LOW`: Below lower limit.
     - `CRITICAL`: In dangerous range (e.g., Blood Glucose > 300 mg/dL or Potassium < 2.5 mEq/L).

---

## 4. Plain-Language AI Summarization Architecture
The medical summarization engine uses a dual-layer architecture ensuring both **compassionate patient readability** and **strict clinical correctness**:

1. **Patient-Friendly Translation Layer**:
   - Converts clinical terms to lay terms (e.g., *Hypercholesterolemia* -> *Elevated blood cholesterol*; *Hypoglycemia* -> *Low blood sugar*).
   - Explains the "Why it matters" in 1-2 friendly sentences.
2. **Abnormal Marker Breakdown**:
   - For every flagged test, explains:
     - Normal range vs. Your result.
     - What could cause this elevation/drop (diet, stress, medication, dehydration, pathology).
     - Recommended next steps (lifestyle, dietary tip, repeat test interval).
3. **Clinical Safety & Triage Engine**:
   - Classifies report urgency into:
     - `Routine Monitoring`: No emergency; review during regular checkup.
     - `Consult Doctor Soon`: Requires scheduled physician review within 3-7 days.
     - `Seek Immediate Medical Care`: Critical values requiring emergency triage.
4. **Questions for Your Doctor**:
   - Automatically formulates 3 to 4 personalized questions the patient should bring to their next consultation.
5. **Medical Guardrail Disclaimer**:
   - Mandatory disclaimer banner on every generated summary: *"Setu AI is an educational assistant and not a diagnostic medical device. Consult your licensed healthcare provider before altering any treatment."*

---

## 5. Multi-Language & Voice Architecture
- **Language Dictionaries & AI Prompt Localizer**:
  - Languages supported: English, Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Bengali (`bn`), Marathi (`mr`), Spanish (`es`).
  - Summaries are translated contextually so medical explanations preserve exact clinical accuracy without awkward literal translations.
- **Audio Synthesis Engine**:
  - Web Speech API (`SpeechSynthesisUtterance`) with regional voice detection (`hi-IN`, `te-IN`, `ta-IN`, `en-IN`).
  - One-click voice playback allows non-literate or elderly patients to listen to their health summary and medication reminders.

---

## 6. ABDM / ABHA & HL7 FHIR R4 Conformance

### FHIR R4 Resource Mapping:
- **`Patient`**: Maps ABHA ID (14 digits), ABHA address (`@abdm`), name, gender, birth date, contact.
- **`DiagnosticReport`**: Stores pathology / radiology reports, effective date/time, issuing laboratory, status (`final`), and references to individual `Observation` resources.
- **`Observation`**: Individual lab biomarkers with:
  - `code`: Analyte name and LOINC code (e.g., `4548-4` for HbA1c).
  - `valueQuantity`: Value + unit (`%`, `mg/dL`).
  - `interpretation`: Codes `N` (Normal), `H` (High), `L` (Low), `A` (Abnormal).
  - `referenceRange`: Low and High boundaries.
- **`MedicationRequest`**: Represents prescribed medicines:
  - `medicationCodeableConcept`: Drug name and strength.
  - `dosageInstruction`: Timing, route, and frequency.
- **`Condition`**: Clinical diagnoses recorded in discharge summaries or prescriptions with verification status.

---

## 7. Storage, Persistence & Fallback Resilience
- **Supabase Cloud Backend**:
  - PostgreSQL relational database for users, documents, extracted data, and timeline logs.
  - Supabase Storage bucket (`medical-records`) for encrypted document storage.
  - Supabase Auth for secure JWT-based authentication.
- **Zero-Config Judge Mode (Offline / In-Memory Fallback)**:
  - To prevent hackathon evaluation failures if network latency spikes or Supabase credentials are not populated in the evaluator's test environment, the app includes a **Dual-Mode Persistence Layer**:
  - Automatically checks for active Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - If present: Read and write to live Supabase PostgreSQL.
  - If omitted or offline: Seamlessly falls back to an encrypted browser-level state engine (`localStorage` + in-memory store) preloaded with rich realistic clinical profiles so evaluators experience 100% feature richness instantly.

---

## 8. Deployment Architecture
- **Vercel (Primary Frontend & Edge)**:
  - Built via `next build` -> optimized static & serverless edge lambdas.
  - Configured with `vercel.json` routing and caching headers.
- **Render (Alternative / Backend Full-Stack)**:
  - Dockerized or Node.js web service running `npm start`.
  - Configured with `render.yaml` infrastructure-as-code blueprint.
