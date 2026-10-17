import React from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertCircle,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function SafetyCenterTab({ telemetry }) {
  const currentFlow = telemetry?.measured_data?.flow_rate_lpm ?? 0;
  const continuousMins = telemetry?.measured_data?.continuous_flow_duration_minutes ?? 0;
  const dailyWastage = telemetry?.ai_projections?.estimated_daily_wastage_liters ?? 0;
  const monthlyWastage = telemetry?.ai_projections?.estimated_monthly_wastage_liters ?? 0;
  const confidence = telemetry?.ai_projections?.confidence_score ?? 95;
  const statusLabel = telemetry?.ai_projections?.status_label ?? 'NORMAL';

  const safetyRules = [
    {
      title: '1. No Definitive Claims of Physical Ruptures',
      description: 'The AI uses probabilistic designations ("Possible Leak Detected", "Abnormal Usage Detected"). It never claims certainty about a physical rupture without direct visual/acoustic inspection.',
      status: 'STRICTLY ENFORCED',
      icon: CheckCircle2,
      color: 'text-emerald-300 bg-emerald-500/20 border-emerald-400'
    },
    {
      title: '2. Mandatory Human Inspection First',
      description: 'Physical technician verification is strictly required before any mechanical intervention, valve manipulation, or supply alteration.',
      status: 'STRICTLY ENFORCED',
      icon: UserCheck,
      color: 'text-cyan-300 bg-cyan-500/20 border-cyan-400'
    },
    {
      title: '3. Low-Confidence "Insufficient Evidence" Fallback',
      description: 'When telemetry exhibits high jitter, packet loss, or turbulent aeration near the sensor turbine, the AI defaults to "Insufficient Evidence" rather than triggering false panic.',
      status: 'STRICTLY ENFORCED',
      icon: AlertCircle,
      color: 'text-purple-300 bg-purple-500/20 border-purple-400'
    },
    {
      title: '4. Absolute Prohibition of Automated Supply Shut-Off',
      description: 'AquaGuard software and firmware are deliberately locked to prevent automatic motorized valve closures, protecting fire suppression lines, critical cooling, and sanitary services from false alarms.',
      status: 'HARDWARE & SOFTWARE LOCKED',
      icon: Lock,
      color: 'text-rose-300 bg-rose-500/20 border-rose-400'
    },
    {
      title: '5. Clear Distinction of Measured Data vs Projections',
      description: 'Telemetry read from physical sensors is strictly separated from algorithmic projections, and all water savings and loss figures are explicitly labeled as empirical estimates.',
      status: 'STRICTLY ENFORCED',
      icon: Shield,
      color: 'text-amber-300 bg-amber-500/20 border-amber-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border-2 border-emerald-400/60 bg-slate-900/90 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400 shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white m-0">Safety &amp; Reliability by Design</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400">
                  Guardrails Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium leading-relaxed">
                AquaGuard implements strict defensive engineering to prevent false shutdowns, alarm fatigue, and unverified infrastructure tampering.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border-2 border-slate-700 text-center min-w-[210px] w-full md:w-auto">
            <span className="text-xs text-slate-300 uppercase font-bold block mb-1">
              Automated Shut-off Valve Interlock
            </span>
            <div className="flex items-center justify-center gap-1.5 text-sm font-black text-rose-400 font-mono">
              <Lock className="w-4 h-4" />
              <span>LOCKED / DISABLED</span>
            </div>
            <span className="text-xs font-semibold text-cyan-300 mt-1 block">
              Human-in-the-loop enforced
            </span>
          </div>
        </div>
      </div>

      {/* Measured Sensor Data vs AI Estimates Matrix */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
              Measured Sensor Telemetry vs. AI Algorithmic Projections
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">
              Clear verification separation ensuring operational integrity
            </p>
          </div>
          <span className="text-xs font-bold text-cyan-300 px-3 py-1 rounded bg-cyan-950 border border-cyan-500">
            Transparency Schema
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left: Measured Raw Sensor Data */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-cyan-300">
              <Cpu className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                1. Measured Physical Sensor Data
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 font-medium">
              Direct physical signals recorded via Hall-effect turbine interrupts from ESP32:
            </p>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Instantaneous Flow Rate</span>
                <span className="font-mono font-black text-white">{currentFlow.toFixed(2)} L/min</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Pulse Sampling Frequency</span>
                <span className="font-mono font-bold text-cyan-300">{(currentFlow * 7.5).toFixed(1)} Hz</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Continuous Elapsed Flow</span>
                <span className="font-mono font-bold text-white">{continuousMins} minutes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Sensor Hardware ID</span>
                <span className="font-mono font-bold text-cyan-300">{telemetry?.sensor_id || 'PIPE-B12'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300 font-semibold">Physical Verification State</span>
                <span className="font-bold text-emerald-400">Directly Measured</span>
              </div>
            </div>
          </div>

          {/* Right: AI Statistical Projections */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-amber-300">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                2. AI Statistical Projections (Estimates)
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3 font-medium">
              Probabilistic estimates derived via machine learning &amp; diurnal baseline curves:
            </p>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Diagnostic Status Label</span>
                <span className="font-mono font-black text-amber-300">{statusLabel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Model Confidence Score</span>
                <span className="font-mono font-bold text-cyan-300">{confidence}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Estimated Daily Wastage</span>
                <span className="font-mono font-black text-amber-400">
                  {dailyWastage > 0 ? `~${dailyWastage.toLocaleString()} L/day (Est.)` : '0 L/day (Est.)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-semibold">Estimated 30-Day Wastage</span>
                <span className="font-mono font-black text-rose-400">
                  {monthlyWastage > 0 ? `~${monthlyWastage.toLocaleString()} L/mo (Est.)` : '0 L/mo (Est.)'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300 font-semibold">Confidence Qualification</span>
                <span className="font-bold text-amber-300">Empirical Projection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Safety Guardrails Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safetyRules.map((rule, idx) => {
          const IconComponent = rule.icon;
          return (
            <div key={idx} className="glass-panel p-4 sm:p-5 rounded-xl border-2 border-slate-700/80 bg-slate-900/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg border-2 ${rule.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-200">
                    {rule.status}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white mb-2 leading-snug">
                  {rule.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
