import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "aquaguard.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Telemetry table for high frequency sensor logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id TEXT NOT NULL,
        flow_rate REAL NOT NULL,
        expected_flow REAL NOT NULL,
        timestamp TEXT NOT NULL,
        is_simulated INTEGER DEFAULT 0
    );
    """)

    # Alerts & Anomaly reports
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id TEXT NOT NULL,
        severity TEXT NOT NULL,        -- 'NORMAL', 'WARNING', 'HIGH_RISK', 'UNCERTAIN'
        risk_level TEXT NOT NULL,      -- 'Low', 'Medium', 'High', 'Insufficient Evidence'
        confidence REAL NOT NULL,      -- 0.0 to 1.0 (percentage / 100)
        status_label TEXT NOT NULL,    -- 'NORMAL', 'POSSIBLE LEAK DETECTED', 'HIGH-RISK ANOMALY DETECTED', 'INSUFFICIENT EVIDENCE'
        message TEXT NOT NULL,
        evidence_json TEXT NOT NULL,   -- JSON array of evidence strings
        causes_json TEXT NOT NULL,     -- JSON array of possible causes
        recommended_action TEXT NOT NULL,
        estimated_excess_lpm REAL NOT NULL,
        estimated_daily_wastage REAL NOT NULL,
        duration_minutes INTEGER DEFAULT 1,
        timestamp TEXT NOT NULL,
        resolved INTEGER DEFAULT 0
    );
    """)

    # Monitored physical / logical zones
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensor_nodes (
        sensor_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        pipe_section TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Online',
        normal_baseline REAL NOT NULL DEFAULT 0.3,
        last_flow_rate REAL DEFAULT 0.0,
        last_seen TEXT
    );
    """)

    # Seed sensor nodes if not exist
    seed_nodes = [
        ("PIPE-A1", "Hostel Block A - Ground Inflow", "Hostel Block A", "Section A-01", "Online", 0.4),
        ("PIPE-B12", "Hostel Block B - Restroom Riser", "Hostel Block B", "Section B-12", "Online", 0.3),
        ("PIPE-C3", "Academic Wing - Cafeteria Line", "Academic Block C", "Section C-08", "Online", 1.2),
        ("PIPE-ADM1", "Administration - Main Supply", "Admin Building", "Section ADM-02", "Online", 0.8)
    ]

    for node in seed_nodes:
        cursor.execute("""
        INSERT OR IGNORE INTO sensor_nodes (sensor_id, name, location, pipe_section, status, normal_baseline, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        """, node)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("AquaGuard SQLite database initialized successfully.")
