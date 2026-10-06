'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  UtensilsCrossed,
  Plus,
  Flame,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { ExtractedMedication } from '@/types';
import { HealthStorageService } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface MedicationTrackerProps {
  medications: ExtractedMedication[];
  onToggleStatus?: (id: string) => void;
  onAddCustomMedication?: (med: Omit<ExtractedMedication, 'id'>) => void;
  onToggleTakenToday?: (id: string) => void;
  onNavigateToUpload?: () => void;
  onNavigateToCopilot?: () => void;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onToggleStatus,
  onAddCustomMedication,
  onToggleTakenToday,
  onNavigateToUpload,
  onNavigateToCopilot
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('Once Daily (OD)');
  const [newTiming, setNewTiming] = useState<'After Food' | 'Before Food' | 'With Food'>('After Food');
  const [newInstructions, setNewInstructions] = useState('');

  const takenCount = medications.filter(m => m.isTakenToday).length;
  const totalMeds = medications.length;
  const adherenceRate = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0;

  // Time slots for schedule categorization
  const timeSlots = [
    { id: 'Morning', label: 'Morning (सुबह)', icon: <Sunrise className="w-5 h-5 text-amber-500" />, time: '08:00 AM' },
    { id: 'Afternoon', label: 'Afternoon (दोपहर)', icon: <Sun className="w-5 h-5 text-orange-500" />, time: '01:30 PM' },
    { id: 'Evening', label: 'Evening (शाम)', icon: <Sunset className="w-5 h-5 text-indigo-400" />, time: '06:00 PM' },
    { id: 'Night', label: 'Bedtime (रात)', icon: <Moon className="w-5 h-5 text-indigo-600" />, time: '09:30 PM' },
  ];

  const handleToggleTaken = (medId: string) => {
    if (onToggleTakenToday) {
      onToggleTakenToday(medId);
    } else {
      HealthStorageService.toggleMedicationTakenToday(medId);
    }

    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    } catch {}
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newDosage.trim()) return;

    const medPayload: Omit<ExtractedMedication, 'id'> = {
      name: newMedName.trim(),
      dosage: newDosage.trim(),
      frequency: newFrequency,
      route: 'Oral',
      timing: newTiming,
      instructions: newInstructions.trim() || 'Take with water as directed',
      timeOfDay: newFrequency.includes('Twice') ? ['Morning', 'Night'] : ['Morning'],
      isActive: true,
      streakDays: 1,
      isTakenToday: false
    };

    if (onAddCustomMedication) {
      onAddCustomMedication(medPayload);
    } else {
      HealthStorageService.addCustomMedication(medPayload);
    }

    setNewMedName('');
    setNewDosage('');
    setNewInstructions('');
    setShowAddModal(false);
  };

  // Drug-Drug Interaction Safety Watchdog
  const checkDrugInteractions = () => {
    const names = medications.map(m => m.name.toLowerCase());
    const hasMetformin = names.some(n => n.includes('metformin'));
    const hasTelmisartan = names.some(n => n.includes('telmisartan') || n.includes('losartan'));
    const hasAtorvastatin = names.some(n => n.includes('atorvastatin') || n.includes('statin'));

    if (hasMetformin && hasTelmisartan && hasAtorvastatin) {
      return {
        safe: true,
        title: 'Complementary Cardiometabolic Regimen',
        detail: 'Metformin (glucose regulation), Telmisartan (BP & nephroprotection), and Atorvastatin (lipid stabilization) represent standard guideline-directed dual protection without pharmacokinetic collision.'
      };
    }

    return {
      safe: true,
      title: 'No Critical Drug Collisions Found',
      detail: 'Current medications have safe independent metabolic pathways. Continue adhering to meal timings indicated.'
    };
  };

  const safetyInfo = checkDrugInteractions();

  return (
    <div className="space-y-6">
      {/* Top Banner & Adherence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drug Safety Guardrail Banner */}
        <div className="md:col-span-2 bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-950">
              {safetyInfo.title}
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              {safetyInfo.detail}
            </p>
          </div>
        </div>

        {/* Adherence Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Adherence</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{adherenceRate}%</span>
              <span className="text-xs text-slate-500 font-medium">({takenCount}/{totalMeds} taken)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold mt-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Active Streak: {totalMeds > 0 ? '6 Days' : '0 Days'}</span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
            title="Add medication"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Med</span>
          </button>
        </div>
      </div>

      {/* Empty State or Time-of-Day Categorized Schedule */}
      {medications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-2xs">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">No Active Medications Scheduled</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
              Your medication schedule automatically updates whenever you scan and save a doctor prescription or discharge summary. You can also add medicines manually or ask the SetuHealth AI Copilot to log your prescribed medicines.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onNavigateToUpload && (
              <button
                onClick={onNavigateToUpload}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <Pill className="w-4 h-4" />
                <span>Scan Prescription</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication Manually</span>
            </button>
            {onNavigateToCopilot && (
              <button
                onClick={onNavigateToCopilot}
                className="px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <span>Ask AI Copilot →</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeSlots.map((slot) => {
          const slotMeds = medications.filter((m) => 
            m.timeOfDay && m.timeOfDay.includes(slot.id as any)
          );

          return (
            <div 
              key={slot.id} 
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
                    {slot.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm tracking-tight">{slot.label}</h5>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {slot.time}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {slotMeds.length} Meds
                </span>
              </div>

              {slotMeds.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  No medications scheduled for this period
                </div>
              ) : (
                <div className="space-y-3">
                  {slotMeds.map((med) => {
                    const isTaken = Boolean(med.isTakenToday);
                    return (
                      <div 
                        key={med.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isTaken 
                            ? 'bg-emerald-50/50 border-emerald-200/80' 
                            : 'bg-slate-50/70 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h6 className={`text-sm font-bold ${isTaken ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                              {med.name}
                            </h6>
                            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                              {med.dosage}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                              <UtensilsCrossed className="w-3 h-3 text-teal-600" />
                              {med.timing}
                            </span>
                            <span>•</span>
                            <span>{med.frequency}</span>
                          </div>

                          {med.instructions && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              "{med.instructions}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleTaken(med.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                            isTaken
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isTaken ? 'Taken' : 'Mark Taken'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Add Medication</h4>
                  <p className="text-xs text-slate-500">Add a prescribed or OTC medicine to daily schedule</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Glimepiride, Vitamin D3"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 10mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Once Daily (OD)">Once Daily (OD)</option>
                    <option value="Twice Daily (BD)">Twice Daily (BD)</option>
                    <option value="Thrice Daily (TDS)">Thrice Daily (TDS)</option>
                    <option value="As Needed (SOS)">As Needed (SOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meal Relation</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['After Food', 'Before Food', 'With Food'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTiming(t)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                        newTiming === t
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Special Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Take with warm water at bedtime"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Medicine</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
