import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Radio,
  Sliders,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function DemoControlBar({
  currentScenario,
  onSelectScenario,
  onCustomFlowSubmit,
  currentFlow
}) {
  const [customFlow, setCustomFlow] = useState(2.4);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [countdown, setCountdown] = useState(7);

  const scenarios = [
    {
      id: 'normal',
      stepNum: 1,
      name: '1. Normal Flow',
      targetFlow: '0.3 L/min',
      expectedState: 'NORMAL',
      desc: 'Baseline usage within expected diurnal limits',
      narrative: 'Step 1 of 4: Normal Baseline. Current flow is ~0.3 L/min in Hostel Block B. The green "NORMAL" badge confirms healthy pipes with zero alerts and zero wastage.',
      icon: CheckCircle2,
      activeColor: 'bg-emerald-950/90 text-emerald-100 border-emerald-400 ring-4 ring-emerald-400/40 shadow-xl shadow-emerald-950/60'
    },
    {
      id: 'small_leak',
      stepNum: 2,
      name: '2. Small Leak',
      targetFlow: '2.4 L/min',
      expectedState: 'POSSIBLE LEAK (87%)',
      desc: 'Continuous seepage in off-hours (Risk: Medium)',
      narrative: 'Step 2 of 4: Possible Leak Detected! Flow sustained at 2.4 L/min for 18 continuous minutes. The AI flags POSSIBLE LEAK (Risk: Medium, Confidence: 87%) and ~3,000 L/day wastage.',
      icon: AlertTriangle,
      activeColor: 'bg-amber-950/90 text-amber-100 border-amber-400 ring-4 ring-amber-400/40 shadow-xl shadow-amber-950/60'
    },
    {
      id: 'major_leak',
      stepNum: 3,
      name: '3. Major Leak',
      targetFlow: '14.8 L/min',
      expectedState: 'HIGH-RISK ANOMALY',
      desc: 'High-risk rupture burst; massive water loss',
      narrative: 'Step 3 of 4: High-Risk Rupture Anomaly! Major surge at 14.8 L/min! Status escalates to HIGH-RISK ANOMALY (Confidence: 96%), with ~21,000 L/day at risk. Hostel Block B ranked HIGH PRIORITY.',
      icon: AlertOctagon,
      activeColor: 'bg-rose-950/90 text-rose-100 border-rose-400 ring-4 ring-rose-400/40 shadow-xl shadow-rose-950/60'
    },
    {
      id: 'noisy',
      stepNum: 4,
      name: '4. Noisy / Uncertain Data',
      targetFlow: 'Erratic Jitter',
      expectedState: 'INSUFFICIENT EVIDENCE',
      desc: 'Sensor telemetry unstable; intervention deferred',
      narrative: 'Step 4 of 4: Defensive AI Guardrail. Erratic signal variance detected. Notice the AI does NOT false-alarm: it reports INSUFFICIENT EVIDENCE (Confidence: 38%) and requires clean data before intervention.',
      icon: Radio,
      activeColor: 'bg-purple-950/90 text-purple-100 border-purple-400 ring-4 ring-purple-400/40 shadow-xl shadow-purple-950/60'
    }
  ];

  const currentScObj = scenarios.find((s) => s.id === currentScenario) || scenarios[0];

  // Auto-tour timer
  useEffect(() => {
    let timer;
    if (isAutoTour) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Advance to next step
            const currentIndex = scenarios.findIndex((s) => s.id === currentScenario);
            const nextIndex = (currentIndex + 1) % scenarios.length;
            onSelectScenario(scenarios[nextIndex].id);
            return 7; // reset countdown to 7 seconds
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAutoTour, currentScenario]);

  const handleNextStep = () => {
    const currentIndex = scenarios.findIndex((s) => s.id === currentScenario);
    const nextIndex = (currentIndex + 1) % scenarios.length;
    onSelectScenario(scenarios[nextIndex].id);
    setCountdown(7);
  };

  const toggleAutoTour = () => {
    setIsAutoTour(!isAutoTour);
    setCountdown(7);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-4 sm:p-6 mb-6 border-2 border-slate-700/80 bg-slate-900/90 shadow-2xl">
      {/* Top Banner with High-Contrast Text & Auto Tour Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
            </span>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider m-0">
              Hackathon Judge Live Demo Studio
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">
              Live Walkthrough
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
            Tap cards manually or launch the <strong>Automated Tour</strong> to let the AI demonstrate all 4 scenarios automatically:
          </p>
        </div>

        {/* Live Tour Controls */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Auto Tour Play/Pause Button */}
          <button
            onClick={toggleAutoTour}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg cursor-pointer border ${
              isAutoTour
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
            }`}
          >
            {isAutoTour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoTour ? `Tour Playing (${countdown}s)` : '▶ Start Automated Live Tour'}</span>
          </button>

          {/* Next Step Button */}
          <button
            onClick={handleNextStep}
            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer border border-cyan-400"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Narrative Banner: Shows EXACTLY what the AI is doing right now */}
      <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-slate-950 border-2 border-cyan-500/50 shadow-lg flex items-start gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Live AI Explanation (Scene {currentScObj.stepNum} of 4):
            </span>
            {isAutoTour && (
              <span className="text-[11px] font-bold px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400 animate-pulse">
                Next scene in {countdown}s
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-relaxed">
            {currentScObj.narrative}
          </p>
        </div>
      </div>

      {/* 4 Scenario Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = currentScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => {
                onSelectScenario(sc.id);
                setCountdown(7);
              }}
              className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[135px] ${
                isActive
                  ? `${sc.activeColor}`
                  : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-slate-500'
              }`}
            >
              {isActive && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-white bg-slate-950 px-2 py-0.5 rounded border-2 border-white">
                    ACTIVE NOW
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-current' : 'text-cyan-400'}`} />
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {sc.name}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-cyan-300 font-bold bg-slate-900/90 px-2 py-1 rounded inline-block border border-slate-700">
                  Target: {sc.targetFlow}
                </div>
                <p className="text-xs font-medium text-slate-200 mt-2 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Expected:</span>
                <span className="text-white px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                  {sc.expectedState}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Manual Flow Rate Injector */}
      <div className="mt-5 pt-4 border-t-2 border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-white">Manual Injection Slider:</span>
          <span className="text-sm sm:text-base font-mono text-cyan-300 font-black bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
            {customFlow.toFixed(1)} L/min
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-3/5">
          <input
            type="range"
            min="0"
            max="18"
            step="0.1"
            value={customFlow}
            onChange={(e) => setCustomFlow(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
            aria-label="Flow rate injection slider"
          />
          <button
            onClick={() => onCustomFlowSubmit(customFlow)}
            className="whitespace-nowrap px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-cyan-600/30 border border-cyan-400/40"
          >
            Inject Rate
          </button>
        </div>
      </div>
    </div>
  );
}
