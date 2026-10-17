import React, { useState, useRef, useEffect } from 'react';
import {
  Droplets,
  Activity,
  Wifi,
  Cpu,
  Sparkles,
  ChevronDown,
  Check,
  Menu,
  X,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export default function Header({
  telemetry,
  isDemoMode,
  onToggleDemoMode,
  nodes,
  activeNodeId,
  onSelectNode,
  wsConnected
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statusLabel = telemetry?.ai_projections?.status_label ?? 'NORMAL';
  const severity = telemetry?.ai_projections?.severity ?? 'NORMAL';
  const currentFlow = telemetry?.measured_data?.flow_rate_lpm ?? 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeNode = nodes.find((n) => n.sensor_id === activeNodeId) || {
    sensor_id: activeNodeId,
    location: 'Hostel Block B',
    pipe_section: 'Section B-12'
  };

  let statusBadgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-950/30';
  if (severity === 'WARNING') {
    statusBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-400/50 animate-pulse';
  } else if (severity === 'HIGH_RISK') {
    statusBadgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-400/50 animate-pulse';
  } else if (severity === 'UNCERTAIN') {
    statusBadgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-400/50';
  }

  return (
    <header className="glass-panel sticky top-0 z-50 px-3 sm:px-6 py-3 border-b border-slate-700/80 shadow-xl bg-slate-950/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/30 text-white shrink-0">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
                AquaGuard
              </h1>
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-600/50 font-bold tracking-wide">
                IoT AI
              </span>
            </div>
            <p className="hidden xs:block text-xs font-semibold text-slate-300 tracking-wide mt-0.5">
              AI-Powered Water Intelligence
            </p>
          </div>
        </div>

        {/* Center Desktop Status Badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm ${statusBadgeStyle}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
            <span>{statusLabel}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 shadow-sm">
            <Wifi className={`w-4 h-4 ${wsConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{wsConnected ? 'Telemetry Live' : 'Polling Sync'}</span>
          </div>
        </div>

        {/* Right Desktop Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Custom High-Contrast Sensor Node Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/60 transition shadow-md text-left cursor-pointer min-w-[210px]"
            >
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {activeNode.sensor_id}
                </div>
                <div className="text-[11px] font-semibold text-slate-300 truncate">
                  {activeNode.location}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* High-Contrast Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800">
                  Select Monitored Sensor Node
                </div>
                <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                  {nodes.map((node) => {
                    const isSelected = node.sensor_id === activeNodeId;
                    return (
                      <button
                        key={node.sensor_id}
                        onClick={() => {
                          onSelectNode(node.sensor_id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border border-cyan-500/60 text-white'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{node.sensor_id}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                              Online
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                            {node.location}
                          </div>
                          <div className="text-[11px] text-slate-300">
                            {node.pipe_section}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher Button */}
          <button
            onClick={() => onToggleDemoMode(!isDemoMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 cursor-pointer shadow-md ${
              isDemoMode
                ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 text-white border-sky-400/50 shadow-sky-600/30'
                : 'bg-emerald-900/40 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>{isDemoMode ? 'Demo Simulator' : 'Hardware Live'}</span>
          </button>
        </div>

        {/* Mobile Header Right: Status Icon + Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Status Tag */}
          <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-black tracking-wide flex items-center gap-1.5 ${statusBadgeStyle}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
            <span className="truncate max-w-[110px]">{statusLabel}</span>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white hover:text-cyan-400 transition"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-3 bg-slate-950/95 p-3 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Active Node Selection on Mobile */}
          <div>
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
              Select Monitored Sensor Node:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {nodes.map((node) => {
                const isSelected = node.sensor_id === activeNodeId;
                return (
                  <button
                    key={node.sensor_id}
                    onClick={() => {
                      onSelectNode(node.sensor_id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left border ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">
                        {node.sensor_id} - {node.location}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {node.pipe_section}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher on Mobile */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Execution Mode:</span>
            <button
              onClick={() => onToggleDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isDemoMode
                  ? 'bg-sky-600 text-white border-sky-400'
                  : 'bg-emerald-700 text-emerald-100 border-emerald-400'
              }`}
            >
              {isDemoMode ? 'Demo Simulator Active' : 'Hardware Live Mode'}
            </button>
          </div>

          {/* Connection Status on Mobile */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 pt-1">
            <span>Connection:</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {wsConnected ? 'Telemetry Live' : 'Polling Sync'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
