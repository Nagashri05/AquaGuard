import React, { useState } from 'react';
import { AlertTriangle, MapPin, CheckCircle2 } from 'lucide-react';

export default function PriorityQueueTab({ alertsData, onSelectAlert }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const alertsList = alertsData?.alerts || [];

  const filteredAlerts = alertsList.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Title & Priority Formula Header */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider m-0">
                Priority Ranking Engine
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-extrabold border border-cyan-500">
                Dynamic Issue Queue
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium leading-relaxed">
              Plumbing issues ranked automatically using:
              <strong className="text-white"> Severity</strong> &times;
              <strong className="text-white"> Confidence</strong> &times;
              <strong className="text-white"> Duration</strong> &times;
              <strong className="text-white"> Estimated Wastage</strong>.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs sm:text-sm w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                filterSeverity === 'ALL' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              All ({alertsList.length})
            </button>
            <button
              onClick={() => setFilterSeverity('HIGH_RISK')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                filterSeverity === 'HIGH_RISK' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                filterSeverity === 'WARNING' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Warning
            </button>
          </div>
        </div>
      </div>

      {/* Priority Issues Queue */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">No Active High-Priority Alerts</h3>
            <p className="text-sm font-semibold text-slate-300 mt-1">All monitored pipes are within normal diurnal limits.</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => {
            const isHigh = alert.severity === 'HIGH_RISK';
            const isWarning = alert.severity === 'WARNING';
            const isUncertain = alert.severity === 'UNCERTAIN';

            let badgeStyle = 'bg-slate-800 text-slate-200 border-slate-700';
            let cardBorder = 'border-slate-700/80';

            if (isHigh) {
              badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-400';
              cardBorder = 'border-rose-400 bg-rose-950/20';
            } else if (isWarning) {
              badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-400';
              cardBorder = 'border-amber-400 bg-amber-950/20';
            } else if (isUncertain) {
              badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-400';
              cardBorder = 'border-purple-400 bg-purple-950/20';
            }

            return (
              <div
                key={alert.id || index}
                className={`glass-panel p-4 sm:p-6 rounded-2xl border-2 transition-all shadow-xl ${cardBorder}`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Problem Details */}
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border-2 ${badgeStyle}`}>
                        {alert.priority}
                      </span>
                      <span className="text-sm font-black text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        {alert.location}
                      </span>
                      <span className="text-xs font-bold text-cyan-300 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                        {alert.pipe_section}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        Node: <strong className="text-white">{alert.sensor_id}</strong>
                      </span>
                    </div>

                    <div className="text-base sm:text-lg font-black text-white">
                      {alert.status_label}: {alert.summary}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <strong className="text-cyan-300">Recommended Action: </strong>
                      {alert.recommended_action}
                    </p>
                  </div>

                  {/* Right: Metrics & Action Button */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-300 block uppercase font-bold">Confidence</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-cyan-300">{alert.confidence}%</span>
                      </div>

                      <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-300 block uppercase font-bold">Duration</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-white">{alert.duration_minutes} min</span>
                      </div>

                      <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-950/50 border border-amber-500/40">
                        <span className="text-[10px] text-amber-300 block uppercase font-bold">Excess</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-amber-300">
                          {alert.estimated_daily_wastage_liters > 0
                            ? `${alert.estimated_daily_wastage_liters.toLocaleString()} L`
                            : '0 L'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Inspection task dispatched for ${alert.pipe_section} in ${alert.location}`)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm border border-cyan-400 shadow-md transition cursor-pointer whitespace-nowrap text-center"
                    >
                      Inspect Section &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
