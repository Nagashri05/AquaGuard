import React from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  FileText,
  CheckCircle,
  Wrench,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export default function AIDiagnosticsTab({ telemetry }) {
  const currentFlow = telemetry?.measured_data?.flow_rate_lpm ?? 0;
  const continuousMins = telemetry?.measured_data?.continuous_flow_duration_minutes ?? 0;
  const statusLabel = telemetry?.ai_projections?.status_label ?? 'NORMAL';
  const severity = telemetry?.ai_projections?.severity ?? 'NORMAL';
  const riskLevel = telemetry?.ai_projections?.risk_level ?? 'Low';
  const confidence = telemetry?.ai_projections?.confidence_score ?? 95;
  const expectedFlow = telemetry?.ai_projections?.expected_flow_lpm ?? 0.3;
  const excessFlow = telemetry?.ai_projections?.estimated_excess_lpm ?? 0;
  const explanation = telemetry?.explanation ?? {};
  const evidenceList = explanation?.evidence || [];
  const causesList = explanation?.possible_causes || [];
  const recommendedAction = explanation?.recommended_action || 'Routine monitoring active.';

  let bannerColor = 'from-emerald-950/80 to-slate-900 border-emerald-400';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400';
  let Icon = ShieldCheck;

  if (severity === 'WARNING') {
    bannerColor = 'from-amber-950/80 to-slate-900 border-amber-400';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400';
    Icon = AlertTriangle;
  } else if (severity === 'HIGH_RISK') {
    bannerColor = 'from-rose-950/80 to-slate-900 border-rose-400';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400';
    Icon = AlertOctagon;
  } else if (severity === 'UNCERTAIN') {
    bannerColor = 'from-purple-950/80 to-slate-900 border-purple-400';
    badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-400';
    Icon = Radio;
  }

  return (
    <div className="space-y-6">
      {/* Top AI Status Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border-2 bg-gradient-to-r ${bannerColor} shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/20 text-cyan-300 shrink-0">
              <Brain className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border uppercase tracking-wider ${badgeColor}`}>
                  {statusLabel}
                </span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 font-bold">
                  Risk Level: {riskLevel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-2 mb-1 leading-snug">
                {explanation.summary || 'Real-time flow intelligence evaluation completed.'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl font-medium">
                Probabilistic diagnostic model evaluating flow amplitude, continuous duration, diurnal curve baselines, and signal quality.
              </p>
            </div>
          </div>

          {/* Confidence Score Pill */}
          <div className="w-full md:w-auto p-4 rounded-xl bg-slate-950 border-2 border-slate-700 text-center min-w-[200px] shadow-lg">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              AI Confidence Score
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              {confidence}%
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2 border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  confidence >= 80 ? 'bg-cyan-400' : (confidence >= 50 ? 'bg-amber-400' : 'bg-purple-400')
                }`}
                style={{ width: `${Math.min(100, confidence)}%` }}
              ></div>
            </div>
            <div className="text-xs font-bold text-cyan-300 mt-2">
              {confidence >= 80 ? 'High Confidence' : (confidence >= 50 ? 'Moderate Evidence' : 'Insufficient Evidence')}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluated Factors Grid */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
          <span>Multi-Criteria Anomaly Assessment Factors</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-1">1. Current Flow</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white">{currentFlow.toFixed(2)} L/min</div>
            <span className="text-xs text-cyan-400 font-medium">Turbine sensor pulse</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-1">2. Continuous Duration</span>
            <div className="text-base sm:text-lg font-bold font-mono text-cyan-300">
              {continuousMins > 0 ? `${continuousMins} mins` : '0 mins'}
            </div>
            <span className="text-xs text-slate-300 font-medium">Continuous flow run</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-1">3. Expected Baseline</span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-200">{expectedFlow.toFixed(2)} L/min</div>
            <span className="text-xs text-slate-300 font-medium">Time-of-day profile</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-1">4. Rate of Change</span>
            <div className={`text-base sm:text-lg font-bold font-mono ${excessFlow > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {excessFlow > 0 ? `+${excessFlow.toFixed(2)} L/min` : '0.00 L/min'}
            </div>
            <span className="text-xs text-slate-300 font-medium">Variance from baseline</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-1">5. Signal Quality</span>
            <div className="text-base sm:text-lg font-bold font-mono text-white">
              {severity === 'UNCERTAIN' ? 'Unstable (Jitter)' : 'Stable (<0.05 var)'}
            </div>
            <span className="text-xs text-cyan-400 font-medium">Noise &amp; drop filter</span>
          </div>
        </div>
      </div>

      {/* Evidence & Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Evidence Column */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Observational Evidence
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-4">
              Empirical telemetry triggers evaluated by AI:
            </p>

            <ul className="space-y-3">
              {evidenceList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-100 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Possible Causes */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Probable Physical Causes
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-4">
              Differential hydraulic hypotheses:
            </p>

            <ul className="space-y-3">
              {causesList.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-100 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400 font-mono text-xs flex items-center justify-center shrink-0 font-black">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recommended Action & Human Verification Protocol */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border-2 border-cyan-500/50 bg-slate-950 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-1">
                Recommended Next Action (Human-In-The-Loop)
              </div>
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {recommendedAction}
              </p>
              <div className="text-xs sm:text-sm text-slate-300 mt-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Safety Guardrail: Automated shut-off is locked to prevent false service disruption.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert("Maintenance work order #AG-4029 logged for pipe inspection crew.")}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-cyan-600/30 whitespace-nowrap"
          >
            Dispatch Inspection Crew
          </button>
        </div>
      </div>
    </div>
  );
}
