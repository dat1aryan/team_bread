'use client';

import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  UserCheck,
  KeyRound
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { HealthStorageService } from '@/lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onResetData
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickDemoLogin = () => {
    setStatusMsg('Logged in as verified demo patient: Rajesh Kumar (ABHA: 91-2048-5892-1144)');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSupabaseAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      setStatusMsg('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setStatusMsg('Supabase credentials not configured in .env.local. Active in Zero-Config Demo Mode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (res.error) {
        setStatusMsg(`Auth error: ${res.error.message}`);
      } else {
        setStatusMsg('Authentication successful! Profile synchronized.');
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      setStatusMsg(`Authentication failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">Patient Auth & Demo Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Judge Access (Recommended) */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-teal-900 uppercase">
              Quick Demo Access
            </span>
          </div>
          <p className="text-xs text-teal-800">
            Instantly access the full copilot with preloaded clinical profiles, timeline records, and ABHA links without signing up.
          </p>
          <button
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continue as Demo Patient (Rajesh Kumar)</span>
          </button>
        </div>

        {/* Supabase Cloud Connection Indicator */}
        <div className="text-xs p-3 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-slate-700 font-medium">
              Database: {isSupabaseConfigured ? 'Supabase Cloud (PostgreSQL RLS)' : 'Local State Engine (Active)'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {isSupabaseConfigured ? 'ONLINE' : 'STANDALONE'}
          </span>
        </div>

        {/* Standard Email / Password Fields */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700">Patient Email</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="rajesh.kumar@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {statusMsg && (
            <div className="text-xs p-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              {statusMsg}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleSupabaseAuth(false)}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleSupabaseAuth(true)}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Reset Demo State Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Want to start fresh?</span>
          <button
            onClick={() => {
              onResetData();
              setStatusMsg('Reset data to initial sample states.');
            }}
            className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>
        </div>

      </div>
    </div>
  );
};
