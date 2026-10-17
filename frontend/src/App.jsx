import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DemoControlBar from './components/DemoControlBar';
import MetricCards from './components/MetricCards';
import LiveDashboardTab from './components/LiveDashboardTab';
import AIDiagnosticsTab from './components/AIDiagnosticsTab';
import PriorityQueueTab from './components/PriorityQueueTab';
import SafetyCenterTab from './components/SafetyCenterTab';
import SDGImpactTab from './components/SDGImpactTab';
import HardwareLabTab from './components/HardwareLabTab';
import { Activity, Brain, AlertTriangle, ShieldCheck, Globe, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [telemetry, setTelemetry] = useState(null);
  const [todayAggregate, setTodayAggregate] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [alertsData, setAlertsData] = useState({ total_active: 0, alerts: [] });
  const [sdgData, setSdgData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState('PIPE-B12');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [wsConnected, setWsConnected] = useState(false);

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      // 1. Live Telemetry
      const liveRes = await fetch('/api/telemetry/live');
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        setTelemetry(liveJson.telemetry);
        setTodayAggregate(liveJson.today_aggregate);
        setCurrentScenario(liveJson.active_scenario || 'normal');
        setIsDemoMode(liveJson.is_demo_mode);
        if (liveJson.sensor_node) {
          setActiveNodeId(liveJson.sensor_node.sensor_id);
        }
      }

      // 2. History
      const histRes = await fetch('/api/telemetry/history?limit=30');
      if (histRes.ok) {
        const histJson = await histRes.json();
        setHistoryData(histJson.history || []);
      }

      // 3. Alerts
      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        setAlertsData(alertsJson);
      }

      // 4. Nodes
      const nodesRes = await fetch('/api/nodes');
      if (nodesRes.ok) {
        const nodesJson = await nodesRes.json();
        setNodes(nodesJson.nodes || []);
      }

      // 5. SDG
      const sdgRes = await fetch('/api/impact/sdg');
      if (sdgRes.ok) {
        const sdgJson = await sdgRes.json();
        setSdgData(sdgJson);
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // 2.5 second polling interval ensures flawless sync even if WebSocket is blocked
    const interval = setInterval(fetchAllData, 2500);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    let ws;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
        } catch (e) {}
      };
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
    } catch (e) {
      setWsConnected(false);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Handlers
  const handleSelectScenario = async (scenarioName) => {
    setCurrentScenario(scenarioName);
    try {
      const res = await fetch('/api/demo/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioName })
      });
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json.latest_telemetry);
        // Refresh alerts and history immediately
        setTimeout(fetchAllData, 300);
      }
    } catch (err) {
      console.error('Scenario select error:', err);
    }
  };

  const handleToggleDemoMode = async (newMode) => {
    setIsDemoMode(newMode);
    try {
      await fetch('/api/demo/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_mode: newMode })
      });
      fetchAllData();
    } catch (err) {
      console.error('Demo mode toggle error:', err);
    }
  };

  const handleSelectNode = async (nodeId) => {
    setActiveNodeId(nodeId);
    try {
      await fetch('/api/nodes/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id: nodeId })
      });
      fetchAllData();
    } catch (err) {
      console.error('Node select error:', err);
    }
  };

  const handleCustomFlowSubmit = async (rate) => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_rate: rate,
          sensor_id: activeNodeId,
          timestamp: new Date().toISOString()
        })
      });
      fetchAllData();
    } catch (err) {
      console.error('Custom flow injection error:', err);
    }
  };

  const handleSendHardwarePayload = async (payload) => {
    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API failed to ingest payload');
    const json = await res.json();
    fetchAllData();
    return json;
  };

  const tabs = [
    { id: 'dashboard', label: 'Live Intelligence', icon: Activity },
    { id: 'diagnostics', label: 'AI Diagnostics', icon: Brain },
    { id: 'priority', label: 'Priority Issues', icon: AlertTriangle, count: alertsData.total_active },
    { id: 'safety', label: 'Safety & Reliability', icon: ShieldCheck },
    { id: 'sdg', label: 'SDG Impact', icon: Globe },
    { id: 'hardware', label: 'ESP32 IoT Lab', icon: Cpu }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        telemetry={telemetry}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        nodes={nodes}
        activeNodeId={activeNodeId}
        onSelectNode={handleSelectNode}
        wsConnected={wsConnected}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Hackathon Judge Demo Bar */}
        <DemoControlBar
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          onCustomFlowSubmit={handleCustomFlowSubmit}
          currentFlow={telemetry?.measured_data?.flow_rate_lpm ?? 0}
        />

        {/* 4 Core Summary Metric Cards */}
        <MetricCards
          telemetry={telemetry}
          todayAggregate={todayAggregate}
        />

        {/* Navigation Tabs Bar: Touch-Friendly & High-Contrast */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b-2 border-slate-700/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-black">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <LiveDashboardTab
            telemetry={telemetry}
            historyData={historyData}
            onNavigateToDiagnostics={() => setActiveTab('diagnostics')}
          />
        )}

        {activeTab === 'diagnostics' && (
          <AIDiagnosticsTab
            telemetry={telemetry}
          />
        )}

        {activeTab === 'priority' && (
          <PriorityQueueTab
            alertsData={alertsData}
            onSelectAlert={() => setActiveTab('diagnostics')}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyCenterTab
            telemetry={telemetry}
          />
        )}

        {activeTab === 'sdg' && (
          <SDGImpactTab
            sdgData={sdgData}
            telemetry={telemetry}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareLabTab
            onSendHardwarePayload={handleSendHardwarePayload}
          />
        )}
      </main>

      {/* Footer with high-contrast safety disclaimer */}
      <footer className="glass-panel border-t-2 border-slate-700/80 py-6 px-4 sm:px-6 mt-12 text-center text-xs sm:text-sm text-slate-300 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">AquaGuard AI</span>
            <span>&bull;</span>
            <span className="font-medium text-slate-300">Sustainable Campus &amp; Enterprise Fluid Intelligence</span>
          </div>

          <div className="text-xs text-cyan-300 font-semibold">
            Safety Guardrail Active: Probabilistic diagnostics only. Automated valve shut-off locked. Human inspection required.
          </div>
        </div>
      </footer>
    </div>
  );
}
