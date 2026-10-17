#!/usr/bin/env python3
"""
AquaGuard - Unified Hackathon Runner
Starts both the FastAPI Backend and Vite Frontend concurrently.
"""

import subprocess
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

def print_banner():
    print("""
===================================================================
      _                    ____                     _ 
     / \   __ _ _   _  __ / ___|_   _  __ _ _ __ __| |
    / _ \ / _` | | | |/ _` |  _| | | |/ _` | '__/ _` |
   / ___ \ (_| | |_| | (_| | |_| |_| | (_| | | | (_| |
  /_/   \_\__, |\__,_|\__,_|\____|\__,_|\__,_|_|  \__,_|
             |_|                                       
  AI-Powered Water Intelligence & Anomaly Detection System
===================================================================
[*] Backend API:      http://127.0.0.1:8000
[*] API Docs:         http://127.0.0.1:8000/docs
[*] Frontend Web UI:  http://localhost:5173
[*] Physical IoT:     POST http://127.0.0.1:8000/api/telemetry
===================================================================
    """)

def main():
    print_banner()

    # Launch Backend
    print("[1/2] Launching AquaGuard FastAPI Backend on port 8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run_server.py"],
        cwd=BACKEND_DIR
    )

    time.sleep(1.5)

    # Launch Frontend
    print("[2/2] Launching AquaGuard Frontend on port 5173...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True
    )

    print("\n[OK] AquaGuard is LIVE! Press Ctrl+C in this terminal to stop both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[*] Shutting down AquaGuard services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[*] Successfully stopped.")

if __name__ == "__main__":
    main()
