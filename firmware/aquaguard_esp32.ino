/*
 * =================================================================================
 * AquaGuard - Physical IoT Water Flow Sensor Firmware
 * Hardware: ESP32 DevKit V1 + YF-S201 Hall-Effect Water Flow Sensor
 * Communication: Wi-Fi REST API Client -> AquaGuard Backend (/api/telemetry)
 * =================================================================================
 *
 * WIRING DIAGRAM:
 * -------------------------------------------------------------
 * YF-S201 Sensor Pin   | ESP32 Pin      | Description
 * ---------------------|----------------|----------------------
 * Red Wire (VCC)       | 5V (or VIN)    | Power Supply (5V DC)
 * Black Wire (GND)     | GND            | Ground Common
 * Yellow Wire (Signal) | GPIO 4         | Hall Effect Pulse Input (Interrupt)
 * -------------------------------------------------------------
 * Optional Indicator:
 * Onboard LED          | GPIO 2         | Pulses on API Transmission
 *
 * SENSOR CALIBRATION FORMULA:
 * Pulse frequency (Hz) = 7.5 * Flow rate (L/min)
 * -> Flow rate (L/min) = Pulse Frequency / 7.5
 * =================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// --- Wi-Fi Configuration ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // Replace with your Wi-Fi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // Replace with your Wi-Fi Password

// --- AquaGuard Backend Endpoint ---
// If running on local machine, use your computer's local IP (e.g. 192.168.1.15)
const char* SERVER_URL    = "http://192.168.1.100:8000/api/telemetry";
const char* SENSOR_ID     = "PIPE-A1";                // Unique Sensor Node Identifier

// --- Hardware Pins ---
const int FLOW_SENSOR_PIN = 4;                        // GPIO 4 connected to Yellow Signal Wire
const int LED_STATUS_PIN  = 2;                        // Onboard Blue LED

// --- Timing and Pulse Tracking ---
volatile uint32_t pulseCount = 0;
uint32_t lastPulseCount      = 0;
unsigned long lastSampleTime = 0;
const unsigned long SAMPLE_INTERVAL_MS = 2000;        // Sample and transmit every 2 seconds

// --- Interrupt Service Routine (ISR) ---
// Triggered on every rising edge from the hall effect turbine
void IRAM_ATTR pulseCounterISR() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n======================================");
  Serial.println("  AquaGuard IoT Sensor Node Booting   ");
  Serial.println("======================================");

  pinMode(LED_STATUS_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);

  // Attach interrupt to flow sensor pin
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounterISR, RISING);

  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi: %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi Connected!]");
    Serial.print("Node IP Address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_STATUS_PIN, HIGH);
  } else {
    Serial.println("\n[Wi-Fi Connection Failed - Will retry during loop]");
    digitalWrite(LED_STATUS_PIN, LOW);
  }

  lastSampleTime = millis();
}

void loop() {
  // Periodically sample pulse rate and transmit
  if (millis() - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    unsigned long timeElapsed = millis() - lastSampleTime;
    lastSampleTime = millis();

    // Safely copy pulse count within critical section
    noInterrupts();
    uint32_t currentPulses = pulseCount;
    pulseCount = 0;
    interrupts();

    // Calculate flow rate in Liters/Minute
    // Calibration factor for YF-S201: 7.5 pulses per second per 1 L/min
    float secondsElapsed = (float)timeElapsed / 1000.0f;
    float frequencyHz = (float)currentPulses / secondsElapsed;
    float flowRateLPM = frequencyHz / 7.5f;

    // Filter tiny mechanical noise when taps are closed
    if (flowRateLPM < 0.10f) {
      flowRateLPM = 0.0f;
    }

    Serial.printf("[Sensor %s] Pulses: %u | Flow Rate: %.2f L/min\n", 
                  SENSOR_ID, currentPulses, flowRateLPM);

    // Transmit telemetry to AquaGuard server
    transmitTelemetry(flowRateLPM);
  }
}

void transmitTelemetry(float flowRate) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Warning] Wi-Fi disconnected. Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload
  // Format matching AquaGuard specification:
  // { "flow_rate": 2.4, "sensor_id": "PIPE-A1" }
  char jsonPayload[128];
  snprintf(jsonPayload, sizeof(jsonPayload), 
           "{\"flow_rate\": %.2f, \"sensor_id\": \"%s\"}", 
           flowRate, SENSOR_ID);

  digitalWrite(LED_STATUS_PIN, HIGH); // Blink LED on transmit
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("[HTTP %d] Server Response: %s\n", httpResponseCode, response.c_str());
  } else {
    Serial.printf("[HTTP Error] Failed to send: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  digitalWrite(LED_STATUS_PIN, LOW);
  http.end();
}
