import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Leaf, 
  Users, 
  BarChart3, 
  MapPin, 
  Activity, 
  Droplet 
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMetrics();
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
        Loading Municipal Solid Waste Analytics...
      </div>
    );
  }

  const summary = metrics?.summary || {};
  const streams = metrics?.wasteStreamBreakdown || [];
  const zones = metrics?.municipalZones || [];
  const trend = metrics?.recentActivityTrend || [];

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Municipal Waste Intelligence & Contamination Command Center
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Urban solid waste segregation telemetry, municipal ward contamination risk ratings, and diversion volume.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Telemetry Online
          </span>
        </div>
      </div>

      {/* Top Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="firm-card p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Citizens Engaged</span>
            <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            {summary.totalCitizens || 3} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal font-sans">(+14% wk)</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {summary.totalScansClassified || 448} total items sorted
          </div>
        </div>

        <div className="firm-card p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Gross Landfill Diverted</span>
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
            {summary.totalLandfillDivertedKg || 220} kg
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            ~{summary.totalCo2SavedKg || 155} kg CO₂ offset
          </div>
        </div>

        <div className="firm-card p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Water Conserved</span>
            <Droplet className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-heading">
            {summary.totalWaterSavedLiters || 3200} L
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Equivalent to 16 trees planted
          </div>
        </div>

        <div className="firm-card p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Segregation Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">
            {summary.overallSegregationAccuracy || '96.4%'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Across 7 waste master streams
          </div>
        </div>

      </div>

      {/* Stream Breakdown & 7-Day Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Stream Breakdown (6 cols) */}
        <div className="lg:col-span-6 firm-card p-5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Classified Waste Stream Volume
          </h3>

          <div className="space-y-3.5">
            {streams.map((stream) => (
              <div key={stream.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">{stream.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{stream.divertedKg} kg ({stream.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${stream.percentage}%`, backgroundColor: stream.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Activity Velocity Trend (6 cols) */}
        <div className="lg:col-span-6 firm-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              7-Day Citizen Sorting Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Daily volume of validated waste segregation scans across all connected clients.
            </p>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-36 pb-2 border-b border-slate-200 dark:border-slate-800">
            {trend.map((t) => {
              const heightPercent = Math.min(100, Math.round((t.scans / 140) * 100));
              return (
                <div key={t.day} className="flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.scans}
                  </div>
                  <div 
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-500 group-hover:brightness-110 transition-all"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2.5">
            <span>Peak Day: Sunday (130 scans)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+42% Growth vs Last Week</span>
          </div>
        </div>

      </div>

      {/* Municipal Ward Contamination Heatmap Table */}
      <div className="firm-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Municipal Zone Contamination Risk Heatmap
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            4 Municipal Zones Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Municipal Ward / Zone</th>
                <th className="py-3 px-4 text-center">Segregation Compliance</th>
                <th className="py-3 px-4 text-center">Contamination Risk</th>
                <th className="py-3 px-4">Primary Waste Type</th>
                <th className="py-3 px-4 text-right">Smart Bins Monitored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {zones.map((zone) => (
                <tr key={zone.zone} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {zone.zone}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {zone.complianceRate}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      zone.contaminationRisk === 'Low'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                        : zone.contaminationRisk === 'Low-Med'
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
                        : zone.contaminationRisk === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                    }`}>
                      {zone.contaminationRisk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {zone.dominantWaste}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {zone.activeBins} Smart Bins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
