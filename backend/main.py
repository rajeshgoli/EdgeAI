from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()
import google.generativeai as genai

from utils import load_csv, get_random_slice, get_latest_slice
from goldbach import calculate_goldbach_levels
from ai_engine import compile_strategy, analyze_chart

# Initialize App
app = FastAPI(title="Edge.ai Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Data Once
try:
    df = load_csv()
    print(f"Data loaded: {len(df)} candles.")
except Exception as e:
    print(f"Error loading data: {e}")
    df = None

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# --- Models ---
class SpinResponse(BaseModel):
    past_data: List[dict]
    future_data: List[dict]

class AnalyzeRequest(BaseModel):
    chart_data: List[dict]
    strategy_persona: Optional[str] = None

class AnalyzeResponse(BaseModel):
    sentiment: str
    narrative: str
    key_level: Optional[float]
    goldbach_levels: Optional[List[dict]] = None

# --- Endpoints ---


@app.get("/")
async def root():
    return {"message": "Edge.ai Backend is running", "status": "ok"}

@app.get("/spin", response_model=SpinResponse)
async def spin_wheel():
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # past, future = get_random_slice(df)
    # Use get_latest_slice as requested by user
    past, future = get_latest_slice(df, n=1000)
    return {"past_data": past, "future_data": future}

@app.post("/compile_strategy")
async def api_compile_strategy(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore") # Simple decoding for now
    
    # In a real app, we'd use a PDF parser like PyPDF2 or LlamaParse
    # For hackathon speed, if it's a text file or we just treat it as text
    # If it's actual PDF binary, we need to parse it. 
    # Let's assume for MVP the user uploads a .txt or we try to extract text.
    
    # TODO: Add basic PDF parsing if time permits, for now assume text-based upload or extract strings
    if file.filename.endswith(".pdf"):
        # Very basic "is it a PDF" check. 
        # For the MVP, let's just use the AI to "read" the raw bytes if it's small, 
        # or better, just ask the user to upload text/markdown for the strategy.
        # OR: Use a library. Let's stick to text for simplicity unless requested.
        pass

    persona = compile_strategy(text)
    return {"persona": persona}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    # Mode A: Goldbach (No Persona)
    if not request.strategy_persona:
        levels = calculate_goldbach_levels(request.chart_data)
        return {
            "sentiment": "NEUTRAL",
            "narrative": "Goldbach Levels Calculated. Watch for reactions at 0.11, 0.50, and 0.89.",
            "key_level": None,
            "goldbach_levels": levels
        }
    
    # Mode B: AI Analysis
    ai_result = analyze_chart(request.chart_data, request.strategy_persona)
    return {
        "sentiment": ai_result.get("sentiment", "NEUTRAL"),
        "narrative": ai_result.get("narrative", "Analysis failed."),
        "key_level": ai_result.get("key_level"),
        "goldbach_levels": [] # No overlays in AI mode for now, or maybe add them too?
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
