// ========================================================================
// SetuHealth AI Copilot - Unified Data Persistence Service
// Syncs with Supabase PostgreSQL with transparent localStorage fallback
// ========================================================================

import { MedicalDocument, PatientProfile, TimelineEvent, VitalTrendSeries, ExtractedMedication, LanguageCode } from '@/types';
import { DEFAULT_PATIENT, SAMPLE_DOCUMENTS, VITAL_TRENDS_SERIES } from './sample-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PATIENT: 'setu_patient_profile',
  DOCUMENTS: 'setu_medical_documents',
  TRENDS: 'setu_vital_trends',
  LANGUAGE: 'setu_preferred_language',
};

export class HealthStorageService {
  /**
   * Loads patient profile
   */
  static getPatientProfile(): PatientProfile {
    if (typeof window === 'undefined') return DEFAULT_PATIENT;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PATIENT);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEFAULT_PATIENT;
  }

  /**
   * Saves patient profile
   */
  static savePatientProfile(profile: PatientProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(profile));
      
      // Sync to Supabase if available
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('profiles')
          .upsert({
            id: profile.id,
            full_name: profile.fullName,
            date_of_birth: profile.dateOfBirth,
            gender: profile.gender,
            blood_group: profile.bloodGroup,
            phone_number: profile.phone,
            emergency_contact: profile.emergencyContact,
            preferred_language: profile.preferredLanguage,
            updated_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase profile sync error:', error.message);
          });
      }
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  /**
   * Loads all medical documents
   */
  static getDocuments(): MedicalDocument[] {
    if (typeof window === 'undefined') return SAMPLE_DOCUMENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return SAMPLE_DOCUMENTS;
  }

  /**
   * Adds a newly ingested medical document and updates timeline + vitals
   */
  static addDocument(doc: MedicalDocument): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getDocuments();
      const updated = [doc, ...existing];
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));

      // Also update vital trends if lab observations are present
      if (doc.labObservations && doc.labObservations.length > 0) {
        this.updateTrendsWithObservations(doc);
      }

      // Sync with Supabase
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('documents')
          .insert({
            id: doc.id,
            user_id: doc.userId,
            file_name: doc.fileName,
            file_url: doc.fileUrl,
            mime_type: 'image/jpeg',
            document_type: doc.documentType,
            document_date: doc.date,
            issuing_facility: doc.facilityName,
            doctor_name: doc.doctorName,
            ocr_raw_text: doc.rawOcrText,
            ai_summary: doc.aiSummary,
            urgency_level: doc.aiSummary.urgencyLevel
          })
          .then(({ error }) => {
            if (error) console.warn('Supabase document sync error:', error.message);
          });
      }
    } catch (e) {
      console.warn('Failed to add document', e);
    }
  }

  /**
   * Generates chronological timeline events from stored documents
   */
  static getTimelineEvents(): TimelineEvent[] {
    const docs = this.getDocuments();
    return docs.map((doc) => ({
      id: `evt-${doc.id}`,
      documentId: doc.id,
      eventType: (doc.documentType === 'PRESCRIPTION' ? 'PRESCRIPTION' 
               : doc.documentType === 'DISCHARGE_SUMMARY' ? 'DISCHARGE'
               : doc.documentType === 'LAB_REPORT' ? 'LAB_RESULT' : 'DOCTOR_VISIT') as TimelineEvent['eventType'],
      title: doc.title,
      facilityName: doc.facilityName || 'Medical Center',
      doctorName: doc.doctorName,
      date: doc.date,
      summary: doc.aiSummary.headline,
      highlights: doc.aiSummary.keyActionItems.slice(0, 3),
      urgencyLevel: doc.aiSummary.urgencyLevel,
      metricsCount: {
        meds: doc.medications.length,
        tests: doc.labObservations.length,
        abnormal: doc.labObservations.filter((o) => o.status !== 'NORMAL').length
      }
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Retrieves all active medications across stored prescriptions
   */
  static getActiveMedications(): ExtractedMedication[] {
    const docs = this.getDocuments();
    const map = new Map<string, ExtractedMedication>();

    docs.forEach((doc) => {
      doc.medications.forEach((med) => {
        if (!map.has(med.name.toLowerCase())) {
          map.set(med.name.toLowerCase(), med);
        }
      });
    });

    return Array.from(map.values());
  }

  /**
   * Toggles medication active status
   */
  static toggleMedicationStatus(medId: string): void {
    const docs = this.getDocuments();
    let updated = false;

    docs.forEach((doc) => {
      doc.medications.forEach((med) => {
        if (med.id === medId) {
          med.isActive = !med.isActive;
          updated = true;
        }
      });
    });

    if (updated && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    }
  }

  /**
   * Retrieves vital trends series
   */
  static getVitalTrends(): VitalTrendSeries[] {
    if (typeof window === 'undefined') return VITAL_TRENDS_SERIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRENDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return VITAL_TRENDS_SERIES;
  }

  /**
   * Updates vital trends series with newly uploaded lab observations
   */
  private static updateTrendsWithObservations(doc: MedicalDocument): void {
    const trends = this.getVitalTrends();
    let modified = false;

    doc.labObservations.forEach((obs) => {
      const match = trends.find((t) => 
        t.testName.toLowerCase().includes(obs.testName.toLowerCase()) || 
        obs.testName.toLowerCase().includes(t.testName.toLowerCase())
      );

      if (match) {
        modified = true;
        match.points.push({
          date: doc.date,
          timestamp: new Date(doc.date).getTime(),
          value: obs.value,
          unit: obs.unit,
          status: obs.status,
          facility: doc.facilityName || 'Diagnostic Lab'
        });
        match.currentValue = obs.value;
        match.currentStatus = obs.status;
      }
    });

    if (modified && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trends));
    }
  }

  /**
   * Resets data to initial sample states
   */
  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.PATIENT);
    localStorage.removeItem(STORAGE_KEYS.TRENDS);
  }
}
