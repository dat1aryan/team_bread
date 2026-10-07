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
  ChevronDown,
  Lock,
  CheckCircle2
} from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onOpenAuth,
  isAuthenticated,
  userName
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-white border-b border-slate-200/80">
      
      {/* Background Radial Ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-teal-50/70 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 2-Column Grid (Inspired by Alethea Medical) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, Narrative & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>AI-Powered Personal Health Copilot & ABDM Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
              Healthcare Jargon, <span className="italic font-serif text-teal-800">Accelerated</span> to Human Understanding.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Transform complex Indian lab reports and handwritten prescriptions into plain-language clinical insights, drug-collision safety checks, and official ABDM FHIR R4 records.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span>Launch Health Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{isAuthenticated ? (userName ? `Account (${userName.split(' ')[0]})` : 'My Account') : 'Sign In with Supabase'}</span>
              </button>
            </div>

            {/* Privacy & Compliance Assurance */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ABDM / ABHA FHIR R4 Standard</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>100% Patient Privacy Guard</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Multi-Key AI Failover</span>
              </div>
            </div>

          </div>

          {/* Right Column: Alethea-Style Interactive Mockup & Floating Dialogue Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md w-full">
              
              {/* Floating Specialist Card (Top-Left) */}
              <div className="hidden sm:flex absolute -top-6 -left-6 z-20 items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl max-w-xs animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0 font-bold text-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs text-slate-900">Dr. Sunita Rao, MD</div>
                  <div className="text-[10px] text-teal-700 font-medium">Consultant Endocrinologist</div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    “HbA1c of 7.4% calls for post-meal walking and Metformin 500mg adherence.”
                  </p>
                </div>
              </div>

              {/* Main Core Preview Card */}
              <div className="relative z-10 rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-2xl border border-slate-800 space-y-4">
                
                {/* Header of Preview */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 p-1 flex items-center justify-center">
                      <img src="/brand/favicon.png" alt="Setu" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-tight text-white">Live Clinical Scan</div>
                      <div className="text-[10px] text-slate-400">Dr. Lal PathLabs • Saket Central</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                    AI Analyzed
                  </span>
                </div>

                {/* Biomarker Pill Highlights */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">HbA1c Glycated Hemoglobin</div>
                      <div className="text-[10px] text-slate-400">Standard Target: &lt; 7.0%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-400">7.4%</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300">High</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">Fasting Blood Sugar (FBS)</div>
                      <div className="text-[10px] text-slate-400">Normal Range: 70 - 100 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-rose-400">162 mg/dL</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300">Elevated</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-300">LDL Bad Cholesterol</div>
                      <div className="text-[10px] text-slate-400">Optimal Target: &lt; 100 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300">148 mg/dL</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Borderline</span>
                    </div>
                  </div>
                </div>

                {/* Rx Summary */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Pill className="w-3.5 h-3.5 text-teal-400" /> Metformin 500mg, Telmisartan 40mg
                  </span>
                  <span className="text-emerald-400 font-semibold">2 Meds Synced</span>
                </div>

              </div>

              {/* Floating Drug Safety Watchdog Card (Bottom-Right) */}
              <div className="hidden sm:flex absolute -bottom-6 -right-6 z-20 items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        {/* Numbers & Impact Strip (Alethea "By the numbers" pattern) */}
        <div className="pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">&lt; 3 Sec</div>
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
              <div className="text-2xl sm:text-3xl font-black text-slate-900">Zero Data Sale</div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                Patient-first confidential storage with Supabase RLS
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
