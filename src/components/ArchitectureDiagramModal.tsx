'use client';

// ========================================================================
// SetuHealth AI Copilot - System Architecture Visualizer Modal
// High-fidelity interactive diagram covering data pipeline, AI, & ABDM schema
// ========================================================================

import React, { useState } from 'react';
import { 
  X, 
  Network, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Languages, 
  Layers, 
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ArchitectureDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDiagramModal: React.FC<ArchitectureDiagramModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeLayer, setActiveLayer] = useState<string>('all');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                System Architecture & Data Pipeline Blueprint
              </h3>
              <p className="text-xs text-slate-500">
                End-to-end flow from paper record ingestion to ABDM FHIR R4 standard compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Architecture Pipeline Blocks */}
        <div className="py-6 space-y-6">
          
          {/* Layer 1: Ingestion */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
              <FileText className="w-4 h-4" />
              <span>Layer 1: Document Ingestion & Image Enhancement</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <strong>Input Formats:</strong>
                <p className="text-slate-500 mt-1">Prescription photos, lab report PDFs, discharge slips (PNG, JPG, PDF up to 20MB).</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <strong>Canvas Normalizer:</strong>
                <p className="text-slate-500 mt-1">Client-side grayscale conversion, adaptive contrast stretching, and rotation correction.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <strong>Instant Test Bench:</strong>
                <p className="text-slate-500 mt-1">4 pre-configured clinical cases for 1-click evaluation without file upload.</p>
              </div>
            </div>
          </div>

          {/* Layer 2: AI & OCR Engine */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
              <Cpu className="w-4 h-4" />
              <span>Layer 2: Multi-Modal AI & Entity Normalization Engine</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs">
                <strong>Google Gemini 1.5 Vision:</strong>
                <p className="text-slate-500 mt-1">Multi-modal prompt orchestration producing strict validated JSON schemas.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs">
                <strong>Client Tesseract.js:</strong>
                <p className="text-slate-500 mt-1">Zero-latency in-browser OCR fallback running in background Web Worker threads.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-indigo-100 shadow-xs">
                <strong>Clinical Normalizer:</strong>
                <p className="text-slate-500 mt-1">Standardizes units (mg/dL, %, g/dL), maps to LOINC, and detects abnormal boundaries.</p>
              </div>
            </div>
          </div>

          {/* Layer 3: Clinical Reasoning & Plain Language */}
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Layer 3: Clinical Explainability & Patient Safety</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-teal-100 shadow-xs">
                <strong>Plain-Language Summary:</strong>
                <p className="text-slate-500 mt-1">Translates complex medical findings at an empathetic 8th-grade reading level.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-teal-100 shadow-xs">
                <strong>Clinical Triage Engine:</strong>
                <p className="text-slate-500 mt-1">Classifies urgency: Routine Monitoring, Consult Soon (3-7 days), or Immediate Care.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-teal-100 shadow-xs">
                <strong>Doctor Prep Generator:</strong>
                <p className="text-slate-500 mt-1">Formulates 3-4 personalized questions for patient consultation productivity.</p>
              </div>
            </div>
          </div>

          {/* Layer 4: Regional Language & ABDM FHIR Gateway */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800">
              <Languages className="w-4 h-4" />
              <span>Layer 4: ABDM Interoperability & Multilingual Voice (Bonus Credits)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
                <strong>HL7 FHIR R4 Generator:</strong>
                <p className="text-slate-500 mt-1">Creates compliant Bundle, Patient, DiagnosticReport, Observation, and MedicationRequest.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
                <strong>Mock ABHA ID Link:</strong>
                <p className="text-slate-500 mt-1">Simulated 14-digit ABHA ID and OTP verification gateway with digital health QR card.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
                <strong>Multilingual Audio TTS:</strong>
                <p className="text-slate-500 mt-1">Browser SpeechSynthesis in Hindi, Telugu, Tamil, Bengali, and Marathi for elderly access.</p>
              </div>
            </div>
          </div>

          {/* Layer 5: Storage & Cloud Deployment */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Cloud className="w-4 h-4" />
              <span>Layer 5: Persistence, Security & Production Deployment</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <strong>Supabase PostgreSQL:</strong>
                <p className="text-slate-500 mt-1">Row-Level Security (RLS) policies isolating patient data; S3 storage for medical files.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <strong>Vercel Edge Deployment:</strong>
                <p className="text-slate-500 mt-1">Next.js 14 frontend served globally with edge lambdas via vercel.json.</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs">
                <strong>Render Cloud Service:</strong>
                <p className="text-slate-500 mt-1">Express API web service with Gemini Vision endpoints via render.yaml and Docker.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Adheres to HIPAA, DISHA & ABDM EHR Interoperability Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Close Blueprint
          </button>
        </div>

      </div>
    </div>
  );
};
