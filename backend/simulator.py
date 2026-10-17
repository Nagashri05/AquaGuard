import asyncio
import random
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
from database import get_connection
from ai_engine import ai_engine

class AquaGuardSimulator:
    def __init__(self):
        self.is_demo_mode = True
        self.current_scenario = "normal"  # 'normal', 'small_leak', 'major_leak', 'noisy'
        self.active_sensor_id = "PIPE-B12"  # Primary showcase node (Hostel Block B)
        self.running = False
        self.latest_telemetry: Dict[str, Any] = {}
        self.subscribers: List[asyncio.Queue] = []
        
        # Pre-seed history of the last 24 hours so charts look rich and realistic on first launch!
        self.preseed_history()

    def set_scenario(self, scenario_name: str):
        if scenario_name in ["normal", "small_leak", "major_leak", "noisy"]:
            self.current_scenario = scenario_name
            # Trigger immediate re-evaluation
            self.generate_tick()
            return True
        return False

    def set_mode(self, is_demo: bool):
        self.is_demo_mode = is_demo

    def preseed_history(self):
        """Preseeds database with 24 hours of realistic telemetry so graphs look populated."""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) as cnt FROM telemetry")
            count = cursor.fetchone()["cnt"]
            if count > 20:
                conn.close()
                return

            now = datetime.now()
            entries = []
            
            # Generate hourly entries for the past 24 hours
            for h in range(24, 0, -1):
                past_time = now - timedelta(hours=h)
                expected = ai_engine.get_diurnal_expected_flow(past_time)
                
                # Normal variation around expected
                actual = max(0.05, round(expected + random.uniform(-0.15, 0.2), 2))
                entries.append(("PIPE-B12", actual, expected, past_time.isoformat(), 1))
                
            cursor.executemany("""
                INSERT INTO telemetry (sensor_id, flow_rate, expected_flow, timestamp, is_simulated)
                VALUES (?, ?, ?, ?, ?)
            """, entries)
            
            conn.commit()
            conn.close()
        except Exception as e:
            print("Error preseeding history:", e)

    def generate_current_reading(self) -> float:
        """Returns flow rate based on active scenario."""
        if self.current_scenario == "normal":
            # Prompt: "Start with: NORMAL Flow: 0.3 L/min"
            # Slight natural vibration: 0.28 to 0.32 L/min
            return round(0.3 + random.uniform(-0.03, 0.03), 2)
            
        elif self.current_scenario == "small_leak":
            # Prompt: "Then activate 'Small Leak'. Dashboard shows: POSSIBLE LEAK DETECTED, Risk: Medium, Confidence: 87%"
            # Moderate leak: 2.4 L/min (matching prompt ESP32 sample 2.4 L/min)
            return round(2.4 + random.uniform(-0.06, 0.06), 2)
            
        elif self.current_scenario == "major_leak":
            # Prompt: "Then activate 'Major Leak'. Show: HIGH-RISK ANOMALY, Estimated water at risk, Recommended inspection"
            # Major burst: ~14.8 L/min
            return round(14.8 + random.uniform(-0.25, 0.25), 2)
            
        elif self.current_scenario == "noisy":
            # Prompt: "Finally activate 'Noisy Data'. Show: INSUFFICIENT EVIDENCE, 'Please collect better sensor data before taking action.'"
            # Wild erratic spikes between 0.1 and 16.5 L/min
            return round(random.choice([0.1, 8.4, 1.2, 16.9, 0.4, 11.2]) + random.uniform(-0.5, 0.5), 2)
            
        return 0.3

    def generate_tick(self) -> Dict[str, Any]:
        """Runs one cycle of telemetry generation and AI analysis."""
        current_flow = self.generate_current_reading()
        now_str = datetime.now().isoformat()
        
        # Analyze with AI
        is_noisy = (self.current_scenario == "noisy")
        analysis = ai_engine.analyze_flow(
            sensor_id=self.active_sensor_id,
            current_flow=current_flow,
            timestamp_str=now_str,
            pipe_section="Section B-12",
            location="Hostel Block B",
            is_noisy_override=is_noisy,
            simulated_scenario=self.current_scenario
        )
        
        self.latest_telemetry = analysis
        
        # Save to DB
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO telemetry (sensor_id, flow_rate, expected_flow, timestamp, is_simulated)
                VALUES (?, ?, ?, ?, ?)
            """, (
                self.active_sensor_id,
                current_flow,
                analysis["ai_projections"]["expected_flow_lpm"],
                now_str,
                1 if self.is_demo_mode else 0
            ))
            
            # Update sensor node
            cursor.execute("""
                UPDATE sensor_nodes
                SET last_flow_rate = ?, last_seen = ?
                WHERE sensor_id = ?
            """, (current_flow, now_str, self.active_sensor_id))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print("DB save error in tick:", e)
            
        return analysis

    async def run_loop(self):
        """Background simulator loop running every 2.5 seconds for snappy live UI."""
        self.running = True
        while self.running:
            if self.is_demo_mode:
                analysis = self.generate_tick()
                # Broadcast to subscribers if any
                for queue in list(self.subscribers):
                    try:
                        await queue.put(analysis)
                    except Exception:
                        pass
            await asyncio.sleep(2.5)

simulator = AquaGuardSimulator()
