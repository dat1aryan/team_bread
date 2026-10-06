'use client';

// Mock ABHA ID verification, ABDM Health Card QR, & HL7 FHIR R4 Inspector

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Download, 
  Building2, 
  CheckCircle2, 
  Copy, 
  KeyRound, 
  FileCode2, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
  Clock,
  Layers,
  Lock
} from 'lucide-react';
import { PatientProfile, MedicalDocument } from '@/types';
import { MOCK_ABHA_PROFILE, generateFhirR4Bundle, verifyAbhaOtp } from '@/lib/abdm-fhir';
import confetti from 'canvas-confetti';

interface AbdmAbhaHubProps {
  patient: PatientProfile;
  documents: MedicalDocument[];
  onAbhaVerified: (abhaNumber: string, abhaAddress: string) => void;
}

const MOCK_HOSPITALS = [
  { id: 'hip-aiims', name: 'AIIMS (All India Institute of Medical Sciences)', city: 'New Delhi', hipId: 'IN-DL-AIIMS-001', state: 'Delhi', recordsCount: 14, type: 'Apex Public Referral' },
  { id: 'hip-apollo', name: 'Apollo Hospitals, Greams Road', city: 'Chennai', hipId: 'IN-TN-APOLLO-042', state: 'Tamil Nadu', recordsCount: 8, type: 'Super Speciality' },
  { id: 'hip-max', name: 'Max Super Speciality Hospital, Saket', city: 'New Delhi', hipId: 'IN-DL-MAX-019', state: 'Delhi', recordsCount: 6, type: 'Tertiary Care' },
  { id: 'hip-fortis', name: 'Fortis Memorial Research Institute (FMRI)', city: 'Gurugram', hipId: 'IN-HR-FORTIS-007', state: 'Haryana', recordsCount: 9, type: 'Multi-Speciality' },
  { id: 'hip-manipal', name: 'Manipal Hospital, Old Airport Road', city: 'Bengaluru', hipId: 'IN-KA-MANIPAL-012', state: 'Karnataka', recordsCount: 5, type: 'Quaternary Care' },
  { id: 'hip-tmc', name: 'Tata Memorial Centre (Advanced Oncology)', city: 'Mumbai', hipId: 'IN-MH-TMC-003', state: 'Maharashtra', recordsCount: 11, type: 'National Cancer Institute' },
  { id: 'hip-medanta', name: 'Medanta - The Medicity', city: 'Gurugram', hipId: 'IN-HR-MEDANTA-015', state: 'Haryana', recordsCount: 7, type: 'Multi-Super Speciality' },
  { id: 'hip-lalpath', name: 'Dr. Lal PathLabs Central Reference Lab', city: 'National Network', hipId: 'IN-DL-LALPATH-088', state: 'Pan-India', recordsCount: 12, type: 'Diagnostic & Pathology Network' }
];

export const AbdmAbhaHub: React.FC<AbdmAbhaHubProps> = ({
  patient,
  documents,
  onAbhaVerified
}) => {
  const [abhaInput, setAbhaInput] = useState(patient.abhaId || '91-2048-5892-1144');
  const [otpInput, setOtpInput] = useState('849201');
  const [consentChecked, setConsentChecked] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Hospital dropdown selector state
  const [selectedHospitalId, setSelectedHospitalId] = useState(MOCK_HOSPITALS[0].id);
  const [linkedHospitals, setLinkedHospitals] = useState(MOCK_HOSPITALS.slice(0, 3));
  const [linkSuccessMsg, setLinkSuccessMsg] = useState('');

  // HL7 FHIR Abstract vs Raw JSON toggle
  const [showRawJson, setShowRawJson] = useState(false);

  // Generate FHIR bundle from current primary document or baseline patient bundle
  const sampleDoc = documents[0];
  const fhirBundle = sampleDoc 
    ? generateFhirR4Bundle(sampleDoc, patient) 
    : {
        resourceType: 'Bundle',
        id: `abdm-bundle-${patient.id}`,
        meta: { lastUpdated: new Date().toISOString() },
        identifier: { system: 'https://healthid.ndhm.gov.in', value: patient.abhaId || '91-2048-5892-1144' },
        type: 'document',
        timestamp: new Date().toISOString(),
        total: 7,
        entry: [
          { fullUrl: `urn:uuid:patient-${patient.id}`, resource: { resourceType: 'Patient', id: patient.id, name: [{ text: patient.fullName }], gender: patient.gender } },
          { fullUrl: 'urn:uuid:comp-001', resource: { resourceType: 'Composition', status: 'final', title: 'Personal Health Record Index' } }
        ]
      };

  const handleStartVerification = () => {
    setShowKycModal(true);
    setOtpInput('849201'); // Pre-fill sample OTP for convenience
  };

  const handleConfirmKyc = async () => {
    if (!consentChecked) return;
    setIsVerifying(true);
    const res = await verifyAbhaOtp(abhaInput, otpInput);
    setIsVerifying(false);

    if (res.success && res.profile) {
      setVerifySuccessMsg(res.message);
      setShowKycModal(false);
      onAbhaVerified(res.profile.abhaNumber, res.profile.abhaAddress);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleLinkHospital = () => {
    const hosp = MOCK_HOSPITALS.find(h => h.id === selectedHospitalId);
    if (!hosp) return;

    if (!linkedHospitals.some(lh => lh.id === hosp.id)) {
      setLinkedHospitals(prev => [hosp, ...prev]);
      setLinkSuccessMsg(`Linked ${hosp.name} to your ABHA profile!`);
    } else {
      setLinkSuccessMsg(`${hosp.name} is already linked.`);
    }

    setTimeout(() => setLinkSuccessMsg(''), 3000);
  };

  const handleCopyAbha = () => {
    navigator.clipboard.writeText(patient.abhaId || '91-2048-5892-1144');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFhir = () => {
    if (!fhirBundle) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ABDM_FHIR_Bundle_${patient.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isVerified = patient.isAbhaVerified;

  return (
    <div className="space-y-6">
      
      {/* ABDM Overview Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Ayushman Bharat Digital Mission (ABDM) M4 Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ABDM & ABHA Digital Health Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Seamlessly linked to India's national health interoperability network. Records are converted to HL7 FHIR R4 standard bundles ready for exchange across ABDM Health Information Providers (HIPs).
          </p>
        </div>
      </div>

      {/* ABHA Digital Health Card & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ABHA Digital Health Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200">
                  NATIONAL HEALTH AUTHORITY
                </span>
                <h4 className="text-lg font-extrabold tracking-tight">ABHA Digital Health Card</h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2">
              <div>
                <span className="text-[10px] text-teal-100 uppercase font-semibold">ABHA Number</span>
                <div className="text-lg font-mono font-bold tracking-wider flex items-center justify-between">
                  <span>{patient.abhaId || '91-2048-5892-1144'}</span>
                  <button onClick={handleCopyAbha} className="p-1 hover:bg-white/20 rounded transition-colors" title="Copy ABHA">
                    <Copy className="w-4 h-4 text-teal-200" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-teal-100 uppercase font-semibold">ABHA Address (PHR)</span>
                <div className="text-xs font-mono font-semibold text-white">
                  {patient.abhaAddress || 'rajesh.kumar@abdm'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-teal-200 text-[10px]">Name</span>
                <p className="font-bold">{patient.fullName}</p>
              </div>
              <div>
                <span className="text-teal-200 text-[10px]">DOB / Gender</span>
                <p className="font-bold">{patient.dateOfBirth} / M</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-3 border-t border-white/20 mt-4">
            <div className="flex items-center justify-between">
              {isVerified ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    KYC Verified & Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                    KYC Verification Pending
                  </span>
                </div>
              )}

              {/* Mock QR Code */}
              <div className="p-1.5 rounded-lg bg-white text-slate-900 shadow-sm shrink-0">
                <QrCode className="w-9 h-9" />
              </div>
            </div>

            {/* KYC Verification Action Button */}
            {!isVerified && (
              <button
                onClick={handleStartVerification}
                className="w-full py-2.5 px-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                <span>Verify KYC & Confirm Aadhaar</span>
              </button>
            )}
          </div>
        </div>

        {/* Linked ABDM Facilities (HIP Network) with Dropdown Selector */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connected ABDM Hospital Repositories (HIPs)
              </h3>
              <p className="text-xs text-slate-500">
                NHA Health Information Providers linked to your ABHA for automated bidirectional record exchange
              </p>
            </div>
            
            <button
              onClick={handleStartVerification}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                isVerified 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
              }`}
            >
              {isVerified ? 'Re-Verify KYC' : 'Complete KYC Verification'}
            </button>
          </div>

          {/* Dropdown Menu of Mock Hospitals to Select From */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <label className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                Select Hospital / Diagnostic Network to Link
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl bg-white border border-teal-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {MOCK_HOSPITALS.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} — {hosp.city} [{hosp.hipId}]
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={handleLinkHospital}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Selected Hospital</span>
              </button>
            </div>

            {linkSuccessMsg && (
              <div className="text-xs font-semibold text-teal-800 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>{linkSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* List of currently linked facilities */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Linked Repositories ({linkedHospitals.length})
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {linkedHospitals.map((fac) => (
                <div 
                  key={fac.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-2xs shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">{fac.name}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono text-teal-700">{fac.hipId}</span>
                        <span>•</span>
                        <span>{fac.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Linked
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {fac.recordsCount} records synced
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <strong>ABDM Consent Management:</strong> All records are accessed strictly via patient consent tokens adhering to NHA Electronic Health Record (EHR) guidelines.
          </div>
        </div>

      </div>

      {/* HL7 FHIR R4 Standard Data Bundle Inspector (Data Abstract by Default, Reveals JSON on Click) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                HL7 FHIR R4 Standard Data Bundle Inspector
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                NHA ABDM M4 Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Abstract architectural overview of clinical entities structured into HL7 FHIR Release 4 standard resources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-semibold border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
            >
              {showRawJson ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4 text-indigo-600" />}
              <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect Raw FHIR JSON'}</span>
            </button>

            <button
              onClick={handleDownloadFhir}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Abstract FHIR Data Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">FHIR Standard Version</span>
            <div className="text-sm font-bold text-slate-900">HL7 FHIR R4 (v4.0.1)</div>
            <p className="text-[11px] text-slate-500">ABDM NRCeS Profile Specification</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bundle Structure</span>
            <div className="text-sm font-bold text-slate-900">Document Bundle</div>
            <p className="text-[11px] text-slate-500">Rooted at Composition Resource</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security & Encryption</span>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1 text-emerald-700">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>JWS Token Signed</span>
            </div>
            <p className="text-[11px] text-slate-500">SHA-256 Digest Validation</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ABDM Gateway Status</span>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>M4 Milestone Ready</span>
            </div>
            <p className="text-[11px] text-slate-500">HIP / HIU Node Interoperable</p>
          </div>
        </div>

        {/* Abstract Resource Mapping Chips */}
        <div className="p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Abstract Bundle Resource Breakdown</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Resources: 7 Standard Types
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">Composition</span>
                <p className="text-[10px] text-slate-400">Clinical header & section trees</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">1</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">Patient</span>
                <p className="text-[10px] text-slate-400">ABHA-linked demographics</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">1</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">Practitioner</span>
                <p className="text-[10px] text-slate-400">Attending doctor credentials</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">1</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">Organization</span>
                <p className="text-[10px] text-slate-400">Issuing hospital / lab HIP code</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">1</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">Observation</span>
                <p className="text-[10px] text-slate-400">LOINC biomarker data points</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                {sampleDoc?.labObservations?.length || 4}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 font-mono">MedicationRequest</span>
                <p className="text-[10px] text-slate-400">RxNorm prescription orders</p>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                {sampleDoc?.medications?.length || 3}
              </span>
            </div>
          </div>
        </div>

        {/* Raw JSON viewer: ONLY displayed when user clicks button */}
        {showRawJson && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
              <span>Full Validated HL7 FHIR R4 JSON Payload</span>
              <button 
                onClick={() => setShowRawJson(false)} 
                className="text-indigo-600 hover:underline cursor-pointer"
              >
                Close Raw View
              </button>
            </div>
            <div className="rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
              <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Mock Aadhaar / ABDM KYC Verification Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">ABDM Aadhaar e-KYC Verification</h3>
              <p className="text-xs text-slate-500">
                Authenticate your identity with NHA to confirm your ABHA Digital Health Card and unlock ABDM record sharing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Beneficiary:</span>
                  <span className="font-bold text-slate-900">{patient.fullName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Linked Mobile:</span>
                  <span className="font-mono text-slate-900">{patient.phone || '+91 98765 43210'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">ABHA Number</label>
                <input
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">6-Digit Aadhaar / ABDM OTP</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-mono tracking-widest text-center font-bold outline-none focus:border-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block text-center">
                  Simulation code pre-filled for instant verification
                </span>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I give consent to NHA and SetuHealth to verify my identity via Aadhaar OTP and link my health records under ABDM guidelines.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowKycModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKyc}
                disabled={isVerifying || !consentChecked}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Confirm & Verify KYC</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
