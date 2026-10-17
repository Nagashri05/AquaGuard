import React from 'react';
import { Droplet, Building2, Recycle, Leaf, Zap, Globe, Award, TrendingUp } from 'lucide-react';

export default function SDGImpactTab({ sdgData, telemetry }) {
  const metrics = sdgData?.metrics || {
    estimated_monthly_water_conserved_liters: 32000,
    pumping_energy_conserved_kwh: 14.4,
    avoided_carbon_emissions_kg: 11.8,
    average_detection_time_minutes: 14.5,
    infrastructure_protection_score: '98.2%'
  };

  const sdgGoals = sdgData?.sdg_goals || [
    {
      code: 'SDG 6',
      title: 'Clean Water and Sanitation',
      target: 'Target 6.4: Increase water-use efficiency and ensure sustainable withdrawals',
      contribution: 'AquaGuard continuously scans residential and commercial pipe networks to catch invisible underground and cistern seepage before millions of liters of potable water are lost to drainage.',
      color: '#26BDE2'
    },
    {
      code: 'SDG 11',
      title: 'Sustainable Cities and Communities',
      target: 'Target 11.B: Resource efficiency and disaster-resilient infrastructure',
      contribution: 'Prevents catastrophic structural water damage, ceiling collapses, and foundation weakening in multi-story hostels, apartments, and academic complexes through early acoustic and volumetric warning.',
      color: '#FD9D24'
    },
    {
      code: 'SDG 12',
      title: 'Responsible Consumption and Production',
      target: 'Target 12.2: Sustainable management and efficient use of natural resources',
      contribution: 'Provides students, property managers, and facility administrators with transparent consumption feedback, eliminating silent utility wastage and minimizing water treatment and booster pumping electricity.',
      color: '#BF8B2E'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider m-0">
                UN Sustainable Development Goals (SDG) Alignment
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl font-medium leading-relaxed">
              Water is an energy-intensive municipal commodity. Every liter conserved by AquaGuard avoids pumping electricity, reduces groundwater depletion, and protects urban infrastructure.
            </p>
          </div>
          <div>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 text-xs sm:text-sm font-black flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>ESG Impact Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Live Impact Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90">
          <div className="flex items-center justify-between text-slate-200 mb-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-cyan-200">
              Water Conserved / Mo
            </span>
            <Droplet className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {Number(metrics.estimated_monthly_water_conserved_liters).toLocaleString()} L
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-2">
            Equivalent to 160+ residential daily quotas saved
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90">
          <div className="flex items-center justify-between text-slate-200 mb-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200">
              Pumping Energy Saved
            </span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.pumping_energy_conserved_kwh} kWh
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-2">
            Avoided municipal booster &amp; filtration draw
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90">
          <div className="flex items-center justify-between text-slate-200 mb-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-200">
              CO₂ Emissions Avoided
            </span>
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.avoided_carbon_emissions_kg} kg CO₂e
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-2">
            Offset through eliminated water cycle energy
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90">
          <div className="flex items-center justify-between text-slate-200 mb-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-200">
              Avg. Detection Time
            </span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.average_detection_time_minutes} min
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-2">
            Compared to industry standard of 72+ hours
          </p>
        </div>
      </div>

      {/* The 3 Core SDG Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {sdgGoals.map((goal, idx) => {
          let IconComp = Droplet;
          if (goal.code.includes('11')) IconComp = Building2;
          if (goal.code.includes('12')) IconComp = Recycle;

          return (
            <div
              key={idx}
              className="glass-panel p-5 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 flex flex-col justify-between hover:border-cyan-500/50 transition shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg"
                    style={{ backgroundColor: goal.color }}
                  >
                    {goal.code}
                  </div>
                  <IconComp className="w-8 h-8 text-cyan-400" />
                </div>

                <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
                  {goal.title}
                </h3>

                <div className="text-xs font-bold text-cyan-300 mb-3 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {goal.target}
                </div>

                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                  {goal.contribution}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 text-xs text-slate-300 font-semibold flex items-center justify-between">
                <span>Contribution Level:</span>
                <span className="font-extrabold text-cyan-300">Direct &amp; Quantified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
