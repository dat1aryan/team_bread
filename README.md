# Setu AI Copilot (सेतु)
### AI-Powered Personal Health Copilot • Bridging Medical Jargon to Human Understanding
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  
**Round**: Round 1 — 24-Hour Campus Hackathon  
**Problem Statement**: AI-Powered Personal Health Copilot  

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdat1aryan%2Fteam_bread)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/dat1aryan/team_bread)

---

## 🌟 Executive Overview
Healthcare information is dangerously fragmented across handwritten doctor prescriptions, multi-page pathology lab slips, and discharge summaries. Over **78% of patients** cannot interpret cryptic lab reference ranges, missing vital windows for chronic disease intervention.

**Setu AI Copilot** is an intelligent, compassionate digital health companion that:
1. **Ingests & Scans Any Medical Record**: Prescriptions, blood tests, radiology reports, and hospital discharge summaries via multi-modal OCR.
2. **Translates Jargon into 8th-Grade Plain Language**: Explains what test results mean, why abnormal values matter, and generates personalized questions to ask the doctor.
3. **Unifies the Patient Health Journey**: Visual chronological timeline with interactive longitudinal vital trend tracking (HbA1c, Blood Sugar, LDL Cholesterol, Blood Pressure).
4. **Supports Regional Indian Languages & Voice**: Full real-time translation in **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Tamil (தமிழ்)**, **Bengali (বাংলা)**, and **Marathi (मराठी)** with voice Text-to-Speech (TTS).
5. **ABDM / ABHA Digital Public Infrastructure Ready**: Mapped to **HL7 FHIR R4** (`Bundle`, `DiagnosticReport`, `Observation`, `MedicationRequest`, `Patient`) with mock **14-digit ABHA ID** linking and 1-click FHIR JSON export.

---

## 🏗️ Production Architecture

```
   [User Browser / Patient / Doctor]
                  │
                  ▼
      ┌─────────────────────────┐
      │   FRONTEND (Vercel)     │  ◄── Next.js 14 App Router
      │   team-bread.vercel.app│      TypeScript + Tailwind CSS
      └───────────┬─────────────┘
                  │  REST API Calls
                  ├───────────────────────────────┐
                  ▼                               ▼
      ┌─────────────────────────┐     ┌─────────────────────────┐
      │   BACKEND (Render)      │     │  DATABASE (Supabase)    │
      │   Node/Express API      │     │  PostgreSQL + RLS       │
      │   setu-api.onrender.com │     │  Encrypted Storage S3   │
      └───────────┬─────────────┘     └─────────────────────────┘
                  │
                  ▼
      ┌─────────────────────────┐
      │  AI ENGINE (Google)     │
      │  Gemini 1.5 Flash Vision│
      └─────────────────────────┘
```

- **Frontend on Vercel**: High-performance edge deployment, responsive UI, glassmorphic cards, Recharts data visualizer, and built-in interactive judge slides.
- **Backend on Render**: Express.js microservice (`/backend`), Dockerfile, and Render Blueprint (`render.yaml`) handling multi-modal Gemini Vision API and `/health` checks.
- **Database on Supabase**: PostgreSQL with Row-Level Security (RLS), S3-compatible encrypted medical storage bucket, and resilient client-side demo fallback.
- **AI & OCR Engine**: Google Gemini 1.5 Flash Multimodal Vision API + in-browser Tesseract.js OCR with Canvas image enhancement.

---

## 🎯 Hackathon Criteria Alignment (100 Points + Bonus)

| Criterion | Weight | How Setu Excels |
| :--- | :---: | :--- |
| **AI Utilization** | **35%** | Multi-modal OCR extraction of medicines, dosages, test values, and diagnoses. Plain-language summaries with "Why It Matters" physiological breakdown, abnormal value flagging, and doctor prep questions. |
| **Technical Architecture** | **25%** | Clean microservice separation (Vercel frontend + Render backend + Supabase DB + Gemini AI), clean data pipeline, and ABDM HL7 FHIR R4 standard schema compliance. |
| **User Experience (UX)** | **20%** | Ultra-intuitive drag-and-drop ingestion, 1-click sample test bench (no files needed for judges!), interactive health timeline, and dynamic Recharts vital charts. |
| **Healthcare Impact** | **10%** | Clinical triage severity flags (Routine / Consult Soon / Urgent), drug-drug interaction safety checks, and medical disclaimer guardrails. |
| **Presentation & Demo** | **10%** | Built-in interactive 8-slide presentation deck modal and system architecture visualizer right inside the app! |
| **Bonus 1: Regional Languages** | **+5%** | Native Hindi, Telugu, Tamil, Bengali, Marathi translation + Web Speech API voice read-aloud. |
| **Bonus 2: ABDM / ABHA Readiness** | **+5%** | Mock ABHA ID linking, OTP verification flow, verified digital health QR card, and downloadable FHIR R4 JSON bundles. |

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/Setu.git
cd Setu

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Configure your keys in `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

> **Note on Zero-Config Demo Mode**: Even without Supabase or Gemini keys populated, Setu includes a **Built-in Resilient Clinical State Engine**. Evaluators can test 100% of the features immediately!

### 3. Start Frontend & Backend
```bash
# Terminal 1: Start Frontend (Next.js)
npm run dev
# Live at http://localhost:3000

# Terminal 2: Start Backend (Render Service)
cd backend
npm run dev
# Live at http://localhost:5000 (Health check: http://localhost:5000/health)
```

---

## 🌐 Cloud Deployment Instructions

### A. Deploy Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Add Environment Variables: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.
4. Click **Deploy**. Live in 60 seconds!

### B. Deploy Backend on Render
1. Open [Render Dashboard](https://dashboard.render.com) -> **New +** -> **Blueprint**.
2. Select repository (`render.yaml` auto-detects `setu-health-backend`).
3. Add `GEMINI_API_KEY` and click **Apply**.
4. Health check URL: `https://your-backend.onrender.com/health`.

### C. Database Migration on Supabase
1. Create a project at [Supabase](https://supabase.com).
2. Open **SQL Editor**, paste contents of [`supabase_schema.sql`](file:///c:/Users/aryan/Downloads/Setu/supabase_schema.sql), and click **Run**.
3. Copy **Project URL** and **anon key** to Vercel/Render.

---

## 📚 Complete Project Documentation
Comprehensive documentation matching the hackathon rulebook and standard engineering practices:
- [01. Product Requirements Document (PRD)](file:///c:/Users/aryan/Downloads/Setu/Documentation/01_PRD_Setu_Copilot.md)
- [02. Technical Requirements Document (TRD)](file:///c:/Users/aryan/Downloads/Setu/Documentation/02_TRD_Technical_Architecture.md)
- [03. App Flow & User Journey Map](file:///c:/Users/aryan/Downloads/Setu/Documentation/03_App_Flow_and_User_Journeys.md)
- [04. UI/UX Design System Guide](file:///c:/Users/aryan/Downloads/Setu/Documentation/04_UI_UX_Design_System.md)
- [05. Backend Schema & ABDM FHIR Models](file:///c:/Users/aryan/Downloads/Setu/Documentation/05_Backend_Schema_and_ABDM_FHIR_Models.md)
- [06. Implementation & Deployment Guide](file:///c:/Users/aryan/Downloads/Setu/Documentation/06_Implementation_Testing_and_Deployment_Guide.md)
- [07. Architecture Diagrams & Pitch Deck](file:///c:/Users/aryan/Downloads/Setu/Documentation/07_Architecture_and_Presentation_Deck.md)
- [Deployment Step-by-Step Guide](file:///c:/Users/aryan/Downloads/Setu/DEPLOYMENT_GUIDE.md)

---

## 🛡️ Clinical & Safety Disclaimer
*Setu AI Copilot is an educational and digital interoperability assistant. It does not provide medical diagnoses or replace consultations with licensed healthcare practitioners.*
