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
  ShieldAlert
} from 'lucide-react';
import { VitalTrendSeries, TestStatus } from '@/types';

interface VitalTrendsChartProps {
  seriesList: VitalTrendSeries[];
}

export const VitalTrendsChart: React.FC<VitalTrendsChartProps> = ({ seriesList }) => {
  const [selectedTestName, setSelectedTestName] = useState<string>(
    seriesList[0]?.testName || 'HbA1c (Glycated Hemoglobin)'
  );

  const currentSeries = seriesList.find((s) => s.testName === selectedTestName) || seriesList[0];

  if (!currentSeries) return null;

  const chartData = currentSeries.points.map((p) => ({
    date: p.date,
    value: p.value,
    status: p.status,
    facility: p.facility,
    unit: p.unit
  }));

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
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Elevated</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Low</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">Critical Alert</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Normal</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {seriesList.map((series) => (
          <button
            key={series.testName}
            onClick={() => setSelectedTestName(series.testName)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedTestName === series.testName
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>{series.testName.split(' ')[0]}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedTestName === series.testName ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {series.currentValue} {series.unit}
            </span>
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Metric Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>{currentSeries.category}</span>
              <span>•</span>
              <span>Reference Range: {currentSeries.normalRange}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {currentSeries.testName}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Latest Measurement</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentSeries.currentValue} <span className="text-sm font-semibold text-slate-500">{currentSeries.unit}</span>
              </div>
            </div>
            <div>
              {getStatusBadge(currentSeries.currentStatus)}
            </div>
          </div>
        </div>

        {/* Recharts SVG Line Visualization */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-slate-200">{data.date}</div>
                        <div className="text-sm font-extrabold text-teal-400">
                          {data.value} {data.unit}
                        </div>
                        <div className="text-slate-400">{data.facility}</div>
                        <div className="text-[10px] uppercase font-semibold text-slate-300">
                          Status: {data.status}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Clinical Target Line */}
              {currentSeries.targetMax && (
                <ReferenceLine 
                  y={currentSeries.targetMax} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  label={{ value: `Target < ${currentSeries.targetMax}`, fill: '#10b981', fontSize: 11, position: 'insideTopRight' }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0d9488" 
                strokeWidth={3}
                dot={{ fill: '#0d9488', r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#0f766e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Longitudinal Trend Commentary */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-teal-950">
                AI Longitudinal Trend Analysis
              </h4>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-teal-100">
                {getTrendIcon(currentSeries.trendDirection)}
                <span className="capitalize">{currentSeries.trendDirection}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
              {currentSeries.aiInsight}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
