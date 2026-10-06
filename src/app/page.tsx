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
  MessageSquare
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

import { MedicalDocument, PatientProfile, LanguageCode, TimelineEvent, VitalTrendSeries, ExtractedMedication, TestStatus } from '@/types';
import { HealthStorageService } from '@/lib/storage';
import { UI_TRANSLATIONS } from '@/lib/multilingual';
import { SAMPLE_DOCUMENTS } from '@/lib/sample-data';
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

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setPatient(prev => ({
                  ...prev,
                  id: data.id,
                  fullName: data.full_name,
                  email: data.email || session.user.email,
                  phone: data.phone_number || prev.phone,
                  bloodGroup: data.blood_group || prev.bloodGroup
                }));
              }
            });
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setPatient(prev => ({
                  ...prev,
                  id: data.id,
                  fullName: data.full_name,
                  email: data.email || session.user.email
                }));
              }
            });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  // Document analysis finished callback
  const handleAnalysisComplete = (newDoc: MedicalDocument) => {
    setActiveDocument(newDoc);
  };

  // Commit document to profile
  const handleSaveToTimeline = (doc: MedicalDocument) => {
    HealthStorageService.addDocument(doc);
    reloadData();
  };

  // Select document from timeline
  const handleSelectFromTimeline = (doc: MedicalDocument) => {
    setActiveDocument(doc);
    setActiveTab('upload');
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
        onOpenAuth={() => setIsAuthOpen(true)}
        isAbhaVerified={patient.isAbhaVerified}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Patient Status & High-Level Metric Tiles */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Patient Identity Brief */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-teal-500/20">
                {patient.fullName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {patient.fullName}
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    52 Y / M
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline">
                    ABHA Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ABHA ID: <span className="font-mono font-medium text-slate-700">{patient.abhaId}</span> • Blood Group: <span className="font-semibold text-slate-700">{patient.bloodGroup}</span>
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
                className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100/60 hover:to-emerald-100/60 border border-teal-200/80 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-teal-600 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI Copilot</span>
                  <Bot className="w-4 h-4 text-teal-700" />
                </div>
                <div className="text-base font-extrabold text-teal-950 flex items-center gap-1.5">
                  <span>Chat Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div className="text-[10px] text-teal-800 font-medium mt-0.5">Clinical Inquiries</div>
              </div>

            </div>

          </div>
        </section>

        {/* Primary Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
          <button
            onClick={() => { setActiveTab('upload'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'upload' && !activeDocument
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t.tabUpload}</span>
          </button>

          <button
            onClick={() => { setActiveTab('copilot'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-sm'
                : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-500" />
            <span>AI Health Copilot</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800">Gemini</span>
          </button>

          <button
            onClick={() => { setActiveTab('timeline'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'timeline'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.tabTimeline}</span>
          </button>

          <button
            onClick={() => { setActiveTab('trends'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'trends'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.tabTrends}</span>
          </button>

          <button
            onClick={() => { setActiveTab('meds'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'meds'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>{t.tabMeds}</span>
          </button>

          <button
            onClick={() => { setActiveTab('abdm'); setActiveDocument(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'abdm'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.tabAbdm}</span>
          </button>
        </div>

        {/* Dynamic Tab Body Render */}
        <section className="transition-all">
          
          {/* View 1: Analyzed Document View (if document is active) */}
          {activeDocument ? (
            <ExtractionResultsView
              document={activeDocument}
              currentLanguage={currentLanguage}
              onSaveToTimeline={handleSaveToTimeline}
              onBack={() => setActiveDocument(null)}
              onViewTimeline={() => { setActiveTab('timeline'); setActiveDocument(null); }}
            />
          ) : activeTab === 'copilot' ? (
            /* View 2: Interactive AI Health Copilot Chatbot */
            <AiHealthChatbot
              currentLanguage={currentLanguage}
              profile={patient}
              medications={activeMeds}
              recentObservations={allLabObservations}
              onAddMedication={handleAddCustomMedication}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          ) : activeTab === 'upload' ? (
            /* View 3: Upload Dropzone & Instant File Scanner */
            <DocumentUploader
              currentLanguage={currentLanguage}
              onAnalysisComplete={handleAnalysisComplete}
            />
          ) : activeTab === 'timeline' ? (
            /* View 4: Chronological Health Journey Timeline */
            <HealthTimeline
              events={timelineEvents}
              documents={documents}
              onSelectDocument={handleSelectFromTimeline}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          ) : activeTab === 'trends' ? (
            /* View 5: Longitudinal Vital Trends & Recharts Analytics with Logger */
            <VitalTrendsChart 
              seriesList={vitalTrends} 
              onLogVital={handleLogVital}
              onNavigateToUpload={() => setActiveTab('upload')}
            />
          ) : activeTab === 'meds' ? (
            /* View 6: Medication Timetable & Safety Guardrails */
            <MedicationTracker
              medications={activeMeds}
              onToggleStatus={handleToggleMedStatus}
              onAddCustomMedication={handleAddCustomMedication}
              onToggleTakenToday={handleToggleMedicationTaken}
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

      {/* Floating Action Button for AI Copilot */}
      {activeTab !== 'copilot' && !activeDocument && (
        <button
          onClick={() => { setActiveTab('copilot'); setActiveDocument(null); }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-sm shadow-xl shadow-teal-900/20 transition-all hover:scale-105 group cursor-pointer"
        >
          <Bot className="w-5 h-5 text-teal-200 group-hover:rotate-12 transition-transform" />
          <span>Ask AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
        </button>
      )}

      {/* Global Clinical Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">SetuHealth AI Copilot</span>
            <span>•</span>
            <span>Personal Health Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setIsAuthOpen(true)} className="hover:text-teal-700">
              Database & Auth
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onResetData={handleResetDemo}
      />

    </div>
  );
}
