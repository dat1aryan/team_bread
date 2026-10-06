# 03. App Flow & User Journey Map
## Project Name: SetuHealth AI Copilot (सेतु हेल्थ)
**Navigation Pathways, State Machines, & User Flows**  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  

---

## 1. High-Level App Flow Diagram

```
+-----------------------------------------------------------------------------------+
|                                  ENTRY POINT                                      |
|            Landing Page / Hero Overview / 1-Click "Demo Access" Mode              |
+-----------------------------------------------------------------------------------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                        v                                   v
             [Authenticated Login]                 [1-Click Quick Demo]
             (Supabase Auth Email/PW)               (Instant Judge Access)
                        \                                   /
                         +-----------------+---------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              MAIN COPILOT DASHBOARD                               |
|   • Quick Stat Highlights (Total Records, Active Meds, Flagged Biomarkers)        |
|   • Action Center: Upload New Record / Test Sample Case                           |
|   • Recent Health Activities Feed                                                 |
+-----------------------------------------------------------------------------------+
       |                     |                     |                     |
       v                     v                     v                     v
[1. Upload & OCR]    [2. Health Timeline]  [3. Vital Trends]   [4. ABDM / ABHA Hub]
  - Drag & Drop        - Chronological       - Blood Glucose     - Link ABHA ID
  - Camera Capture       Encounter Cards     - HbA1c Tracker     - Import Records
  - 1-Click Samples    - Filter by Type      - Lipid Profile     - FHIR Inspector
  - Entity Extraction  - Search & Tags       - Blood Pressure    - Download Bundle
  - Plain Summary      - Detail Drawer       - Kidney / Liver    - Health Card
       |
       +---> [AI Copilot Health Explainer View]
               - Layman Health Summary
               - Flagged Abnormal Values with "Why it Matters"
               - Multilingual Switcher (Hindi, Telugu, Tamil, etc.)
               - Audio Read-Aloud (Text-to-Speech)
               - Personalized "Questions for Your Doctor"
               - Export PDF Patient Report / FHIR JSON
```

---

## 2. Detailed User Journey Pathways

### Journey 1: Medical Record Ingestion & Intelligent OCR Extraction
1. **User lands on Dashboard**: Clicks **"Upload Document"** or selects one of the pre-loaded **"Test Sample Cases"** (e.g. *Type-2 Diabetes Lab Panel*, *Cardiology Prescription*, or *Discharge Summary*).
2. **Dropzone Interaction**:
   - User drags and drops a file or clicks to browse.
   - Client displays document preview thumbnail with document size and MIME type.
3. **AI Extraction Phase**:
   - User clicks **"Analyze with AI Copilot"**.
   - Visual progress states cycle smoothly:
     - `Stage 1: Scanning image with OCR & Multimodal Vision...`
     - `Stage 2: Extracting clinical entities (Meds, Dosages, Test Values)...`
     - `Stage 3: Normalizing reference ranges and flagging abnormalities...`
     - `Stage 4: Generating plain-language patient summary and action steps...`
4. **Structured Review Screen**:
   - Split view: Original Document preview on the left; Extracted Intelligence on the right.
   - **Tab 1: Plain AI Summary**: Concise summary in 8th-grade language, clinical urgency badge (`Routine`, `Consult Soon`, `Emergency`), and bulleted lifestyle guidance.
   - **Tab 2: Lab Test Biomarkers**: Clean data table with test name, measured value, units, normal range, and color-coded status badges (Green = Normal, Amber = Borderline/High, Red = Critical).
   - **Tab 3: Prescribed Medications**: Dosage cards showing medication name, strength, frequency, timing relative to meals, and instructions.
   - **Tab 4: Clinical Findings**: Diagnoses identified, clinical notes, and physician details.
5. **Commitment**: User clicks **"Save to Unified Health Profile"**, automatically synchronizing the record into the database and updating the health timeline.

---

## 3. Journey 2: Longitudinal Vital Trends & Chronic Condition Monitoring
1. User navigates to **"Vital Trends & Analytics"** tab.
2. Selects biomarker category from the selector:
   - **Glycemic Panel**: Blood Glucose (Fasting & PP) and HbA1c over 6-12 months.
   - **Cardiovascular Panel**: Total Cholesterol, LDL ("Bad" Cholesterol), HDL ("Good" Cholesterol), Triglycerides, and Systolic/Diastolic BP.
   - **Renal & Hematology**: Serum Creatinine, eGFR, and Hemoglobin.
3. Interactive Recharts visualization renders:
   - Upper and lower clinical threshold guideline bands (e.g., Target HbA1c < 7.0%).
   - Tooltip details on hover showing exact test date, lab name, and test result.
   - Automatic AI Trend Commentary: e.g. *"Positive Trend: Your HbA1c decreased from 8.2% in March to 7.1% in October following Metformin dosage adjustment."*

---

## 4. Journey 3: Multilingual & Audio Inclusion (Elderly / Caregiver Flow)
1. User or caregiver opens any health summary card.
2. User clicks the **Language Selector** dropdown in the top header or on the summary card.
3. User selects **हिन्दी (Hindi)**:
   - The entire explanation instantly morphs into fluent, grammatically natural Hindi.
   - Cryptic terms are simplified: e.g., *"आपका HbA1c 7.4% है, जो दर्शाता है कि पिछले 3 महीनों में आपका रक्त शर्करा (Blood Sugar) स्तर थोड़ा बढ़ा हुआ रहा है।"*
4. User clicks **"Listen (बोलकर सुनाएं)"**:
   - Built-in speech synthesizer initiates voice playback in native Indian Hindi accent.
   - Caregivers can play this directly to elderly family members who cannot read English or screen text.

---

## 5. Journey 4: ABDM / ABHA Linking & FHIR Interoperability
1. User clicks **"ABDM & ABHA Hub"**.
2. **Mock ABHA Verification**:
   - Pre-populated or editable 14-digit ABHA number: `91-2048-5892-1144` or ABHA address: `rajesh.kumar@abdm`.
   - User clicks **"Verify via OTP"** -> Simulated secure OTP verification modal -> Displays verified ABDM Digital Health Badge with QR Code.
3. **FHIR R4 Inspector**:
   - Real-time conversion of patient records into HL7 FHIR R4 standard JSON bundles.
   - Evaluator can expand JSON nodes: `Bundle -> entry[0].resource (Patient) -> entry[1].resource (DiagnosticReport) -> entry[2].resource (Observation)`.
   - **Download FHIR Bundle**: 1-click JSON export compliant with ABDM M4 milestone specifications.

---

## 6. Journey 5: Medication Schedule & Safety Guardrail Check
1. User accesses **"Medication Manager"**.
2. Daily Schedule timeline separates drugs into:
   - **Morning (सुबह)**: Metformin 500mg, Telmisartan 40mg (with breakfast).
   - **Afternoon (दोपहर)**: Vitamin D3 / Calcium.
   - **Night (रात)**: Atorvastatin 10mg (after dinner).
3. **Drug-Drug Interaction Checker**:
   - System checks active medications for known contraindications.
   - Flags potential risks (e.g., dual NSAID use or Statin-Fibrate caution) and recommends verifying with physician.

---

## 7. Journey 6: Judge Evaluation & Presentation Mode
1. Dedicated top navigation button: **"Judges / Demo Presentation"**.
2. Opens full-screen interactive slide presentation deck with 8 comprehensive slides:
   - Slide 1: Challenge & Executive Problem Statement.
   - Slide 2: SetuHealth Innovation & Solution Architecture.
   - Slide 3: Multi-Modal OCR & Entity Intelligence Pipeline.
   - Slide 4: Plain-Language & Multilingual Translation Engine.
   - Slide 5: Longitudinal Timeline & Vital Trend Analytics.
   - Slide 6: ABDM / ABHA Interoperability & FHIR R4 Compliance.
   - Slide 7: Technical Stack, Security & Deployment (Vercel + Render + Supabase).
   - Slide 8: Business Impact, Future Roadmap & Altrix Labs Alignment.
3. Includes an interactive **Architecture Diagram Visualizer** with live component breakdown.
