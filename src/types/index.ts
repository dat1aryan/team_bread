// Aligned with ABDM (Ayushman Bharat Digital Mission) & HL7 FHIR R4

export type LanguageCode = 'en' | 'hi' | 'te' | 'ta' | 'bn' | 'mr' | 'es';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export type DocumentType = 
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'DISCHARGE_SUMMARY'
  | 'DIAGNOSTIC_IMAGING'
  | 'OTHER';

export type ClinicalUrgency = 
  | 'ROUTINE'
  | 'MONITOR'
  | 'CONSULT_SOON'
  | 'IMMEDIATE_CARE';

export type TestStatus = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';

export interface PatientProfile {
  id: string;
  fullName: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  bloodGroup: string;
  phone: string;
  emergencyContact: string;
  preferredLanguage: LanguageCode;
  abhaId?: string;
  abhaAddress?: string;
  isAbhaVerified: boolean;
}

export interface ExtractedMedication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "Twice Daily (BD)"
  route: string; // e.g. "Oral"
  timing: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  duration?: string; // e.g. "30 days"
  instructions?: string;
  timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[];
  isActive: boolean;
  isTakenToday?: boolean;
  lastTakenDate?: string;
  streakDays?: number;
}

export interface ExtractedLabObservation {
  id: string;
  testName: string;
  category: string; // e.g. "Glycemic Control", "Lipid Profile", "Complete Blood Count"
  value: number;
  valueString?: string;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  referenceRangeString: string;
  status: TestStatus;
  loincCode?: string;
  clinicalMeaning: string;
  date: string;
}

export interface ClinicalDiagnosis {
  id: string;
  condition: string;
  icd10Code?: string;
  clinicalStatus: 'Active' | 'Resolved' | 'Chronic';
  notes?: string;
}

export interface PlainLanguageSummary {
  headline: string;
  simpleExplanation: string;
  whyItMatters: string;
  urgencyLevel: ClinicalUrgency;
  urgencyReason: string;
  keyActionItems: string[];
  dietAndLifestyleTips: string[];
  questionsForDoctor: string[];
  flaggedAbnormalities: {
    testName: string;
    value: string;
    status: TestStatus;
    plainExplanation: string;
    advice: string;
  }[];
}

export interface MedicalDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  documentType: DocumentType;
  date: string;
  doctorName?: string;
  facilityName?: string;
  rawOcrText: string;
  aiSummary: PlainLanguageSummary;
  medications: ExtractedMedication[];
  labObservations: ExtractedLabObservation[];
  diagnoses: ClinicalDiagnosis[];
  fhirBundle?: Record<string, any>;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  documentId?: string;
  eventType: 'PRESCRIPTION' | 'LAB_RESULT' | 'DISCHARGE' | 'DOCTOR_VISIT' | 'AI_INSIGHT';
  title: string;
  facilityName: string;
  doctorName?: string;
  date: string;
  summary: string;
  highlights: string[];
  urgencyLevel: ClinicalUrgency;
  metricsCount: {
    meds: number;
    tests: number;
    abnormal: number;
  };
}

export interface VitalTrendPoint {
  date: string;
  timestamp: number;
  value: number;
  unit: string;
  status: TestStatus;
  facility: string;
  targetMin?: number;
  targetMax?: number;
}

export interface VitalTrendSeries {
  testName: string;
  category: string;
  unit: string;
  normalRange: string;
  targetMin?: number;
  targetMax?: number;
  currentValue: number;
  currentStatus: TestStatus;
  trendDirection: 'improving' | 'worsening' | 'stable';
  points: VitalTrendPoint[];
  aiInsight: string;
}

export interface AbhaProfileData {
  abhaNumber: string; // "91-2048-5892-1144"
  abhaAddress: string; // "rajesh.kumar@abdm"
  fullName: string;
  gender: string;
  dateOfBirth: string;
  kycVerified: boolean;
  linkedFacilities: {
    name: string;
    hipId: string;
    type: 'HOSPITAL' | 'DIAGNOSTIC_LAB' | 'CLINIC';
    recordsCount: number;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  sources?: string[];
  actionBadge?: string;
}
