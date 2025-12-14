from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()
import google.generativeai as genai

from utils import load_csv, get_random_slice, get_latest_slice
from goldbach import run_goldbach_analysis, calculate_goldbach_for_range
from ai_engine import compile_strategy, analyze_chart, analyze_chart_with_goldbach

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
    chart_screenshot: Optional[str] = None  # Base64 encoded image

class AnalyzeResponse(BaseModel):
    sentiment: str
    narrative: str
    key_level: Optional[float] = None
    goldbach_levels: Optional[List[dict]] = None
    dealing_range: Optional[Dict[str, Any]] = None
    current_status: Optional[Dict[str, Any]] = None
    signals: Optional[List[Dict[str, Any]]] = None
    reasoning: Optional[str] = None
    confidence: Optional[int] = None

class GoldbachLevelsRequest(BaseModel):
    visible_high: float
    visible_low: float
    current_price: float

class GoldbachLevelsResponse(BaseModel):
    levels: List[dict]
    dealing_range: Dict[str, Any]

# --- Endpoints ---


@app.get("/")
async def root():
    return {"message": "Edge.ai Backend is running", "status": "ok"}

@app.post("/goldbach_levels", response_model=GoldbachLevelsResponse)
async def get_goldbach_levels(request: GoldbachLevelsRequest):
    """Calculate Goldbach levels based on visible chart range (for dynamic zoom updates)"""
    result = calculate_goldbach_for_range(
        request.visible_high,
        request.visible_low,
        request.current_price
    )
    return result

@app.get("/spin", response_model=SpinResponse)
async def spin_wheel():
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")

    # Use get_random_slice to get past data (visible) and future data (hidden for reveal)
    past, future = get_random_slice(df, past=200, future=50)
    return {"past_data": past, "future_data": future}

@app.post("/compile_strategy")
async def api_compile_strategy(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")

    # Check for Goldbach in filename or content
    filename_lower = file.filename.lower() if file.filename else ""
    text_lower = text.lower()

    if "goldbach" in filename_lower or "goldbach" in text_lower or "power of 3" in text_lower or "po3" in text_lower:
        return {"persona": "GOLDBACH_MODE", "label": "goldbach"}

    # AI Compilation - returns both persona and label
    result = compile_strategy(text)
    return {"persona": result["persona"], "label": result["label"]}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    # Mode A: Goldbach (Only when explicitly set)
    if request.strategy_persona == "GOLDBACH_MODE":
        # Run mathematical Goldbach analysis first
        goldbach_result = run_goldbach_analysis(request.chart_data)

        # If we have a screenshot, enhance with AI vision analysis
        if request.chart_screenshot:
            ai_enhanced = analyze_chart_with_goldbach(
                request.chart_data,
                goldbach_result,
                request.chart_screenshot
            )
            return {
                "sentiment": ai_enhanced.get("sentiment", goldbach_result.get("sentiment", "NEUTRAL")),
                "narrative": ai_enhanced.get("narrative", goldbach_result.get("narrative", "")),
                "key_level": None,
                "goldbach_levels": goldbach_result.get("levels_to_draw", []),
                "dealing_range": goldbach_result.get("dealing_range"),
                "current_status": goldbach_result.get("current_status"),
                "signals": goldbach_result.get("signals")
            }

        # No screenshot - return pure mathematical analysis
        return {
            "sentiment": goldbach_result.get("sentiment", "NEUTRAL"),
            "narrative": goldbach_result.get("narrative", "Goldbach Analysis Complete"),
            "key_level": None,
            "goldbach_levels": goldbach_result.get("levels_to_draw", []),
            "dealing_range": goldbach_result.get("dealing_range"),
            "current_status": goldbach_result.get("current_status"),
            "signals": goldbach_result.get("signals")
        }

    # Mode B: AI Analysis with optional screenshot
    # Use a generic persona if none provided
    persona = request.strategy_persona or "You are a technical analyst. Analyze the chart for trends, support/resistance levels, and potential trade setups. Be concise and actionable."
    ai_result = analyze_chart(request.chart_data, persona, request.chart_screenshot)
    return {
        "sentiment": ai_result.get("sentiment", "NEUTRAL"),
        "narrative": ai_result.get("narrative", "Analysis complete."),
        "key_level": ai_result.get("key_level"),
        "goldbach_levels": [],
        "reasoning": ai_result.get("reasoning"),
        "confidence": ai_result.get("confidence")
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
