'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Download, 
  BookmarkCheck, 
  HelpCircle, 
  ArrowLeft,
  Utensils,
  Clock,
  Pill,
  Activity,
  User,
  Calendar,
  Building,
  Trash2
} from 'lucide-react';
import { MedicalDocument, LanguageCode, TestStatus, ClinicalUrgency } from '@/types';
import { speakText, stopSpeaking, UI_TRANSLATIONS } from '@/lib/multilingual';
import { generateFhirR4Bundle } from '@/lib/abdm-fhir';
import { DEFAULT_PATIENT } from '@/lib/sample-data';
import confetti from 'canvas-confetti';

interface ExtractionResultsViewProps {
  document: MedicalDocument;
  currentLanguage: LanguageCode;
  onSaveToTimeline?: (doc: MedicalDocument) => void;
  onBack: () => void;
  onViewTimeline?: () => void;
  onDeleteDocument?: (docId: string) => void;
}

export const ExtractionResultsView: React.FC<ExtractionResultsViewProps> = ({
  document,
  currentLanguage,
  onBack,
  onViewTimeline,
  onDeleteDocument
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'labs' | 'meds' | 'questions'>('summary');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const summary = document.aiSummary;

  // Audio Playback
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const speechText = `${summary.headline}. ${summary.simpleExplanation}. ${summary.whyItMatters}. Action step: ${summary.keyActionItems.join('. ')}`;
      const started = speakText(speechText, currentLanguage, () => setIsSpeaking(false));
      if (started) setIsSpeaking(true);
    }
  };

  // Download FHIR R4 Bundle
  const handleDownloadFhir = () => {
    const fhirBundle = generateFhirR4Bundle(document, DEFAULT_PATIENT);
    const jsonString = JSON.stringify(fhirBundle, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = window.document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `ABDM_FHIR_${document.id}.json`;
    window.document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    window.document.body.removeChild(downloadAnchor);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);
  };

  // Urgency color helper
  const getUrgencyBadge = (urgency: ClinicalUrgency) => {
    switch (urgency) {
      case 'IMMEDIATE_CARE':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 animate-bounce" />,
          label: t.immediateCare
        };
      case 'CONSULT_SOON':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          label: t.consultDoctorSoon
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: t.routineCheck
        };
    }
  };

  const urgencyBadge = getUrgencyBadge(summary.urgencyLevel);

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Upload"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {document.documentType.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {document.date}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {document.title}
            </h2>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
              {document.doctorName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {document.doctorName}
                </span>
              )}
              {document.facilityName && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {document.facilityName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadFhir}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 transition-colors cursor-pointer"
            title="Download ABDM HL7 FHIR R4 JSON"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>FHIR R4 JSON</span>
          </button>

          {onDeleteDocument && (
            <button
              onClick={() => {
                if (confirmDelete) {
                  onDeleteDocument(document.id);
                  onBack();
                } else {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 4000);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                confirmDelete
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200 hover:border-rose-200'
              }`}
              title={confirmDelete ? 'Click again to permanently delete' : 'Delete this record'}
            >
              <Trash2 className={`w-4 h-4 ${confirmDelete ? 'text-white' : 'text-slate-400 hover:text-rose-600'}`} />
              <span>{confirmDelete ? 'Confirm Delete?' : 'Delete Record'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Plain-Language Health Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        
        {/* Urgency Badge & Voice Playback Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${urgencyBadge.bg}`}>
              {urgencyBadge.icon}
              {urgencyBadge.label}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {summary.urgencyReason}
            </span>
          </div>

          {/* Voice Audio Read-Aloud Button */}
          <button
            onClick={handleToggleSpeech}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
            title="Listen to summary in your chosen regional language"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t.stopReading}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-teal-600" />
                <span>{t.readAloud}</span>
              </>
            )}
          </button>
        </div>

        {/* Headline */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          {summary.headline}
        </h3>

        {/* Simple Plain-Language Explanation */}
        <p className="text-slate-700 text-base leading-relaxed mb-4">
          {summary.simpleExplanation}
        </p>

        {/* "Why This Matters" Insight Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                {t.whyItMatters}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {summary.whyItMatters}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs for Granular Breakdown */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'summary' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Action Plan & Advice
          </button>
          {document.labObservations.length > 0 && (
            <button
              onClick={() => setActiveTab('labs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'labs' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Lab Biomarkers</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                {document.labObservations.length}
              </span>
            </button>
          )}
          {document.medications.length > 0 && (
            <button
              onClick={() => setActiveTab('meds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'meds' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Medications</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                {document.medications.length}
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'questions' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Questions for Doctor</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {summary.questionsForDoctor.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Action Plan & Lifestyle Guidance */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Action Items */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {t.actionPlan}
              </h4>
              <ul className="space-y-2.5">
                {summary.keyActionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diet & Lifestyle Tips */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-teal-600" />
                {t.dietTips}
              </h4>
              <ul className="space-y-2.5">
                {summary.dietAndLifestyleTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Lab Test Biomarkers Table */}
        {activeTab === 'labs' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Test Analyte</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Reference Range</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Clinical Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {document.labObservations.map((obs) => {
                    const isHigh = obs.status === 'HIGH' || obs.status === 'CRITICAL';
                    const isLow = obs.status === 'LOW';
                    return (
                      <tr key={obs.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {obs.testName}
                          {obs.loincCode && (
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                              LOINC: {obs.loincCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {obs.value} <span className="text-xs font-normal text-slate-500">{obs.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs">
                          {obs.referenceRangeString}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isHigh ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              High
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs">
                          {obs.clinicalMeaning}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Prescribed Medications */}
        {activeTab === 'meds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {document.medications.map((med) => (
              <div 
                key={med.id} 
                className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-bold text-slate-900 text-sm">
                      {med.name}
                    </h5>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {med.dosage}
                    </span>
                  </div>
                  {med.genericName && (
                    <p className="text-xs text-slate-500 italic">
                      {med.genericName}
                    </p>
                  )}
                  <p className="text-xs text-slate-700 pt-1">
                    {med.instructions || `${med.frequency} (${med.timing})`}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Slots: {med.timeOfDay.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Questions for Your Doctor */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Personalized Questions to Bring to Your Next Consultation
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Patients often forget their questions during short consultations. Print or save these tailored questions:
            </p>
            <div className="space-y-3">
              {summary.questionsForDoctor.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-amber-950 font-medium flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Disclaimer Banner */}
        <div className="mt-8 pt-4 border-t border-teal-200/60 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{t.safetyDisclaimer}</span>
        </div>

      </div>

    </div>
  );
};
