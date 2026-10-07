'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  HeartPulse, 
  UploadCloud, 
  Clock, 
  TrendingUp, 
  Pill, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Activity, 
  Bot,
  Lock,
  ArrowRight,
  Home,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { DocumentUploader } from '@/components/DocumentUploader';
import { ExtractionResultsView } from '@/components/ExtractionResultsView';
import { HealthTimeline } from '@/components/HealthTimeline';
import { VitalTrendsChart } from '@/components/VitalTrendsChart';
import { MedicationTracker } from '@/components/MedicationTracker';
import { AbdmAbhaHub } from '@/components/AbdmAbhaHub';
import { AiHealthChatbot } from '@/components/AiHealthChatbot';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import { OnboardingModal } from '@/components/OnboardingModal';

import { MedicalDocument, PatientProfile, LanguageCode, TimelineEvent, VitalTrendSeries, ExtractedMedication, TestStatus } from '@/types';
import { HealthStorageService } from '@/lib/storage';
import { UI_TRANSLATIONS } from '@/lib/multilingual';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type TabType = 'upload' | 'timeline' | 'trends' | 'meds' | 'abdm' | 'copilot';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'upload';

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [patient, setPatient] = useState<PatientProfile>(HealthStorageService.getPatientProfile());
  const [documents, setDocuments] = useState<MedicalDocument[]>(HealthStorageService.getDocuments());
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(HealthStorageService.getTimelineEvents());
  const [vitalTrends, setVitalTrends] = useState<VitalTrendSeries[]>(HealthStorageService.getVitalTrends());
  const [activeMeds, setActiveMeds] = useState<ExtractedMedication[]>(HealthStorageService.getActiveMedications());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Selected analyzed document (if viewing extraction view)
  const [activeDocument, setActiveDocument] = useState<MedicalDocument | null>(null);

  // Modals & Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Synchronize state from storage
  const reloadData = () => {
    setPatient(HealthStorageService.getPatientProfile());
    setDocuments(HealthStorageService.getDocuments());
    setTimelineEvents(HealthStorageService.getTimelineEvents());
    setVitalTrends(HealthStorageService.getVitalTrends());
    setActiveMeds(HealthStorageService.getActiveMedications());
  };

  useEffect(() => {
    reloadData();

    // Listen for live Supabase Auth sessions
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const handleAuthUser = (user: any) => {
        setIsAuthenticated(true);
        setIsAuthChecking(false);
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
        } else {
          setIsAuthChecking(false);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          handleAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAuthChecking(false);
          setIsOnboardingOpen(false);
          HealthStorageService.resetToDefault();
          setPatient(HealthStorageService.getPatientProfile());
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsAuthChecking(false);
    }
  }, []);

  // Update tab in URL for clean bookmarkable routes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveDocument(null);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  };

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
    router.replace('/');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      if (supabase && patient?.id) {
        await supabase.from('documents').delete().eq('user_id', patient.id);
        await supabase.from('profiles').delete().eq('id', patient.id);
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during account deletion:', err);
    } finally {
      setIsAuthenticated(false);
      setIsOnboardingOpen(false);
      HealthStorageService.resetToDefault();
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      reloadData();
      setIsDeleteModalOpen(false);
      setIsDeletingAccount(false);
      router.replace('/');
    }
  };

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const handleAnalysisComplete = (newDoc: MedicalDocument) => {
    HealthStorageService.addDocument(newDoc);
    reloadData();
    setActiveDocument(newDoc);
  };

  const handleSelectFromTimeline = (doc: MedicalDocument) => {
    setActiveDocument(doc);
    setActiveTab('upload');
  };

  const handleDeleteDocument = (documentId: string) => {
    HealthStorageService.deleteDocument(documentId);
    if (activeDocument?.id === documentId) {
      setActiveDocument(null);
    }
    reloadData();
  };

  const handleAbhaVerified = (abhaNum: string, abhaAddr: string) => {
    const updated: PatientProfile = {
      ...patient,
      abhaId: abhaNum,
      abhaAddress: abhaAddr,
      isAbhaVerified: true
    };
    HealthStorageService.savePatientProfile(updated);
    setPatient(updated);
  };

  const handleToggleMedStatus = (medId: string) => {
    HealthStorageService.toggleMedicationStatus(medId);
    reloadData();
  };

  const handleToggleMedicationTaken = (medId: string) => {
    HealthStorageService.toggleMedicationTakenToday(medId);
    reloadData();
  };

  const handleAddCustomMedication = (med: Omit<ExtractedMedication, 'id'>) => {
    HealthStorageService.addCustomMedication(med);
    reloadData();
  };

  const handleDeleteMedication = (medNameOrId: string) => {
    HealthStorageService.deleteMedication(medNameOrId);
    reloadData();
  };

  const handleLogVital = (testName: string, value: number, unit: string, status: TestStatus) => {
    HealthStorageService.logManualVital(testName, value, unit, status);
    reloadData();
  };

  const calculateAge = (dobString?: string): string => {
    if (!dobString) return 'Age Not Set';
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return 'Age Not Set';
    const diff = Date.now() - birth.getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} Y`;
  };

  // Aggregate Stats
  const totalRecords = documents.length;
  const activeMedCount = activeMeds.filter((m) => m.isActive).length;
  const flaggedCount = documents.reduce(
    (acc, d) => acc + d.labObservations.filter((o) => o.status !== 'NORMAL').length,
    0
  );

  const allLabObservations = documents.flatMap(d => d.labObservations);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Global Navigation Bar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        onDeleteAccount={() => setIsDeleteModalOpen(true)}
        onOpenAuth={handleOpenAuth}
        isAbhaVerified={patient.isAbhaVerified}
        patientName={patient.fullName}
        patientEmail={patient.email}
        isAuthenticated={isAuthenticated}
        activeRoute="dashboard"
      />

      {/* Main Patient Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Unauthenticated Quick Banner if direct navigation occurs */}
        {!isAuthenticated && !isAuthChecking && (
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">Sign in to save records to your secure cloud profile</h3>
                <p className="text-xs text-slate-400">Your health records, lab analyses, and medication schedules sync encrypted with Supabase.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenAuth('signin')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleOpenAuth('signup')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Patient Status & High-Level Metric Tiles */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Patient Identity Brief */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-extrabold text-xl shadow-xs">
                {patient.fullName ? patient.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {patient.fullName || 'Patient Profile'}
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {calculateAge(patient.dateOfBirth)} / {patient.gender === 'female' ? 'F' : patient.gender === 'male' ? 'M' : 'Other'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ABHA ID: <span className="font-mono font-medium text-slate-700">{patient.abhaId || 'Not Linked'}</span> • Blood Group: <span className="font-semibold text-slate-700">{patient.bloodGroup || 'Not Set'}</span>
                </p>
              </div>
            </div>

            {/* Metric Highlights Pill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Digitized Documents */}
              <div 
                onClick={() => handleTabChange('timeline')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Records</span>
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-900">{totalRecords}</div>
                <div className="text-[10px] text-teal-700 font-medium mt-0.5">Chronological Feed</div>
              </div>

              {/* Active Medications */}
              <div 
                onClick={() => handleTabChange('meds')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Active Meds</span>
                  <Pill className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-extrabold text-slate-900">{activeMedCount}</div>
                <div className="text-[10px] text-indigo-700 font-medium mt-0.5">Daily Schedule</div>
              </div>

              {/* Flagged Biomarkers */}
              <div 
                onClick={() => handleTabChange('trends')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Flagged</span>
                  <Activity className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-extrabold text-rose-600">{flaggedCount}</div>
                <div className="text-[10px] text-rose-700 font-medium mt-0.5">Biomarkers Under Watch</div>
              </div>

              {/* AI Copilot Direct Launch */}
              <div 
                onClick={() => handleTabChange('copilot')}
                className="p-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 border border-teal-700 text-white cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center justify-between text-teal-200 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI Copilot</span>
                  <Bot className="w-4 h-4 text-teal-300" />
                </div>
                <div className="text-sm font-extrabold flex items-center gap-1">
                  <span>Ask Setu</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="text-[10px] text-teal-200 font-medium mt-0.5">Plain-Language Triage</div>
              </div>

            </div>

          </div>
        </section>

        {/* Workspace Tabs Navigation Bar */}
        <nav className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-teal-600" />
            <span>{t.tabScanUpload}</span>
          </button>

          <button
            onClick={() => handleTabChange('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{t.tabTimeline}</span>
            {totalRecords > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-semibold text-slate-600">
                {totalRecords}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>{t.tabTrends}</span>
          </button>

          <button
            onClick={() => handleTabChange('meds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'meds'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4 text-teal-600" />
            <span>{t.tabMeds}</span>
            {activeMedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 font-semibold text-teal-800">
                {activeMedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('copilot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'copilot'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>Ask AI Copilot</span>
          </button>

          <button
            onClick={() => handleTabChange('abdm')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'abdm'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.tabAbdmHub}</span>
          </button>
        </nav>

        {/* Active Workspace View Section */}
        <section className="transition-all">
          
          {activeTab === 'upload' ? (
            activeDocument ? (
              /* View 1: Clinical Extraction Results */
              <ExtractionResultsView
                document={activeDocument}
                currentLanguage={currentLanguage}
                onBack={() => setActiveDocument(null)}
              />
            ) : (
              /* View 2: Medical Ingestion & Vision Analyzer */
              <DocumentUploader
                currentLanguage={currentLanguage}
                onAnalysisComplete={handleAnalysisComplete}
                userId={patient.id}
              />
            )
          ) : activeTab === 'timeline' ? (
            /* View 3: Longitudinal Health Timeline */
            <HealthTimeline
              events={timelineEvents}
              documents={documents}
              onSelectDocument={handleSelectFromTimeline}
              onNavigateToUpload={() => handleTabChange('upload')}
              onDeleteEvent={handleDeleteDocument}
            />
          ) : activeTab === 'trends' ? (
            /* View 4: Longitudinal Biomarker Trends */
            <VitalTrendsChart
              seriesList={vitalTrends}
              onLogVital={handleLogVital}
              onNavigateToUpload={() => handleTabChange('upload')}
            />
          ) : activeTab === 'copilot' ? (
            /* View 5: Multilingual Health Copilot */
            <div className="max-w-4xl mx-auto">
              <AiHealthChatbot
                currentLanguage={currentLanguage}
                profile={patient}
                medications={activeMeds}
                recentObservations={allLabObservations}
                activeTab={activeTab}
                onAddMedication={handleAddCustomMedication}
                onToggleMedicationStatus={handleToggleMedStatus}
                onToggleMedicationTaken={handleToggleMedicationTaken}
                onDeleteMedication={handleDeleteMedication}
                onLogVital={handleLogVital}
                onNavigateTab={(tab) => {
                  handleTabChange(tab as TabType);
                }}
              />
            </div>
          ) : activeTab === 'meds' ? (
            /* View 6: Smart Medication Schedule & Safety Watchdog */
            <MedicationTracker
              medications={activeMeds}
              onAddCustomMedication={handleAddCustomMedication}
              onToggleStatus={handleToggleMedStatus}
              onToggleTakenToday={handleToggleMedicationTaken}
              onDeleteMedication={handleDeleteMedication}
              onNavigateToUpload={() => handleTabChange('upload')}
              onNavigateToCopilot={() => handleTabChange('copilot')}
            />
          ) : activeTab === 'abdm' ? (
            /* View 7: ABDM & ABHA Interoperability Hub */
            <AbdmAbhaHub
              patient={patient}
              documents={documents}
              onAbhaVerified={handleAbhaVerified}
            />
          ) : null}

        </section>

      </main>

      {/* Global Clinical Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center gap-2">
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
        }}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={patient}
        onComplete={handleCompleteOnboarding}
      />

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Delete Setu Account?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                This action is permanent and cannot be undone. All your uploaded medical prescriptions, diagnostic lab reports, clinical summaries, and profile records will be permanently erased.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeletingAccount ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
