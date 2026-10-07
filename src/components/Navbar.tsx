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
  onOpenProfile: () => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
  isAbhaVerified: boolean;
  onResetDemo: () => void;
  patientName?: string;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenProfile,
  onSignOut,
  onOpenAuth,
  isAbhaVerified,
  onResetDemo,
  patientName = 'Rajesh Kumar',
  isAuthenticated = false
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setProfileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors border border-slate-200 cursor-pointer"
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
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer ${
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

          {/* User Profile Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-all cursor-pointer"
              title="User Profile & Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center">
                {patientName.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <span className="hidden md:inline text-slate-800">{patientName}</span>
              <UserCheck className="w-4 h-4 text-slate-500" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                {/* User Identity Header */}
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{patientName}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {isAuthenticated ? 'Authenticated Account' : 'Demo Patient Active'}
                  </div>
                </div>

                {/* Option 1: My Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-900 hover:bg-teal-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>My Profile</span>
                </button>

                {/* Option 2: Sign Off */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <span>Sign Off</span>
                </button>

                {/* Account / Demo Controls */}
                <div className="border-t border-slate-100 my-1 pt-1">
                  {!isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Sign In / Create Account</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onResetDemo();
                    }}
                    className="w-full text-left px-4 py-1.5 text-[11px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Reset Demo Data</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
