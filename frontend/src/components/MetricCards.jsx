import React from 'react';
import { Droplet, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

export default function MetricCards({ telemetry, todayAggregate }) {
  const currentFlow = telemetry?.measured_data?.flow_rate_lpm ?? 0;
  const expectedFlow = telemetry?.ai_projections?.expected_flow_lpm ?? 0.3;
  const excessFlow = telemetry?.ai_projections?.estimated_excess_lpm ?? 0;
  const waterAtRisk = telemetry?.ai_projections?.estimated_daily_wastage_liters ?? 0;
  const confidence = telemetry?.ai_projections?.confidence_score ?? 95;
  const severity = telemetry?.ai_projections?.severity ?? 'NORMAL';
  const riskLevel = telemetry?.ai_projections?.risk_level ?? 'Low';

  const waterUsedToday = todayAggregate?.water_used_today_liters ?? 3520;
  const expectedToday = todayAggregate?.expected_today_liters ?? 3850;
  const activeAlertsCount = severity === 'NORMAL' ? 0 : 1;

  let borderHighlight = 'border-slate-700/80';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';

  if (severity === 'WARNING') {
    borderHighlight = 'border-amber-400/60 bg-amber-950/20';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/50';
  } else if (severity === 'HIGH_RISK') {
    borderHighlight = 'border-rose-400/60 bg-rose-950/20';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/50';
  } else if (severity === 'UNCERTAIN') {
    borderHighlight = 'border-purple-400/60 bg-purple-950/20';
    badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-400/50';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* CARD 1: Water Used Today */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl hover:border-cyan-500/50 transition">
        <div className="flex items-center justify-between text-slate-200 mb-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-cyan-200">
            Water Used Today
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300 border border-sky-400/30">
            <Droplet className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {waterUsedToday.toLocaleString()}
          </span>
          <span className="text-base font-bold text-cyan-300">Liters</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-700/80">
          <span className="font-semibold text-slate-200">
            Expected: <strong className="text-white">{expectedToday.toLocaleString()} L</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500">
            In Range
          </span>
        </div>
      </div>

      {/* CARD 2: Current Flow */}
      <div className={`glass-panel p-4 sm:p-5 rounded-2xl border-2 transition shadow-xl bg-slate-900/90 ${borderHighlight}`}>
        <div className="flex items-center justify-between text-slate-200 mb-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-cyan-200">
            Current Flow
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-400/30">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {currentFlow.toFixed(2)}
          </span>
          <span className="text-base font-bold text-cyan-300">L/min</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-700/80">
          <span className="font-semibold text-slate-200">
            Expected: <strong className="text-white">{expectedFlow.toFixed(2)} L/min</strong>
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
            {excessFlow > 0 ? `+${excessFlow.toFixed(2)} L/min` : 'Nominal'}
          </span>
        </div>
      </div>

      {/* CARD 3: Estimated Water at Risk */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl hover:border-amber-500/50 transition">
        <div className="flex items-center justify-between text-slate-200 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200">
              Water at Risk
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400 font-extrabold">
              AI ESTIMATE
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-400/30">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
            {waterAtRisk > 0 ? waterAtRisk.toLocaleString() : '0'}
          </span>
          <span className="text-base font-bold text-amber-300">L/day</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-700/80">
          <span className="font-semibold text-slate-200">
            {waterAtRisk > 0 ? `~${Math.round(waterAtRisk * 30).toLocaleString()} L/month` : '0 L/month excess'}
          </span>
          <span className="text-xs text-amber-300 font-medium">
            AI Projection
          </span>
        </div>
      </div>

      {/* CARD 4: Active Alerts */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl hover:border-indigo-500/50 transition">
        <div className="flex items-center justify-between text-slate-200 mb-2">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-200">
            Active Alerts
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {activeAlertsCount}
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-200">
            {activeAlertsCount === 1 ? 'Action Required' : 'All Clear'}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-700/80">
          <span className="font-semibold text-slate-200">Risk: <strong className="text-white">{riskLevel}</strong></span>
          <span className="font-extrabold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Confidence: {confidence}%
          </span>
        </div>
      </div>
    </div>
  );
}
