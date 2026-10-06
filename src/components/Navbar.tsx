'use client';

// ========================================================================
// SetuHealth AI Copilot - Navigation Header Component
// ========================================================================

import React, { useState } from 'react';
import { 
  HeartPulse, 
  Languages, 
  ShieldCheck, 
  Presentation, 
  Network, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '@/lib/multilingual';
import { HealthStorageService } from '@/lib/storage';

interface NavbarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenDeck: () => void;
  onOpenArchitecture: () => void;
  onOpenAuth: () => void;
  isAbhaVerified: boolean;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenDeck,
  onOpenArchitecture,
  onOpenAuth,
  isAbhaVerified,
  onResetDemo
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">SetuHealth</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                सेतु AI Copilot
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* ABHA Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAbhaVerified ? 'ABHA Linked' : 'ABHA Ready'}</span>
          </div>

          {/* Regional Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors border border-slate-200"
              title="Change Language"
            >
              <Languages className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline font-semibold">
                {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeLabel}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-teal-50 hover:text-teal-900 transition-colors ${
                      currentLanguage === lang.code ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.nativeLabel}</span>
                    <span className="text-xs text-slate-400">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Architecture Diagram Trigger */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium transition-colors border border-indigo-200"
            title="System Architecture Blueprint"
          >
            <Network className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">Architecture</span>
          </button>

          {/* Hackathon Presentation Slides Trigger */}
          <button
            onClick={onOpenDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            title="Presentation Slides for Judges"
          >
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">Judges Deck</span>
          </button>

          {/* Quick Demo Reset / Auth Trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
            title="Account & Auth Settings"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
          </button>
        </div>

      </div>
    </header>
  );
};
