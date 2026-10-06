# 06. Implementation, Testing & Deployment Guide
## Project Name: SetuHealth AI Copilot (सेतु हेल्थ)
**Setup Instructions, Environment Variables, Vercel, Render & Supabase Deployment**  
**Hackathon**: HacXLerate 2026 (byteXL & Altrix Labs)  

---

## 1. Quick Local Development Setup

### Prerequisites
- Node.js version 18.x or 20.x+ (tested on Node v20/v24)
- npm version 9.x or 10.x+
- Git

### Installation Steps
```bash
# 1. Clone or navigate to the project directory
cd Setu

# 2. Install dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env.local

# 4. Start the development server
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the live copilot dashboard.

---

## 2. Environment Variables Configuration

Create a `.env.local` file in the root directory:

```env
# ==========================================
# 1. Supabase Cloud Configuration (Optional / Live Mode)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ==========================================
# 2. AI Intelligence (Google Gemini Vision & LLM)
# ==========================================
GEMINI_API_KEY=your-gemini-api-key-here

# ==========================================
# 3. Application Host & Port
# ==========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

> **Note on Zero-Config Demo Mode**:  
> If Supabase or Gemini keys are omitted, SetuHealth automatically engages its **Built-In Resilient Simulation & Local Persistence Engine**. Evaluators and judges can test all features (OCR scanning, multi-language translation, timeline charting, ABHA linking, FHIR exports) with zero configuration.

---

## 3. Supabase Cloud Database Provisioning

1. Log in to [Supabase Console](https://app.supabase.com) and create a new project (e.g. `setu-health-copilot`).
2. Navigate to the **SQL Editor** tab in the Supabase Dashboard.
3. Open `Documentation/05_Backend_Schema_and_ABDM_FHIR_Models.md` or copy the contents of `supabase_schema.sql` located in the root repository.
4. Execute the SQL script. This creates:
   - `profiles`, `abha_profiles`, `documents`, `medications`, `lab_observations`, and `timeline_events`.
   - Enables Row-Level Security (RLS) on all tables.
   - Installs default indexes on `user_id` and `created_at`.
5. Under **Storage**, create a new bucket named `medical-records` with public/authenticated read permissions for patient report storage.
6. Copy your **Project URL** and **anon/public API key** from *Settings -> API* into your `.env.local` or deployment platform settings.

---

## 4. Deployment to Vercel (Recommended Frontend / Fullstack)

Vercel provides instant worldwide CDN delivery and serverless edge compute for Next.js:

### Option A: Via Vercel Web Dashboard (1-Click Git Connect)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete SetuHealth AI Copilot with documentation & deployment"
   git push origin main
   ```
2. Open [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository (`Setu`).
4. Framework Preset will auto-detect as **Next.js**.
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (optional)
6. Click **Deploy**. Your application will be live at `https://setu-health-copilot.vercel.app` in under 90 seconds!

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 5. Deployment to Render (Web Service / Docker)

Render is ideal for persistent Node.js servers, custom background queues, or Dockerized services.

### Option A: Using `render.yaml` (Blueprint Deployment)
The repository includes a root `render.yaml` specification:
```yaml
services:
  - type: web
    name: setu-health-copilot
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_SUPABASE_URL
        sync: false
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
```
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and provision the Web Service automatically.

### Option B: Manual Web Service Setup
1. Create a **New Web Service** on Render.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Environment: `Node 20+`
5. Configure Environment Variables in the Render dashboard.

---

## 6. End-to-End Testing & Verification Checklist

| Test Item | Verification Procedure | Expected Outcome |
| :--- | :--- | :--- |
| **1-Click Demo Mode** | Click *"Quick Demo Access"* on the landing page | Instantly routes to pre-populated patient dashboard with active medications and abnormal vitals. |
| **OCR Document Upload** | Upload sample lab report or click *"Test Sample 1: Diabetic Panel"* | High-precision extraction of Glucose, HbA1c, Cholesterol; abnormal flags highlighted in amber/red. |
| **Plain Language Summary** | Inspect the AI summary card on the extraction view | Clear 8th-grade explanation, "Why it matters" narrative, and clinical triage indicator. |
| **Multilingual Engine** | Switch language to हिन्दी (Hindi) or తెలుగు (Telugu) | Complete medical explanation and bullet points transform into natural regional language. |
| **Voice Audio Playback** | Click *"बोलकर सुनाएं (Read Aloud)"* | Browser speech synthesizer pronounces the medical explanation aloud in native accent. |
| **Vital Trends Chart** | Navigate to *"Vital Trends"* tab and toggle HbA1c/Glucose | Dynamic Recharts graph displays historical progression with target threshold guidelines. |
| **ABDM / ABHA Link** | Enter mock ABHA ID `91-2048-5892-1144` and click *"Verify"* | Displays verified ABDM badge and allows 1-click download of compliant HL7 FHIR R4 JSON bundle. |
| **Interactive Pitch Deck** | Click *"Judges / Demo Deck"* in navigation | Full interactive 8-slide presentation launches with navigation controls. |
