# AquaGuard Physical IoT Hardware Integration Guide

This directory contains the physical firmware and wiring diagrams for connecting an **ESP32 DevKit V1** and a **YF-S201 Hall-Effect Water Flow Sensor** directly to AquaGuard's real-time AI analytics engine.

---

## 1. Hardware Requirements

| Component | Quantity | Purpose |
| :--- | :--- | :--- |
| **ESP32 DevKit V1** | 1 | Microcontroller with Wi-Fi & hardware interrupts |
| **YF-S201 Water Flow Sensor** | 1 | Inline turbine pulse sensor (1–30 L/min range) |
| **Jumper Wires** | 3–5 | Breadboard connections |
| **5V Power Source** | 1 | USB cable or 5V 1A power adapter |
| **Plumbing Adapter (Optional)** | 1 | 1/2" BSP thread to standard tap/hose |

---

## 2. Wiring & Pinout

```
+---------------------------+        +------------------------+
|  YF-S201 Water Flow Sensor |        |      ESP32 DevKit V1   |
|                           |        |                        |
|  Red Wire (VCC) ---------->--------> 5V (or VIN)            |
|  Black Wire (GND) -------->--------> GND                    |
|  Yellow Wire (Signal) ---->--------> GPIO 4 (Interrupt PIN) |
+---------------------------+        +------------------------+
```

*Note: GPIO 4 is configured with internal pullup and a hardware interrupt service routine (`IRAM_ATTR pulseCounterISR`).*

---

## 3. Sensor Physics & Calibration Formula

The YF-S201 uses a magnetic rotor. Each rotor turn triggers a Hall-effect sensor pulse.

$$f = 7.5 \times Q$$

Where:
- $f$ is pulse frequency in **Hertz (Hz)**
- $Q$ is fluid flow rate in **Liters / Minute (L/min)**

Therefore, the firmware calculates instantaneous flow rate as:

$$\text{Flow Rate (L/min)} = \frac{\text{Pulses / Second}}{7.5}$$

---

## 4. Flashing Firmware to ESP32

1. Open **Arduino IDE**.
2. Install the **ESP32 Board Package** (`Tools > Board > Boards Manager > esp32 by Espressif Systems`).
3. Select your board: `Tools > Board > ESP32 Dev Module`.
4. Open [`aquaguard_esp32.ino`](./aquaguard_esp32.ino).
5. Update lines 26–31 with your Wi-Fi credentials and computer IP:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* SERVER_URL    = "http://192.168.1.100:8000/api/telemetry";
   ```
6. Click **Upload** (hold the BOOT button on the ESP32 if required during flashing).
7. Open the Serial Monitor at `115200 baud` to observe live pulse counts and HTTP transmissions.

---

## 5. Testing Without Flashing (Virtual Ingestion)

You can also test the hardware ingestion API directly via `curl` or PowerShell:

```bash
curl -X POST http://localhost:8000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "flow_rate": 2.4,
    "sensor_id": "PIPE-A1",
    "timestamp": "2026-10-08T12:00:00"
  }'
```

The AquaGuard dashboard updates immediately with the newly reported reading and performs instantaneous AI anomaly diagnosis.
