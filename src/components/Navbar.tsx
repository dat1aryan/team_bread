'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HeartPulse, 
  Languages, 
  ShieldCheck, 
  UserCheck, 
  RotateCcw, 
  Sparkles, 
  ExternalLink,
  LayoutDashboard,
  Home,
  ArrowRight
} from 'lucide-react';
import { LanguageCode } from '@/types';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '@/lib/multilingual';
import { HealthStorageService } from '@/lib/storage';

interface NavbarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  isAbhaVerified: boolean;
  patientName?: string;
  patientEmail?: string;
  isAuthenticated?: boolean;
  activeRoute?: 'home' | 'dashboard';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenProfile,
  onSignOut,
  onOpenAuth,
  isAbhaVerified,
  patientName = 'Patient',
  patientEmail,
  isAuthenticated = false,
  activeRoute = 'home'
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title with Route to Home */}
        <Link 
          href="/"
          className="flex items-center gap-3 cursor-pointer group text-inherit no-underline"
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
        </Link>

        {/* Action Controls & Navigation Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Navigation Links between Home and Dashboard */}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 mr-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeRoute === 'home'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeRoute === 'dashboard'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-700" />
                <span>Dashboard</span>
              </Link>
            </div>
          )}

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

          {/* Conditional Controls: Sign In / Sign Up when unauthenticated, User Profile when authenticated */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3 sm:px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          ) : (
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
                  {patientName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <span className="hidden md:inline text-slate-800">{patientName}</span>
                <UserCheck className="w-4 h-4 text-slate-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  {/* User Identity Header */}
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{patientName}</div>
                    <div className="text-[10px] text-teal-700 font-semibold truncate">
                      {patientEmail || 'Authenticated Patient'}
                    </div>
                  </div>

                  {/* Option 1: Dashboard Workspace */}
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-900 hover:bg-teal-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-teal-600" />
                    <span>Dashboard Workspace</span>
                  </Link>

                  {/* Option 2: Landing Page */}
                  <Link
                    href="/"
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-900 hover:bg-teal-50 flex items-center gap-2.5 transition-colors"
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>Home & Features</span>
                  </Link>

                  {/* Option 3: My Profile */}
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

                  <div className="border-t border-slate-100 my-1" />

                  {/* Option 4: Sign Off */}
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
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
