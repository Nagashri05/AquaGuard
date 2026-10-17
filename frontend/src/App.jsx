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

// Client-side fallback simulator for static hosting (GitHub Pages, Vercel, Netlify)
const getMockTelemetry = (scenario = 'normal', customFlowRate = null) => {
  let flow = 0.28;
  let status = 'NORMAL';
  let severity = 'NORMAL';
  let risk = 'Low';
  let conf = 96.0;
  let excess = 0.0;
  let wastage = 0;
  let explanation = 'Water flow is within normal parameters for Hostel Block B.';
  let evidence = [
    'Current flow rate (0.28 L/min) aligns with expected diurnal consumption curve.',
    'No sustained abnormal low-level baseline leakage detected.',
    'Flow dynamics indicate normal human utilization pattern.'
  ];
  let causes = ['Standard fixture operations (taps, washbasins)', 'Expected diurnal campus activity'];
  let action = 'Routine monitoring active. No physical intervention required.';

  if (scenario === 'small_leak') {
    flow = 2.40;
    status = 'POSSIBLE LEAK DETECTED';
    severity = 'WARNING';
    risk = 'Medium';
    conf = 87.0;
    excess = 2.10;
    wastage = 3024;
    explanation = 'Possible leak detected at Hostel Block B. Steady flow of 2.40 L/min observed during low-demand period.';
    evidence = [
      'Water flow remained unusually high (2.40 L/min) for 18 minutes during expected low usage.',
      'Continuous baseline elevation of +2.10 L/min above historical baseline (0.30 L/min).',
      'Flow signature exhibits near-zero variance (steady mechanical seepage pattern rather than intermittent human tap usage).'
    ];
    causes = [
      'Faulty toilet cistern flush valve or flapper seal',
      'Weeping pipe union in riser shaft',
      'Partially open utility hose or washbasin tap'
    ];
    action = 'MEDIUM PRIORITY: Conduct manual inspection of fixtures on Section B-12 (Hostel Block B). Verify restroom cisterns.';
  } else if (scenario === 'major_leak') {
    flow = 14.80;
    status = 'HIGH-RISK ANOMALY DETECTED';
    severity = 'HIGH_RISK';
    risk = 'High';
    conf = 95.9;
    excess = 14.50;
    wastage = 20880;
    explanation = 'High-risk abnormal water usage detected at Hostel Block B (14.80 L/min). Rapid loss underway.';
    evidence = [
      'Severe abnormal flow of 14.80 L/min detected (expected: 0.30 L/min).',
      'Rapid rate of volumetric discharge without natural tapering.',
      'Continuous high-volume consumption extending past normal residential fixture thresholds.'
    ];
    causes = [
      'Main line fracture or ruptured pipe joint',
      'Commercial booster pump overflow or bypass valve failure',
      'Major storage tank float-valve stuck in fully open discharge'
    ];
    action = 'HIGH PRIORITY: Dispatch maintenance crew immediately to inspect Section B-12 in Hostel Block B. Inspect before manual isolation.';
  } else if (scenario === 'noisy') {
    flow = 16.82;
    status = 'INSUFFICIENT EVIDENCE';
    severity = 'UNCERTAIN';
    risk = 'Insufficient Evidence';
    conf = 38.0;
    excess = 0;
    wastage = 0;
    explanation = 'Insufficient evidence: Sensor telemetry is noisy and unreliable. Intervention deferred.';
    evidence = [
      'Erratic sensor jitter detected: rapid variance in flow readings.',
      'Telemetry packet instability observed; signal-to-noise ratio is below reliable detection threshold.'
    ];
    causes = [
      'Air pockets or turbulent vortex near YF-S201 turbine wheel',
      'Sensor electrical ground fault or intermittent transmission jitter'
    ];
    action = 'Please collect better sensor data before taking action. Inspect physical sensor wiring and bleed air pockets from pipe.';
  }

  if (customFlowRate !== null) {
    flow = customFlowRate;
    if (flow > 8) {
      status = 'HIGH-RISK ANOMALY DETECTED';
      severity = 'HIGH_RISK';
      risk = 'High';
      conf = 95.0;
      excess = Math.max(0, flow - 0.3);
      wastage = Math.round(excess * 1440);
    } else if (flow > 1.5) {
      status = 'POSSIBLE LEAK DETECTED';
      severity = 'WARNING';
      risk = 'Medium';
      conf = 87.0;
      excess = Math.max(0, flow - 0.3);
      wastage = Math.round(excess * 1440);
    }
  }

  return {
    sensor_id: 'PIPE-B12',
    location: 'Hostel Block B',
    pipe_section: 'Section B-12',
    timestamp: new Date().toISOString(),
    measured_data: {
      flow_rate_lpm: flow,
      continuous_flow_duration_minutes: scenario === 'small_leak' ? 18 : (scenario === 'major_leak' ? 32 : 0),
      sensor_status: scenario === 'noisy' ? 'Unstable Signal' : 'Online',
      is_sensor_measurement: true
    },
    ai_projections: {
      status_label: status,
      severity: severity,
      risk_level: risk,
      confidence_score: conf,
      expected_flow_lpm: 0.30,
      estimated_excess_lpm: excess,
      estimated_daily_wastage_liters: wastage,
      estimated_monthly_wastage_liters: wastage * 30,
      is_ai_estimate: true
    },
    explanation: {
      summary: explanation,
      risk_level: risk,
      confidence_percent: conf,
      evidence: evidence,
      possible_causes: causes,
      recommended_action: action
    }
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [telemetry, setTelemetry] = useState(getMockTelemetry('normal'));
  const [todayAggregate, setTodayAggregate] = useState({
    water_used_today_liters: 3476.7,
    expected_today_liters: 3850.0,
    active_alerts_count: 0
  });
  const [historyData, setHistoryData] = useState([]);
  const [alertsData, setAlertsData] = useState({ total_active: 0, alerts: [] });
  const [sdgData, setSdgData] = useState(null);
  const [nodes, setNodes] = useState([
    { sensor_id: 'PIPE-B12', location: 'Hostel Block B', pipe_section: 'Section B-12', status: 'Online' },
    { sensor_id: 'PIPE-A1', location: 'Hostel Block A', pipe_section: 'Section A-01', status: 'Online' },
    { sensor_id: 'PIPE-C3', location: 'Academic Block C', pipe_section: 'Section C-08', status: 'Online' },
    { sensor_id: 'PIPE-ADM1', location: 'Admin Building', pipe_section: 'Section ADM-02', status: 'Online' }
  ]);
  const [activeNodeId, setActiveNodeId] = useState('PIPE-B12');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Generate mock history curve for static hosting
  const generateMockHistory = (scenario) => {
    const data = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = t.toTimeString().split(' ')[0];
      const baseExpected = 0.30;
      let actual = baseExpected + (Math.random() * 0.08 - 0.04);
      if (i <= 4) {
        if (scenario === 'small_leak') actual = 2.40 + (Math.random() * 0.1 - 0.05);
        if (scenario === 'major_leak') actual = 14.80 + (Math.random() * 0.4 - 0.2);
        if (scenario === 'noisy') actual = Math.random() > 0.5 ? 16.5 : 0.8;
      }
      data.push({
        time: timeStr,
        actual_flow: Math.max(0.05, parseFloat(actual.toFixed(2))),
        expected_flow: baseExpected,
        excess_flow: Math.max(0, parseFloat((actual - baseExpected).toFixed(2)))
      });
    }
    return data;
  };

  // Sync / Fallback
  const fetchAllData = async () => {
    try {
      const liveRes = await fetch('/api/telemetry/live');
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        setTelemetry(liveJson.telemetry);
        setTodayAggregate(liveJson.today_aggregate);
        setCurrentScenario(liveJson.active_scenario || 'normal');
        setIsDemoMode(liveJson.is_demo_mode);
        if (liveJson.sensor_node) setActiveNodeId(liveJson.sensor_node.sensor_id);
      } else {
        throw new Error('API not available, running in static mode');
      }

      const histRes = await fetch('/api/telemetry/history?limit=30');
      if (histRes.ok) {
        const histJson = await histRes.json();
        setHistoryData(histJson.history || []);
      }

      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const alertsJson = await alertsRes.json();
        setAlertsData(alertsJson);
      }

      const nodesRes = await fetch('/api/nodes');
      if (nodesRes.ok) {
        const nodesJson = await nodesRes.json();
        setNodes(nodesJson.nodes || []);
      }

      const sdgRes = await fetch('/api/impact/sdg');
      if (sdgRes.ok) {
        const sdgJson = await sdgRes.json();
        setSdgData(sdgJson);
      }
    } catch (err) {
      // Fallback for GitHub Pages static hosting
      setHistoryData(generateMockHistory(currentScenario));
      const mock = getMockTelemetry(currentScenario);
      setTelemetry(mock);
      
      const isProblem = mock.ai_projections.severity !== 'NORMAL';
      setAlertsData({
        total_active: isProblem ? 1 : 0,
        alerts: isProblem ? [{
          id: 'ALT-LIVE-01',
          priority: mock.ai_projections.severity === 'HIGH_RISK' ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY',
          severity: mock.ai_projections.severity,
          location: 'Hostel Block B',
          pipe_section: 'Section B-12',
          sensor_id: 'PIPE-B12',
          status_label: mock.ai_projections.status_label,
          confidence: mock.ai_projections.confidence_score,
          duration_minutes: mock.measured_data.continuous_flow_duration_minutes || 18,
          estimated_daily_wastage_liters: mock.ai_projections.estimated_daily_wastage_liters,
          summary: mock.explanation.summary,
          recommended_action: mock.explanation.recommended_action
        }] : []
      });
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2500);
    return () => clearInterval(interval);
  }, [currentScenario]);

  // WebSocket connection for real-time updates (if running with server)
  useEffect(() => {
    if (window.location.protocol.startsWith('http')) {
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
      return () => { if (ws) ws.close(); };
    }
  }, []);

  // Handlers
  const handleSelectScenario = async (scenarioName) => {
    setCurrentScenario(scenarioName);
    const mock = getMockTelemetry(scenarioName);
    setTelemetry(mock);
    setHistoryData(generateMockHistory(scenarioName));

    try {
      const res = await fetch('/api/demo/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioName })
      });
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json.latest_telemetry);
        setTimeout(fetchAllData, 300);
      }
    } catch (err) {
      // Static fallback already applied above
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
    } catch (err) {}
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
    } catch (err) {}
  };

  const handleCustomFlowSubmit = async (rate) => {
    const mock = getMockTelemetry(currentScenario, rate);
    setTelemetry(mock);
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
    } catch (err) {}
  };

  const handleSendHardwarePayload = async (payload) => {
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        fetchAllData();
        return json;
      }
    } catch (err) {}
    // Simulated fallback response
    const mock = getMockTelemetry('normal', payload.flow_rate);
    setTelemetry(mock);
    return { status: 'success', analysis: mock };
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
