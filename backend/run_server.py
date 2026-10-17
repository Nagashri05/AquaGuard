import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure current directory is in sys.path
    sys.path.insert(0, os.path.dirname(__file__))
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
