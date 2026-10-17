import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function LiveDashboardTab({ telemetry, historyData, onNavigateToDiagnostics }) {
  const currentFlow = telemetry?.measured_data?.flow_rate_lpm ?? 0;
  const expectedFlow = telemetry?.ai_projections?.expected_flow_lpm ?? 0.3;
  const excessFlow = telemetry?.ai_projections?.estimated_excess_lpm ?? 0;
  const dailyWastage = telemetry?.ai_projections?.estimated_daily_wastage_liters ?? 0;
  const monthlyWastage = telemetry?.ai_projections?.estimated_monthly_wastage_liters ?? 0;
  const severity = telemetry?.ai_projections?.severity ?? 'NORMAL';
  const statusLabel = telemetry?.ai_projections?.status_label ?? 'NORMAL';
  const confidence = telemetry?.ai_projections?.confidence_score ?? 95;
  const explanation = telemetry?.explanation ?? {};

  const diurnalProfileData = [
    { hour: '00:00', expected: 0.15, actual: 0.16 },
    { hour: '02:00', expected: 0.12, actual: 0.14 },
    { hour: '04:00', expected: 0.15, actual: 0.18 },
    { hour: '06:00', expected: 1.80, actual: 1.95 },
    { hour: '07:30', expected: 4.80, actual: 4.65 },
    { hour: '09:00', expected: 3.20, actual: 3.40 },
    { hour: '11:00', expected: 1.25, actual: 1.30 },
    { hour: '13:00', expected: 1.40, actual: 1.45 },
    { hour: '15:00', expected: 1.20, actual: 1.18 },
    { hour: '17:00', expected: 2.10, actual: 2.30 },
    { hour: '19:30', expected: 4.20, actual: 4.10 },
    { hour: '21:00', expected: 2.60, actual: 2.75 },
    { hour: '23:00', expected: 0.50, actual: currentFlow > 1 ? currentFlow : 0.52 }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner if Anomaly is detected */}
      {severity !== 'NORMAL' && (
        <div className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
          severity === 'HIGH_RISK'
            ? 'bg-rose-950/70 border-rose-400 text-rose-100'
            : severity === 'WARNING'
            ? 'bg-amber-950/70 border-amber-400 text-amber-100'
            : 'bg-purple-950/70 border-purple-400 text-purple-100'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/20 shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6 text-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm sm:text-base tracking-wide uppercase">
                  {statusLabel}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950 border border-white/20 font-bold">
                  Confidence: {confidence}%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl leading-relaxed font-medium">
                {explanation.summary || 'Telemetry indicates non-standard fluid activity.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToDiagnostics}
            className="w-full md:w-auto flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 shadow-md transition cursor-pointer"
          >
            <span>Inspect AI Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Charts & Wastage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* CHART 1: Real-time Water Flow Over Time */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Live Water Flow Dynamics (L/min)
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
                Real-time sensor telemetry vs expected diurnal baseline
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Actual Flow
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span> Baseline Expected
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData.length > 0 ? historyData : diurnalProfileData}>
                <defs>
                  <linearGradient id="actualFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="expectedFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#cbd5e1" fontSize={12} tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '12px', fontSize: '13px', color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="actual_flow"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#actualFlowGrad)"
                  name="Measured Flow (L/min)"
                />
                <Area
                  type="monotone"
                  dataKey="expected_flow"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#expectedFlowGrad)"
                  name="Expected Baseline (L/min)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDEBAR: Water Wastage Estimation Breakdown */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Water Wastage Estimation
              </h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400">
                AI ESTIMATE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-300 mb-4">
              Real-time excess volumetric calculation:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">Current Flow</span>
                <span className="text-sm font-mono font-bold text-white">{currentFlow.toFixed(2)} L/min</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">Expected Normal Flow</span>
                <span className="text-sm font-mono font-bold text-slate-300">{expectedFlow.toFixed(2)} L/min</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">Estimated Excess Flow</span>
                <span className={`text-sm font-mono font-bold ${excessFlow > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {excessFlow > 0 ? `+${excessFlow.toFixed(2)} L/min` : '0.00 L/min'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-amber-200 block">Est. Daily Wastage</span>
                  <span className="text-xs text-amber-300/80 font-medium">If sustained 24 hrs</span>
                </div>
                <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                  {dailyWastage > 0 ? `${dailyWastage.toLocaleString()} L` : '0 L'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-rose-200 block">Potential Monthly Loss</span>
                  <span className="text-xs text-rose-300/80 font-medium">30-day projection</span>
                </div>
                <span className="text-base sm:text-lg font-mono font-black text-rose-300">
                  {monthlyWastage > 0 ? `${monthlyWastage.toLocaleString()} L` : '0 L'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-medium text-slate-300 leading-relaxed">
            * All figures are empirical estimates. Physical inspection required before intervention.
          </div>
        </div>
      </div>

      {/* Row 2: 24-Hour Diurnal Pattern vs Actual and Wastage Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* CHART 2: Diurnal Profile */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Diurnal Campus Profile (24h)
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
                Baseline demand across day &amp; night intervals
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-300 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
              Campus Profile
            </span>
          </div>

          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diurnalProfileData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '12px', fontSize: '13px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#cbd5e1' }} />
                <Bar dataKey="expected" fill="#3b82f6" name="Expected Normal (L/min)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#06b6d4" name="Measured Load (L/min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Cumulative Wastage Curve */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Cumulative Water Loss Curve
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
                Projected loss over time if left unresolved
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-500/50">
              Loss Curve
            </span>
          </div>

          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { hour: '1 hr', loss: Math.round(excessFlow * 60) },
                { hour: '3 hrs', loss: Math.round(excessFlow * 60 * 3) },
                { hour: '6 hrs', loss: Math.round(excessFlow * 60 * 6) },
                { hour: '12 hrs', loss: Math.round(excessFlow * 60 * 12) },
                { hour: '24 hrs', loss: Math.round(excessFlow * 60 * 24) },
                { hour: '48 hrs', loss: Math.round(excessFlow * 60 * 48) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} unit=" L" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '12px', fontSize: '13px', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', r: 5 }}
                  name="Unchecked Loss (Liters)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
