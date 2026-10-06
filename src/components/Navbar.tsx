'use client';

import React, { useState } from 'react';
import { 
  HeartPulse, 
  Languages, 
  ShieldCheck, 
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
  onOpenAuth: () => void;
  isAbhaVerified: boolean;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenAuth,
  isAbhaVerified,
  onResetDemo
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          title="Setu | AI-Powered Personal Health Copilot"
        >
          <img
            src="/brand/favicon.png"
            alt="Setu Logo"
            className="w-10 h-10 object-contain rounded-xl transition-transform group-hover:scale-105"
            title="Setu | AI-Powered Personal Health Copilot"
          />
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="font-extrabold text-xl tracking-tight text-slate-900"
                title="Setu | AI-Powered Personal Health Copilot"
              >
                Setu
              </span>
            </div>
            <p 
              className="text-xs text-slate-500 hidden sm:block"
              title="Setu | AI-Powered Personal Health Copilot"
            >
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
