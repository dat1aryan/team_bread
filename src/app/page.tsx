'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Bot,
  MessageSquare,
  Lock
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { DocumentUploader } from '@/components/DocumentUploader';
import { ExtractionResultsView } from '@/components/ExtractionResultsView';
import { HealthTimeline } from '@/components/HealthTimeline';
import { VitalTrendsChart } from '@/components/VitalTrendsChart';
import { MedicationTracker } from '@/components/MedicationTracker';
import { AbdmAbhaHub } from '@/components/AbdmAbhaHub';
import { AiHealthChatbot } from '@/components/AiHealthChatbot';
import { AuthModal } from '@/components/AuthModal';
import { OpeningSplash } from '@/components/OpeningSplash';
import { HeroSection } from '@/components/HeroSection';
import { ProfileModal } from '@/components/ProfileModal';
import { OnboardingModal } from '@/components/OnboardingModal';

import { MedicalDocument, PatientProfile, LanguageCode, TimelineEvent, VitalTrendSeries, ExtractedMedication, TestStatus } from '@/types';
import { HealthStorageService } from '@/lib/storage';
import { UI_TRANSLATIONS } from '@/lib/multilingual';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [patient, setPatient] = useState<PatientProfile>(HealthStorageService.getPatientProfile());
  const [documents, setDocuments] = useState<MedicalDocument[]>(HealthStorageService.getDocuments());
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(HealthStorageService.getTimelineEvents());
  const [vitalTrends, setVitalTrends] = useState<VitalTrendSeries[]>(HealthStorageService.getVitalTrends());
  const [activeMeds, setActiveMeds] = useState<ExtractedMedication[]>(HealthStorageService.getActiveMedications());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'upload' | 'timeline' | 'trends' | 'meds' | 'abdm' | 'copilot'>('upload');
  
  // Selected analyzed document (if viewing extraction view)
  const [activeDocument, setActiveDocument] = useState<MedicalDocument | null>(null);

  // Modals & Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const workspaceRef = React.useRef<HTMLDivElement>(null);

  // Synchronize state from storage
  const reloadData = () => {
    setPatient(HealthStorageService.getPatientProfile());
    const docs = HealthStorageService.getDocuments();
    setDocuments(docs);
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
              // User has not completed onboarding yet
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

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  // Document analysis finished callback: automatically saves in parallel to health timeline, vitals, and meds
  const handleAnalysisComplete = (newDoc: MedicalDocument) => {
    HealthStorageService.addDocument(newDoc);
    reloadData();
    setActiveDocument(newDoc);
  };

  // Select document from timeline
  const handleSelectFromTimeline = (doc: MedicalDocument) => {
    setActiveDocument(doc);
    setActiveTab('upload');
  };

  // Delete document / timeline record callback
  const handleDeleteDocument = (documentId: string) => {
    HealthStorageService.deleteDocument(documentId);
    if (activeDocument?.id === documentId) {
      setActiveDocument(null);
    }
    reloadData();
  };

  // ABHA verified callback
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

  // Toggle Medication Status
  const handleToggleMedStatus = (medId: string) => {
    HealthStorageService.toggleMedicationStatus(medId);
    reloadData();
  };

  // Toggle Medication Taken Today
  const handleToggleMedicationTaken = (medId: string) => {
    HealthStorageService.toggleMedicationTakenToday(medId);
    reloadData();
  };

  // Add Custom Medication
  const handleAddCustomMedication = (med: Omit<ExtractedMedication, 'id'>) => {
    HealthStorageService.addCustomMedication(med);
    reloadData();
  };

  // Delete Medication
  const handleDeleteMedication = (medNameOrId: string) => {
    HealthStorageService.deleteMedication(medNameOrId);
    reloadData();
  };

  // Log Manual Vital
  const handleLogVital = (testName: string, value: number, unit: string, status: TestStatus) => {
    HealthStorageService.logManualVital(testName, value, unit, status);
    reloadData();
  };

  // Reset demo
  const handleResetDemo = () => {
    HealthStorageService.resetToDefault();
    reloadData();
    setActiveDocument(null);
  };

  // Age calculation helper
  const calculateAge = (dobString?: string): string => {
    if (!dobString) return 'Age Not Set';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'Age Not Set';
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} Y` : 'Age Not Set';
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
      
      {/* 1-Second Opening Animation (Clean Favicon + Title fade) */}
      <OpeningSplash />

      {/* Top Global Navigation Bar with User Profile Dropdown or Sign In/Sign Up */}
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
      />

      {/* Landing View: When Not Authenticated, show Alethea Medical inspired Hero Section */}
      {!isAuthenticated ? (
        <HeroSection 
          onOpenSignIn={() => handleOpenAuth('signin')}
          onOpenSignUp={() => handleOpenAuth('signup')}
          isAuthenticated={isAuthenticated}
          userName={patient.fullName}
        />
      ) : (
        /* Authenticated View: Patient Health Dashboard Workspace */
        <main ref={workspaceRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
          
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
                  onClick={() => { setActiveTab('timeline'); setActiveDocument(null); }}
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
                  onClick={() => { setActiveTab('meds'); setActiveDocument(null); }}
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
                  onClick={() => { setActiveTab('trends'); setActiveDocument(null); }}
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
                  onClick={() => { setActiveTab('copilot'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('upload'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('timeline'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('trends'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('meds'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('copilot'); setActiveDocument(null); }}
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
              onClick={() => { setActiveTab('abdm'); setActiveDocument(null); }}
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
                onNavigateToUpload={() => setActiveTab('upload')}
                onDeleteEvent={handleDeleteDocument}
              />
            ) : activeTab === 'trends' ? (
              /* View 4: Longitudinal Biomarker Trends */
              <VitalTrendsChart
                seriesList={vitalTrends}
                onLogVital={handleLogVital}
                onNavigateToUpload={() => setActiveTab('upload')}
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
                    setActiveTab(tab as any);
                    setActiveDocument(null);
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
                onNavigateToUpload={() => setActiveTab('upload')}
                onNavigateToCopilot={() => setActiveTab('copilot')}
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
      )}

      {/* Global Clinical Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2" title="Setu | AI-Powered Personal Health Copilot">
            <img src="/brand/favicon.png" alt="Setu Logo" className="w-5 h-5 object-contain" title="Setu | AI-Powered Personal Health Copilot" />
            <span className="font-bold text-slate-800">Setu AI Copilot</span>
            <span>•</span>
            <span>Personal Health Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => { setActiveTab('copilot'); setActiveDocument(null); }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-teal-200" />
                <span>Ask AI Copilot</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenAuth('signin')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
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

    </div>
  );
}
