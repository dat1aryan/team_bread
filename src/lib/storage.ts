// Syncs with Supabase PostgreSQL & Storage with resilient local fallback

import { MedicalDocument, PatientProfile, TimelineEvent, VitalTrendSeries, ExtractedMedication, TestStatus } from '@/types';
import { DEFAULT_PATIENT, SAMPLE_DOCUMENTS, VITAL_TRENDS_SERIES } from './sample-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PATIENT: 'setu_patient_profile',
  DOCUMENTS: 'setu_medical_documents',
  TRENDS: 'setu_vital_trends',
  CUSTOM_MEDS: 'setu_custom_medications',
};

// Ensure v3 clean initialization: No mock data pre-injected into profile, timeline, vitals, or meds
if (typeof window !== 'undefined' && !localStorage.getItem('setu_v3_clean_init')) {
  try {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRENDS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_MEDS);
    const storedP = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (storedP) {
      const parsed = JSON.parse(storedP);
      parsed.isAbhaVerified = false;
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(parsed));
    }
    localStorage.setItem('setu_v3_clean_init', 'true');
  } catch (e) {}
}

export class HealthStorageService {
  /**
   * Uploads raw medical image/PDF to Supabase Storage bucket 'medical-records'
   */
  static async uploadFileToStorage(file: File, userId: string): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanUserId = userId || 'anonymous';
        const filePath = `${cleanUserId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('medical-records')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('medical-records')
            .getPublicUrl(data.path);
          return publicData.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload error, falling back to data URL:', err);
      }
    }

    // Fallback: create object URL or base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

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
   * Saves patient profile and syncs to Supabase
   */
  static savePatientProfile(profile: PatientProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(profile));
      
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('profiles')
          .upsert({
            id: profile.id,
            full_name: profile.fullName,
            email: profile.email,
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
   * Loads all medical documents. Returns empty array by default unless ingested/saved by user.
   */
  static getDocuments(): MedicalDocument[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return [];
  }

  /**
   * Adds a newly ingested medical document and updates timeline + vitals + Supabase
   */
  static addDocument(doc: MedicalDocument): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getDocuments();
      const updated = [doc, ...existing];
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));

      // Update vital trends if lab observations are present
      if (doc.labObservations && doc.labObservations.length > 0) {
        this.updateTrendsWithObservations(doc);
      }

      // Sync with Supabase tables: documents, medications, lab_observations, timeline_events
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

        // Sync extracted medications
        if (doc.medications?.length > 0) {
          const medPayloads = doc.medications.map(m => ({
            id: m.id,
            user_id: doc.userId,
            document_id: doc.id,
            drug_name: m.name,
            generic_name: m.genericName,
            dosage: m.dosage,
            frequency: m.frequency,
            route: m.route || 'Oral',
            timing: m.timing || 'After Food',
            instructions: m.instructions,
            is_active: m.isActive !== false
          }));

          supabase.from('medications').insert(medPayloads).then(({ error }) => {
            if (error) console.warn('Supabase medications sync error:', error.message);
          });
        }

        // Sync extracted lab observations
        if (doc.labObservations?.length > 0) {
          const obsPayloads = doc.labObservations.map(o => ({
            id: o.id,
            user_id: doc.userId,
            document_id: doc.id,
            test_name: o.testName,
            category: o.category,
            measured_value: o.value,
            unit: o.unit,
            reference_low: o.referenceLow,
            reference_high: o.referenceHigh,
            reference_range_string: o.referenceRangeString,
            status: o.status,
            loinc_code: o.loincCode,
            clinical_interpretation: o.clinicalMeaning,
            observation_date: doc.date
          }));

          supabase.from('lab_observations').insert(obsPayloads).then(({ error }) => {
            if (error) console.warn('Supabase lab_observations sync error:', error.message);
          });
        }
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
   * Retrieves all medications across stored prescriptions and custom additions
   */
  static getActiveMedications(): ExtractedMedication[] {
    const docs = this.getDocuments();
    const map = new Map<string, ExtractedMedication>();

    docs.forEach((doc) => {
      doc.medications.forEach((med) => {
        if (!map.has(med.name.toLowerCase())) {
          map.set(med.name.toLowerCase(), { ...med });
        }
      });
    });

    // Merge custom medications
    if (typeof window !== 'undefined') {
      try {
        const customMeds: ExtractedMedication[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_MEDS) || '[]');
        customMeds.forEach(m => {
          if (!map.has(m.name.toLowerCase())) {
            map.set(m.name.toLowerCase(), m);
          }
        });
      } catch (e) {
        console.warn('Error reading custom meds', e);
      }
    }

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
   * Toggles medication taken today (daily adherence tracker)
   */
  static toggleMedicationTakenToday(medId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const docs = this.getDocuments();
    let updated = false;

    docs.forEach((doc) => {
      doc.medications.forEach((med) => {
        if (med.id === medId) {
          const wasTaken = Boolean(med.isTakenToday && med.lastTakenDate === today);
          med.isTakenToday = !wasTaken;
          med.lastTakenDate = !wasTaken ? today : undefined;
          med.streakDays = !wasTaken ? (med.streakDays || 1) + 1 : Math.max(1, (med.streakDays || 2) - 1);
          updated = true;
        }
      });
    });

    if (updated && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    }

    // Also check custom medications
    if (typeof window !== 'undefined') {
      try {
        const customMeds: ExtractedMedication[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_MEDS) || '[]');
        let customUpdated = false;
        customMeds.forEach((med) => {
          if (med.id === medId) {
            const wasTaken = Boolean(med.isTakenToday && med.lastTakenDate === today);
            med.isTakenToday = !wasTaken;
            med.lastTakenDate = !wasTaken ? today : undefined;
            med.streakDays = !wasTaken ? (med.streakDays || 1) + 1 : Math.max(1, (med.streakDays || 2) - 1);
            customUpdated = true;
          }
        });
        if (customUpdated) {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_MEDS, JSON.stringify(customMeds));
        }
      } catch (e) {}
    }
  }

  /**
   * Calculates the real-time active streak for medication adherence.
   */
  static getMedicationStreak(meds?: ExtractedMedication[]): number {
    const activeMeds = meds || this.getActiveMedications();
    if (!activeMeds || activeMeds.length === 0) return 0;

    const totalActive = activeMeds.filter(m => m.isActive !== false).length;
    if (totalActive === 0) return 0;

    const takenCount = activeMeds.filter(m => m.isActive !== false && m.isTakenToday).length;
    const baseStreak = activeMeds.reduce((max, m) => Math.max(max, m.streakDays || 1), 1);

    if (takenCount === totalActive) {
      return baseStreak;
    } else if (takenCount > 0) {
      return Math.max(1, baseStreak - 1);
    } else {
      return Math.max(0, baseStreak - 1);
    }
  }

  /**
   * Adds a manual custom medication
   */
  static addCustomMedication(med: Omit<ExtractedMedication, 'id'>): void {
    if (typeof window === 'undefined') return;
    const newMed: ExtractedMedication = {
      ...med,
      id: `med-custom-${Date.now()}`
    };

    try {
      const customMeds: ExtractedMedication[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_MEDS) || '[]');
      customMeds.push(newMed);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MEDS, JSON.stringify(customMeds));

      if (isSupabaseConfigured && supabase) {
        const profile = this.getPatientProfile();
        supabase.from('medications').insert({
          id: newMed.id,
          user_id: profile.id,
          drug_name: newMed.name,
          generic_name: newMed.genericName,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          timing: newMed.timing,
          route: newMed.route,
          instructions: newMed.instructions,
          is_active: true
        }).then(({ error }) => {
          if (error) console.warn('Supabase custom medication sync error:', error.message);
        });
      }
    } catch (e) {
      console.warn('Error saving custom medication', e);
    }
  }

  /**
   * Retrieves vital trends series. Returns empty array by default unless populated from scanned reports or logs.
   */
  static getVitalTrends(): VitalTrendSeries[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRENDS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return [];
  }

  /**
   * Logs a manual vital reading (e.g. today's blood glucose or BP)
   */
  static logManualVital(testName: string, value: number, unit: string, status: TestStatus): void {
    const trends = this.getVitalTrends();
    const today = new Date().toISOString().split('T')[0];
    let matched = false;

    trends.forEach((t) => {
      if (t.testName.toLowerCase().includes(testName.toLowerCase()) || testName.toLowerCase().includes(t.testName.toLowerCase())) {
        matched = true;
        t.points.push({
          date: today,
          timestamp: Date.now(),
          value,
          unit,
          status,
          facility: 'Home Self-Monitoring'
        });
        t.currentValue = value;
        t.currentStatus = status;
      }
    });

    if (!matched) {
      let targetMin = 0;
      let targetMax = 100;
      if (testName.toLowerCase().includes('hba1c')) {
        targetMin = 4.0;
        targetMax = 5.6;
      } else if (testName.toLowerCase().includes('fasting') || testName.toLowerCase().includes('glucose')) {
        targetMin = 70;
        targetMax = 99;
      } else if (testName.toLowerCase().includes('pressure') || testName.toLowerCase().includes('bp')) {
        targetMin = 90;
        targetMax = 120;
      } else if (testName.toLowerCase().includes('hemoglobin')) {
        targetMin = 13.0;
        targetMax = 17.5;
      }

      trends.push({
        testName,
        category: 'Self-Monitored',
        unit,
        normalRange: `Target: ${targetMin} - ${targetMax} ${unit}`,
        targetMin,
        targetMax,
        currentValue: value,
        currentStatus: status,
        trendDirection: status === 'NORMAL' ? 'stable' : 'worsening',
        aiInsight: `Manual daily reading recorded for ${testName}.`,
        points: [{
          date: today,
          timestamp: Date.now(),
          value,
          unit,
          status,
          facility: 'Home Self-Monitoring'
        }]
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trends));

      if (isSupabaseConfigured && supabase) {
        const profile = this.getPatientProfile();
        supabase.from('lab_observations').insert({
          id: `obs-manual-${Date.now()}`,
          user_id: profile.id,
          test_name: testName,
          measured_value: value,
          unit,
          status,
          observation_date: today,
          clinical_interpretation: 'Home Self-Monitoring Log'
        }).then(({ error }) => {
          if (error) console.warn('Supabase manual observation sync error:', error.message);
        });
      }
    }
  }

  /**
   * Updates vital trends series dynamically with newly uploaded lab observations
   */
  private static updateTrendsWithObservations(doc: MedicalDocument): void {
    const trends = this.getVitalTrends();

    doc.labObservations.forEach((obs) => {
      const match = trends.find((t) => 
        t.testName.toLowerCase().includes(obs.testName.toLowerCase()) || 
        obs.testName.toLowerCase().includes(t.testName.toLowerCase())
      );

      if (match) {
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
      } else {
        trends.push({
          testName: obs.testName,
          category: obs.category || 'Laboratory',
          unit: obs.unit,
          normalRange: obs.referenceRangeString || `${obs.referenceLow || ''} - ${obs.referenceHigh || ''} ${obs.unit}`,
          targetMin: obs.referenceLow,
          targetMax: obs.referenceHigh,
          currentValue: obs.value,
          currentStatus: obs.status,
          trendDirection: obs.status === 'NORMAL' ? 'stable' : 'worsening',
          aiInsight: obs.clinicalMeaning || `Extracted from ${doc.title}`,
          points: [{
            date: doc.date,
            timestamp: new Date(doc.date).getTime(),
            value: obs.value,
            unit: obs.unit,
            status: obs.status,
            facility: doc.facilityName || 'Diagnostic Lab'
          }]
        });
      }
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRENDS, JSON.stringify(trends));
    }
  }

  /**
   * Resets data to initial sample states
   */
  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.TRENDS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_MEDS);
    const defaultPat = { ...DEFAULT_PATIENT, isAbhaVerified: false };
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(defaultPat));
  }
}
