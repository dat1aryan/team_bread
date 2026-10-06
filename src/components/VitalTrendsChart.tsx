'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Info, 
  Activity,
  Heart,
  Droplet,
  ShieldAlert,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';
import { VitalTrendSeries, TestStatus } from '@/types';
import confetti from 'canvas-confetti';

interface VitalTrendsChartProps {
  seriesList: VitalTrendSeries[];
  onLogVital?: (testName: string, value: number, unit: string, status: TestStatus) => void;
  onNavigateToUpload?: () => void;
}

export const VitalTrendsChart: React.FC<VitalTrendsChartProps> = ({ 
  seriesList,
  onLogVital,
  onNavigateToUpload
}) => {
  const [selectedTestName, setSelectedTestName] = useState<string>(
    seriesList[0]?.testName || 'HbA1c (Glycated Hemoglobin)'
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [logValue, setLogValue] = useState('');
  const [customTestName, setCustomTestName] = useState('Fasting Blood Sugar (FBS)');

  const currentSeries = seriesList.find((s) => s.testName === selectedTestName) || seriesList[0];

  const getTrendIcon = (direction: VitalTrendSeries['trendDirection']) => {
    switch (direction) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-emerald-600" />;
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-rose-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'NORMAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Normal Range</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Elevated (High)</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">Critical</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Below Normal (Low)</span>;
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(logValue);
    if (isNaN(val) || val <= 0) return;

    let unit = 'mg/dL';
    let status: TestStatus = 'NORMAL';

    if (customTestName.includes('HbA1c')) {
      unit = '%';
      status = val > 6.4 ? 'HIGH' : val >= 5.7 ? 'HIGH' : 'NORMAL';
    } else if (customTestName.includes('Fasting')) {
      unit = 'mg/dL';
      status = val > 125 ? 'HIGH' : val > 99 ? 'HIGH' : 'NORMAL';
    } else if (customTestName.includes('Pressure')) {
      unit = 'mmHg';
      status = val > 140 ? 'CRITICAL' : val > 120 ? 'HIGH' : 'NORMAL';
    } else if (customTestName.includes('Hemoglobin')) {
      unit = 'g/dL';
      status = val < 13 ? 'LOW' : 'NORMAL';
    }

    if (onLogVital) {
      onLogVital(customTestName, val, unit, status);
    }

    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setLogValue('');
    setShowLogModal(false);
  };

  // Clean empty state if no lab reports have been scanned or logged yet
  if (!currentSeries || seriesList.length === 0 || !currentSeries.points || currentSeries.points.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-sm space-y-5 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-2xs">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900">No Vital Trends Recorded Yet</h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Your biomarker trends (such as HbA1c, Fasting Blood Sugar, Blood Pressure, and LDL) will automatically be generated in parallel when you scan and analyze a laboratory pathology report from the 'Scan & Analyze Record' tab.
          </p>
        </div>
      </div>
    );
  }

  const chartData = currentSeries.points.map((p) => ({
    date: p.date,
    value: p.value,
    status: p.status,
    facility: p.facility,
    unit: p.unit
  }));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Biomarker Trends & Analytics</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              Live Charts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical laboratory observation trajectories with target clinical boundaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {seriesList.map((series) => (
              <button
                key={series.testName}
                onClick={() => setSelectedTestName(series.testName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTestName === series.testName
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {series.testName.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Reading</span>
          </button>
        </div>
      </div>

      {/* Primary Metric Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Observed Metric</div>
          <div className="text-base font-extrabold text-slate-900 mt-0.5 truncate">{currentSeries.testName}</div>
          <div className="text-xs text-slate-500">{currentSeries.category}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latest Reading</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black text-slate-900">{currentSeries.currentValue}</span>
            <span className="text-xs font-semibold text-slate-500">{currentSeries.unit}</span>
          </div>
          <div className="mt-1">{getStatusBadge(currentSeries.currentStatus)}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Clinical Range</div>
          <div className="text-sm font-bold text-slate-700 mt-1">{currentSeries.normalRange}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bound: {currentSeries.targetMin} - {currentSeries.targetMax} {currentSeries.unit}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trajectory Status</div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 mt-1 capitalize">
            {getTrendIcon(currentSeries.trendDirection)}
            <span>{currentSeries.trendDirection} Trend</span>
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-0.5">{currentSeries.points.length} logged data points</div>
        </div>
      </div>

      {/* Dynamic Recharts Graph */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-slate-300">{data.date}</div>
                      <div className="text-base font-extrabold text-teal-300">
                        {data.value} {data.unit}
                      </div>
                      <div className="text-slate-400 text-[10px]">{data.facility}</div>
                      <div className="pt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          data.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {data.status}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={currentSeries.targetMax} 
              stroke="#F43F5E" 
              strokeDasharray="4 4" 
              label={{ value: `Max Safe: ${currentSeries.targetMax}`, fill: '#F43F5E', fontSize: 10, position: 'insideTopRight' }} 
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0D9488"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#0F766E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Clinical Insight Box */}
      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-teal-900">Clinical Trajectory Interpretation</div>
          <div className="text-teal-800 leading-relaxed">{currentSeries.aiInsight}</div>
        </div>
      </div>

      {/* Log Vital Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Log Health Reading</h4>
                  <p className="text-xs text-slate-500">Record a self-monitored vital into your timeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Biomarker</label>
                <select
                  value={customTestName}
                  onChange={(e) => setCustomTestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Fasting Blood Sugar (FBS)">Fasting Blood Sugar (FBS, mg/dL)</option>
                  <option value="Post-Prandial Blood Sugar (PPBS)">Post-Meal Blood Sugar (PPBS, mg/dL)</option>
                  <option value="HbA1c (Glycated Hemoglobin)">HbA1c (% Glycated Hemoglobin)</option>
                  <option value="Systolic Blood Pressure">Systolic Blood Pressure (mmHg)</option>
                  <option value="Hemoglobin">Hemoglobin (g/dL)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Value Recorded</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 145"
                  value={logValue}
                  onChange={(e) => setLogValue(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Reading</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
