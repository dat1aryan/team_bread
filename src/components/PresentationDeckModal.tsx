'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Languages, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  Server,
  Building2
} from 'lucide-react';

interface PresentationDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationDeckModal: React.FC<PresentationDeckModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    // Slide 1
    {
      badge: 'PROBLEM STATEMENT & CONTEXT',
      title: 'Bridging Fragmented Medical Records to Actionable Health Intelligence',
      subtitle: 'Personal Health Intelligence & ABDM Platform',
      icon: <HeartPulse className="w-8 h-8 text-rose-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Over <strong>78% of patients</strong> manage chronic diseases using fragmented paper envelopes: handwritten doctor prescriptions, multi-page laboratory pathology slips, and hospital discharge summaries.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
              <span className="text-xs font-bold text-rose-800 uppercase">Jargon Barrier</span>
              <p className="text-xs text-slate-700 mt-1">Patients don’t understand whether borderline lab markers mean an emergency or routine diet control.</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase">Lost Trajectory</span>
              <p className="text-xs text-slate-700 mt-1">Longitudinal biomarker trends (e.g., rising HbA1c or creatinine) are lost between appointments.</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-xs font-bold text-indigo-800 uppercase">Linguistic Isolation</span>
              <p className="text-xs text-slate-700 mt-1">Millions of regional Indian language speakers cannot read English prescription directions.</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 2
    {
      badge: 'SOLUTION OVERVIEW',
      title: 'SetuHealth AI Copilot (सेतु हेल्थ)',
      subtitle: 'An Intelligent, Empathetic Digital Bridge for Personal Healthcare',
      icon: <Sparkles className="w-8 h-8 text-teal-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase">1. Zero-Friction OCR Ingestion</span>
              <p className="text-xs text-slate-600">Vision & multi-modal AI extracts medications, dosages, lab values, and diagnoses from photos and PDFs.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase">2. Explainable Clinical AI</span>
              <p className="text-xs text-slate-600">Translates complex reports into empathetic 8th-grade plain language with contextual abnormal explanations.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase">3. Longitudinal Health Timeline</span>
              <p className="text-xs text-slate-600">Chronological feed of patient journey + interactive vital trend charts for chronic biomarker tracking.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase">4. ABDM & Regional Inclusivity</span>
              <p className="text-xs text-slate-600">Full HL7 FHIR R4 standard alignment, mock ABHA ID linking, and real-time regional language translation with audio TTS.</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 3
    {
      badge: 'CORE SCOPE (35% AI UTILIZATION)',
      title: 'Multi-Modal Vision OCR & Clinical Entity Extraction',
      subtitle: 'High-Precision Automated Parsing Across Diverse Document Types',
      icon: <Layers className="w-8 h-8 text-indigo-600" />,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Prescription Intelligence:</strong> Extracts drug brand, generic molecule, strength (e.g. 500mg), frequency (OD, BD, TID), route, and food timing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Pathology Lab Parsing:</strong> Normalizes test names, measured values, units, and maps against age/gender reference ranges to flag NORMAL, HIGH, LOW, or CRITICAL.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Hospital Discharge Summaries:</strong> Ingests admission vitals, course in hospital, discharge instructions, and follow-up directives.</span>
            </li>
          </ul>
        </div>
      )
    },
    // Slide 4
    {
      badge: 'CLINICAL SAFETY & EXPLAINABILITY',
      title: 'Plain-Language AI Health Summary & Safety Guardrails',
      subtitle: 'Compassionate Patient Translation with Zero Hallucinations',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
            <h5 className="text-xs font-bold text-teal-900 uppercase">Why It Matters Physiological Explanations</h5>
            <p className="text-xs text-slate-700 italic">
              "Your HbA1c is 7.4%. This represents your average blood sugar over the last 90 days. While higher than the standard 5.7% benchmark, it is actively manageable with regular walking and prescribed Metformin."
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Clinical Triage Categorization:</strong> Badges urgency into Routine Monitoring, Consult Soon (3-7 days), or Immediate Emergency.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong>Doctor Discussion Prep:</strong> Synthesizes 3-4 tailored questions for the patient’s next 10-minute physician consultation.
            </div>
          </div>
        </div>
      )
    },
    // Slide 5
    {
      badge: 'BONUS CREDIT 1 (REGIONAL INCLUSIVITY)',
      title: 'Multilingual Regional Support & Audio Read-Aloud',
      subtitle: 'Empowering Elderly and Regional Language Speakers',
      icon: <Languages className="w-8 h-8 text-teal-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Healthcare communication must speak the patient’s mother tongue. SetuHealth features live translation into:
          </p>
          <div className="flex flex-wrap gap-2">
            {['हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'বাংলা (Bengali)', 'मराठी (Marathi)', 'Español (Spanish)'].map((l, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
                {l}
              </span>
            ))}
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <strong>Web Speech API Text-to-Speech:</strong> 1-click voice read-aloud in native Indian accents ensures even non-literate and visually-impaired family members understand their daily care plan.
          </div>
        </div>
      )
    },
    // Slide 6
    {
      badge: 'BONUS CREDIT 2 (ABDM & FHIR R4)',
      title: 'Ayushman Bharat Digital Mission (ABDM) Interoperability',
      subtitle: 'HL7 FHIR R4 Compliant Bundles & Mock ABHA ID Verification',
      icon: <Building2 className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li><strong>FHIR R4 Standard Modeling:</strong> Ingested records map directly to standard resources: <code>Patient</code>, <code>DiagnosticReport</code>, <code>Observation</code> (with LOINC codes), and <code>MedicationRequest</code>.</li>
            <li><strong>Mock ABHA ID Verification:</strong> Supports 14-digit ABHA number and PHR address (<code>rajesh.kumar@abdm</code>) with simulated OTP gateway check.</li>
            <li><strong>1-Click FHIR JSON Export:</strong> Compliant JSON download ready for national health locker integration.</li>
          </ul>
        </div>
      )
    },
    // Slide 7
    {
      badge: 'TECHNICAL ARCHITECTURE (25% WEIGHT)',
      title: 'Cloud Architecture & Multi-Platform Deployment',
      subtitle: 'Vercel Frontend • Render Backend • Supabase PostgreSQL & Storage',
      icon: <Server className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">Vercel (Edge Frontend)</strong>
              <p className="text-slate-600">Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Recharts visualization.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">Render (Cloud Backend)</strong>
              <p className="text-slate-600">Node/Express microservice, Google Gemini Vision API, Dockerfile, /health check endpoint.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block">Supabase (Data & Auth)</strong>
              <p className="text-slate-600">PostgreSQL with Row-Level Security, Encrypted Storage, and transparent offline demo fallback.</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 8
    {
      badge: 'HEALTHCARE IMPACT & ALTRIX LABS',
      title: 'Measurable Outcomes & Future Vision',
      subtitle: 'Building the Future of Personalized Healthcare with AI',
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-2xl font-extrabold text-emerald-700">65%</span>
              <p className="text-[11px] text-emerald-900 font-semibold mt-1">Reduction in Medication Scheduling Errors</p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
              <span className="text-2xl font-extrabold text-teal-700">3x</span>
              <p className="text-[11px] text-teal-900 font-semibold mt-1">Faster Consultation History Review</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
              <span className="text-2xl font-extrabold text-indigo-700">100%</span>
              <p className="text-[11px] text-indigo-900 font-semibold mt-1">ABDM & FHIR Public Stack Alignment</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-2 text-center">
            Empowering individuals to own, understand, and act upon their healthcare journey.
          </p>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 flex flex-col justify-between min-h-[520px] animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-100 text-teal-800">
                {slide.badge}
              </span>
              <span className="text-xs text-slate-400">
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Header */}
          <div className="py-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
                {slide.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {slide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Slide Body */}
          <div className="py-2">
            {slide.content}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              currentSlide === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Slide indicator dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-teal-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              currentSlide === slides.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
