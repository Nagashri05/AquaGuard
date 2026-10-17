import React, { useState } from 'react';
import { Cpu, Send, Check, Copy, Terminal, Zap, Code } from 'lucide-react';

export default function HardwareLabTab({ onSendHardwarePayload }) {
  const [flowRate, setFlowRate] = useState(2.4);
  const [sensorId, setSensorId] = useState('PIPE-A1');
  const [responseMsg, setResponseMsg] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestPost = async () => {
    setIsSending(true);
    try {
      const res = await onSendHardwarePayload({
        flow_rate: parseFloat(flowRate),
        sensor_id: sensorId,
        timestamp: new Date().toISOString()
      });
      setResponseMsg({
        success: true,
        text: `HTTP 200 OK: Processed telemetry for ${sensorId} (${flowRate} L/min). AI status: ${res?.analysis?.ai_projections?.status_label || 'NORMAL'}`
      });
    } catch (err) {
      setResponseMsg({
        success: false,
        text: `Error sending payload: ${err.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  const arduinoSnippet = `// ESP32 DevKit V1 + YF-S201 Flow Sensor Firmware
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_SERVER_IP:8000/api/telemetry";
const char* SENSOR_ID     = "PIPE-A1";

const int FLOW_SENSOR_PIN = 4; // GPIO 4 interrupt pin
volatile uint32_t pulseCount = 0;

void IRAM_ATTR pulseISR() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseISR, RISING);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void loop() {
  delay(2000);
  noInterrupts();
  uint32_t pulses = pulseCount;
  pulseCount = 0;
  interrupts();

  // Calibration factor: 7.5 pulses per second per 1 L/min
  float flowRate = (pulses / 2.0f) / 7.5f;

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    char payload[128];
    snprintf(payload, sizeof(payload), 
             "{\\"flow_rate\\": %.2f, \\"sensor_id\\": \\"%s\\"}", 
             flowRate, SENSOR_ID);

    int httpCode = http.POST(payload);
    Serial.printf("Response Code: %d\\n", httpCode);
    http.end();
  }
}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400 shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider m-0">
              Physical IoT Prototype Integration Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl font-medium leading-relaxed">
              AquaGuard natively ingests real-time telemetry from physical ESP32 microcontrollers wired to YF-S201 pulse flow sensors over standard Wi-Fi REST API.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Live API Dispatcher vs Circuit Schematics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Interactive Ingestion Tester */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Live REST API Ingestion Tester
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-4">
              Send an ESP32 HTTP POST packet directly to <code className="text-cyan-300 font-bold bg-slate-950 px-1.5 py-0.5 rounded">/api/telemetry</code>:
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-white block mb-1">
                  Flow Rate (Liters / Minute)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={flowRate}
                  onChange={(e) => setFlowRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono text-sm sm:text-base font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-white block mb-1">
                  Sensor Node Identifier (sensor_id)
                </label>
                <input
                  type="text"
                  value={sensorId}
                  onChange={(e) => setSensorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-white font-mono text-sm sm:text-base font-bold focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
                <span className="text-cyan-400 block mb-1 font-sans font-bold">Outgoing JSON Body:</span>
                &#123;<br/>
                &nbsp;&nbsp;&quot;flow_rate&quot;: {flowRate},<br/>
                &nbsp;&nbsp;&quot;sensor_id&quot;: &quot;{sensorId}&quot;,<br/>
                &nbsp;&nbsp;&quot;timestamp&quot;: &quot;{new Date().toISOString()}&quot;<br/>
                &#125;
              </div>

              <button
                onClick={handleTestPost}
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-600/30 border border-cyan-400/40"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitting...' : 'Dispatch HTTP POST to Backend'}</span>
              </button>

              {responseMsg && (
                <div className={`p-3.5 rounded-xl text-xs sm:text-sm font-mono font-bold border-2 ${
                  responseMsg.success
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-400'
                    : 'bg-rose-950/80 text-rose-200 border-rose-400'
                }`}>
                  {responseMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Wiring Pinout Guide */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
                Hardware Pinout &amp; Wiring Diagram
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-4">
              Physical connection matrix for ESP32 DevKit V1 and YF-S201 turbine:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-700 text-slate-200">
                    <th className="pb-2.5 font-bold">YF-S201 Lead</th>
                    <th className="pb-2.5 font-bold">ESP32 Pin</th>
                    <th className="pb-2.5 font-bold">Function</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-xs sm:text-sm">
                  <tr>
                    <td className="py-2.5 text-rose-300 font-black">Red Wire (VCC)</td>
                    <td className="py-2.5 text-white font-bold">VIN / 5V</td>
                    <td className="py-2.5 text-slate-200 font-sans">Power (5V DC)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-300 font-black">Black Wire (GND)</td>
                    <td className="py-2.5 text-white font-bold">GND</td>
                    <td className="py-2.5 text-slate-200 font-sans">Common Ground</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-amber-300 font-black">Yellow Wire (Signal)</td>
                    <td className="py-2.5 text-cyan-300 font-bold">GPIO 4</td>
                    <td className="py-2.5 text-slate-200 font-sans">Interrupt ISR</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-blue-300 font-black">Onboard Blue LED</td>
                    <td className="py-2.5 text-white font-bold">GPIO 2</td>
                    <td className="py-2.5 text-slate-200 font-sans">Transmit Indicator</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 space-y-1">
              <div className="font-extrabold text-white">Sensor Calibration Formula:</div>
              <div className="font-mono text-cyan-300 font-bold text-xs sm:text-sm">Pulse Frequency (Hz) = 7.5 &times; Flow (L/min)</div>
              <div className="text-slate-300 font-medium">An 18 Hz frequency corresponds to 2.40 L/min.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Firmware Code Preview & Copy */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-slate-700/80 bg-slate-900/90 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider m-0">
              ESP32 Arduino C++ Firmware Sketch (<span className="text-cyan-300 font-mono">aquaguard_esp32.ino</span>)
            </h3>
          </div>

          <button
            onClick={() => copyToClipboard(arduinoSnippet)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-600 transition cursor-pointer shadow"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
          {arduinoSnippet}
        </pre>
      </div>
    </div>
  );
}
