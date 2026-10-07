'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HeartPulse, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Pill, 
  Activity, 
  Bot, 
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { OpeningSplash } from '@/components/OpeningSplash';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import { OnboardingModal } from '@/components/OnboardingModal';

import { PatientProfile, LanguageCode, MedicalDocument, ExtractedMedication } from '@/types';
import { HealthStorageService } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [patient, setPatient] = useState<PatientProfile>(HealthStorageService.getPatientProfile());
  const [documents, setDocuments] = useState<MedicalDocument[]>(HealthStorageService.getDocuments());
  const [activeMeds, setActiveMeds] = useState<ExtractedMedication[]>(HealthStorageService.getActiveMedications());

  // Modals & Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Synchronize state from storage
  const reloadData = () => {
    setPatient(HealthStorageService.getPatientProfile());
    setDocuments(HealthStorageService.getDocuments());
    setActiveMeds(HealthStorageService.getActiveMedications());
  };

  useEffect(() => {
    reloadData();

    // Listen for live Supabase Auth sessions
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const handleAuthUser = (user: any) => {
        setIsAuthenticated(true);
        const userName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Patient';

        setPatient(prev => ({
          ...prev,
          id: user.id,
          fullName: prev.fullName || userName,
          email: user.email || prev.email,
        }));

        // Fetch persistent profile or check if onboarded
        client
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data && data.is_onboarded) {
              setPatient(prev => {
                const updated: PatientProfile = {
                  ...prev,
                  id: data.id,
                  fullName: data.full_name || userName,
                  email: data.email || user.email || prev.email,
                  phone: data.phone_number || prev.phone,
                  bloodGroup: data.blood_group || prev.bloodGroup,
                  gender: data.gender || prev.gender,
                  dateOfBirth: data.date_of_birth ? data.date_of_birth.toString() : prev.dateOfBirth,
                  emergencyContact: data.emergency_contact || prev.emergencyContact,
                  isOnboarded: true,
                };
                HealthStorageService.savePatientProfile(updated);
                return updated;
              });
              setIsOnboardingOpen(false);
            } else {
              setPatient(prev => ({
                ...prev,
                id: user.id,
                fullName: userName,
                email: user.email || prev.email,
                isOnboarded: false,
              }));
              setIsOnboardingOpen(true);
            }
          });

        // Clean up OAuth query parameters from URL if present
        if (typeof window !== 'undefined' && (window.location.search.includes('code=') || window.location.hash.includes('access_token='))) {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      };

      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleAuthUser(session.user);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          handleAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsOnboardingOpen(false);
          HealthStorageService.resetToDefault();
          setPatient(HealthStorageService.getPatientProfile());
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleOpenAuth = (mode?: 'signin' | 'signup') => {
    setAuthMode(mode || 'signin');
    setIsAuthOpen(true);
  };

  const handleCompleteOnboarding = (completedProfile: PatientProfile) => {
    HealthStorageService.savePatientProfile(completedProfile);
    setPatient(completedProfile);
    setIsOnboardingOpen(false);

    // Sync to Supabase profiles
    if (isSupabaseConfigured && supabase && completedProfile.id) {
      supabase.from('profiles').upsert({
        id: completedProfile.id,
        full_name: completedProfile.fullName,
        email: completedProfile.email,
        date_of_birth: completedProfile.dateOfBirth || null,
        gender: completedProfile.gender || 'male',
        blood_group: completedProfile.bloodGroup || 'B+',
        phone_number: completedProfile.phone,
        emergency_contact: completedProfile.emergencyContact,
        preferred_language: completedProfile.preferredLanguage,
        is_onboarded: true,
        updated_at: new Date().toISOString()
      }).then();
    }

    // Auto-navigate to dashboard once onboarding is complete
    router.push('/dashboard');
  };

  const handleSaveProfile = (updated: PatientProfile) => {
    HealthStorageService.savePatientProfile(updated);
    setPatient(updated);
    reloadData();
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setIsOnboardingOpen(false);
    HealthStorageService.resetToDefault();
    reloadData();
  };

  const totalRecords = documents.length;
  const activeMedCount = activeMeds.filter((m) => m.isActive).length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* 1-Second Opening Animation (Clean Favicon + Title fade) */}
      <OpeningSplash />

      {/* Top Global Navigation Bar with Home/Dashboard navigation */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        onOpenAuth={handleOpenAuth}
        isAbhaVerified={patient.isAbhaVerified}
        patientName={patient.fullName}
        patientEmail={patient.email}
        isAuthenticated={isAuthenticated}
        activeRoute="home"
      />

      {/* Landing View: Alethea Medical Inspired Hero Section */}
      <main className="flex-1">
        <HeroSection 
          onOpenSignIn={() => handleOpenAuth('signin')}
          onOpenSignUp={() => handleOpenAuth('signup')}
          onGoToDashboard={() => router.push('/dashboard')}
          isAuthenticated={isAuthenticated}
          userName={patient.fullName}
        />

        {/* Authenticated Fast-Access Workspace Strip */}
        {isAuthenticated && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 font-extrabold text-xl shrink-0">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold">
                      Welcome Back, {patient.fullName || 'Patient'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                      Cloud Synced
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Your personal health workspace is ready: <span className="text-white font-medium">{totalRecords} records</span>, <span className="text-white font-medium">{activeMedCount} active meds</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  href="/dashboard"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all group"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Global Clinical Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand/favicon.png"
              alt="Setu"
              className="w-5 h-5 object-contain"
            />
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              Setu
            </span>
            <span className="text-slate-400 text-xs font-medium">@2026</span>
          </div>
          <p className="text-xs text-slate-500">
            Bridging Medical Jargon to Human Understanding.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={patient}
        onSaveProfile={handleSaveProfile}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authMode}
        onSuccess={() => {
          setIsAuthenticated(true);
          reloadData();
          router.push('/dashboard');
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={patient}
        onComplete={handleCompleteOnboarding}
      />

    </div>
  );
}
