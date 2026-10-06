'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Stethoscope, 
  Activity, 
  Building2, 
  FileText, 
  Sparkles, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2
} from 'lucide-react';
import { TimelineEvent, MedicalDocument, ClinicalUrgency } from '@/types';

interface HealthTimelineProps {
  events: TimelineEvent[];
  documents: MedicalDocument[];
  onSelectDocument: (doc: MedicalDocument) => void;
  onNavigateToUpload?: () => void;
  onDeleteEvent?: (documentId: string) => void;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({
  events,
  documents,
  onSelectDocument,
  onNavigateToUpload,
  onDeleteEvent
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredEvents = events.filter((evt) => {
    const matchesType = filterType === 'ALL' || evt.eventType === filterType;
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.doctorName && evt.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEventIcon = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'PRESCRIPTION':
        return <Stethoscope className="w-5 h-5 text-indigo-600" />;
      case 'LAB_RESULT':
        return <Activity className="w-5 h-5 text-teal-600" />;
      case 'DISCHARGE':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-teal-700" />;
    }
  };

  const getUrgencyIndicator = (urgency: ClinicalUrgency) => {
    switch (urgency) {
      case 'IMMEDIATE_CARE':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Immediate Care" />;
      case 'CONSULT_SOON':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Consult Doctor Soon" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Routine Check" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search / Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timeline by doctor, hospital, or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm outline-none"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'LAB_RESULT', label: 'Lab Tests' },
            { id: 'PRESCRIPTION', label: 'Prescriptions' },
            { id: 'DISCHARGE', label: 'Hospital Discharges' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === item.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline Feed */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-2xs">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Your Health Journey Timeline is Ready</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
              No health records available yet. Scan and analyze a medical document from the 'Scan & Analyze Record' tab to automatically generate your chronological health journey timeline.
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No matching health records found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filter</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          
          {filteredEvents.map((evt) => {
            const correspondingDoc = documents.find((d) => d.id === evt.documentId);

            return (
              <div 
                key={evt.id}
                className="relative group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200"
              >
                {/* Timeline Node Point */}
                <div className="absolute -left-6 sm:-left-8 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-teal-500 shadow-sm flex items-center justify-center">
                  {getEventIcon(evt.eventType)}
                </div>

                {/* Event Card Content */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {evt.date}
                      </span>
                      {getUrgencyIndicator(evt.urgencyLevel)}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {evt.title}
                    </h4>

                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>{evt.facilityName}</span>
                      {evt.doctorName && <span>• {evt.doctorName}</span>}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed">
                      {evt.summary}
                    </p>

                    {/* Action Item Highlights */}
                    {evt.highlights && evt.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {evt.highlights.map((h, i) => (
                          <span 
                            key={i} 
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-100"
                          >
                            <span className="w-1 h-1 rounded-full bg-teal-500" />
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Metric Counter & Details Button */}
                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2 text-xs">
                      {evt.metricsCount.meds > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                          {evt.metricsCount.meds} Meds
                        </span>
                      )}
                      {evt.metricsCount.tests > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold">
                          {evt.metricsCount.tests} Tests
                        </span>
                      )}
                      {evt.metricsCount.abnormal > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold">
                          {evt.metricsCount.abnormal} Flagged
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {correspondingDoc && (
                        <button
                          onClick={() => onSelectDocument(correspondingDoc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                          title="View clinical analysis and breakdown"
                        >
                          <span>View Analysis</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteId === evt.id) {
                            onDeleteEvent?.(evt.documentId || evt.id.replace('evt-', ''));
                            setConfirmDeleteId(null);
                          } else {
                            setConfirmDeleteId(evt.id);
                            setTimeout(() => setConfirmDeleteId(prev => prev === evt.id ? null : prev), 4000);
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          confirmDeleteId === evt.id
                            ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                            : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50 border-slate-200 hover:border-rose-200'
                        }`}
                        title="Delete record from health journey timeline"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${confirmDeleteId === evt.id ? 'text-white' : 'text-slate-400 hover:text-rose-600'}`} />
                        <span>{confirmDeleteId === evt.id ? 'Confirm?' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};
