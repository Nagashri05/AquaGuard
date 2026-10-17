import os
import sys
import uvicorn

# Ensure repository root and backend directory are in sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting AquaGuard production server on port {port}...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
