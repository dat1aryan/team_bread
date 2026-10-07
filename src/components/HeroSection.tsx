'use client';

import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Pill, 
  Bot, 
  Sparkles, 
  Stethoscope, 
  CheckCircle2,
  Globe2
} from 'lucide-react';

interface HeroSectionProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onGoToDashboard?: () => void;
  isAuthenticated: boolean;
  userName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenSignIn,
  onOpenSignUp,
  onGoToDashboard,
  isAuthenticated,
  userName
}) => {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-14 sm:pb-24 bg-white">
      
      {/* Background Radial Ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-teal-50/60 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Narrative & Primary Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-[1.12]">
              Healthcare Jargon, <span className="italic font-serif text-teal-800">Accelerated</span> to Human Understanding.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Transform complex diagnostic lab reports and handwritten prescriptions into plain-language clinical insights, real-time drug collision checks, and encrypted health records.
            </p>

            {/* Single Primary CTA */}
            <div className="pt-2">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={onGoToDashboard}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span>Launch My Health Workspace</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Signed In as {userName || 'Patient'}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSignUp}
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Live Clinical Showcase Card Flanked by Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            <div className="relative w-full max-w-md">
              
              {/* Floating Doctor Consultation Card (Top-Left) */}
              <div className="hidden sm:flex absolute -top-5 -left-5 z-20 items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xl max-w-xs animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 font-bold text-xs">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">Dr. Sunita Rao, MD</div>
                  <div className="text-[10px] text-slate-500">Endocrinology • Verified Triage</div>
                  <div className="text-[10px] text-teal-700 font-semibold mt-0.5">“Action plan validated”</div>
                </div>
              </div>

              {/* Central Clinical Decision Showcase Box */}
              <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl border border-slate-800 space-y-4 text-left transition-all hover:border-slate-700">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Clinical Analysis
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    FHIR R4 DiagnosticReport
                  </span>
                </div>

                {/* Patient Case Snapshot */}
                <div>
                  <div className="text-xs text-slate-400">Biomarker Triage Snapshot</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Metabolic & Cardiovascular Panel
                  </div>
                </div>

                {/* Real-time Extracted Vitals */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">HbA1c (Glycated Hemoglobin)</div>
                      <div className="text-[10px] text-slate-400">Target: &lt; 5.7%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-400">7.4%</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300">High</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">Fasting Blood Sugar (FBS)</div>
                      <div className="text-[10px] text-slate-400">Normal: 70 - 100 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-400">162 mg/dL</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300">Elevated</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">LDL Bad Cholesterol</div>
                      <div className="text-[10px] text-slate-400">Optimal: &lt; 100 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300">148 mg/dL</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Borderline</span>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Insight Strip */}
                <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/50 text-[11px] text-teal-200 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <span className="font-semibold text-white">Summary:</span> Blood sugar is elevated. Maintain current prescription schedule and consult your physician.
                  </p>
                </div>

                {/* Rx Summary */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Pill className="w-3.5 h-3.5 text-teal-400" /> Metformin 500mg, Telmisartan 40mg
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>0 Collisions</span>
                  </span>
                </div>

              </div>

              {/* Floating Drug Safety Watchdog Card (Bottom-Right) */}
              <div className="hidden sm:flex absolute -bottom-5 -right-5 z-20 items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">Drug Collision Watchdog</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Cardiometabolic Protocol</div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    “No pharmacokinetic collisions found between Metformin & Telmisartan.”
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Numbers & Impact Strip */}
        <div className="pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">&lt; 1.5 Sec</div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                Instant OCR prescription & lab report extraction
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                HL7 FHIR R4 standard JSON export interoperability
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">6 Languages</div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                Hindi, Telugu, Tamil, Bengali, Marathi & Spanish
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">Private & Secure</div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                Patient-first confidential storage with Supabase RLS
              </div>
            </div>

          </div>
        </div>

        {/* Core Capabilities Grid */}
        <div className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Clinical Intelligence Built for Patients & Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Setu connects raw hospital scans, digital health records, and medical jargon into actionable understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800">
                <FileText className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Multimodal Vision OCR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload photos of handwritten doctor prescriptions, diagnostic blood work, or discharge summaries. Setu structures every medication and biomarker into FHIR R4 standard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <Pill className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Drug Collision Watchdog</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Proactively detects hazardous drug-drug interactions across multiple doctors and prescriptions, alerting patients to dangerous contraindications before consumption.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800">
                <Globe2 className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Multilingual AI Copilot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions about your health, lab numbers, and medications in your preferred Indian language. Explains clinical context in simple, compassionate words.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Call to Action Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Take Control of Your Health Journey Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              Sign up in seconds, configure your profile, and start transforming complex health records into plain understanding.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Go to Workspace
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSignUp}
                className="px-7 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Create Free Account
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
