import google.generativeai as genai
import os
import json

# Configure Gemini
# Ideally this comes from env vars, but we'll check os.environ in the function or global scope
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def compile_strategy(pdf_text: str) -> str:
    """
    Takes raw text from a PDF and asks Gemini to create a "Persona" or "Lens".
    Returns a system prompt string that defines this persona.
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = f"""
    You are an expert financial analyst. I am going to give you a trading strategy document.
    Your goal is to internalize this strategy and become a "Persona" that analyzes charts STRICTLY through this lens.
    
    STRATEGY DOCUMENT:
    {pdf_text[:10000]} # Truncate to avoid context limits if necessary, though 1.5 Pro handles large context.
    
    OUTPUT:
    Write a concise "System Instruction" for an AI that acts as this trader. 
    The instruction should say: "You are a [Strategy Name] expert. You look for [Key Patterns]. You use terms like [Key Terms]."
    Keep it under 200 words.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error compiling strategy: {e}")
        return "You are a generic technical analyst. Analyze the chart for trends and support/resistance."

def analyze_chart(chart_data: list, strategy_persona: str) -> dict:
    """
    Sends chart data and the strategy persona to Gemini to get a narrative.
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    # Summarize chart data to save tokens/make it readable
    # We can send a simplified string representation
    chart_summary = ""
    for i, candle in enumerate(chart_data[-20:]): # Look at last 20 candles closely
        chart_summary += f"T-{20-i}: Open={candle['open']}, High={candle['high']}, Low={candle['low']}, Close={candle['close']}\n"
        
    prompt = f"""
    {strategy_persona}
    
    TASK:
    Analyze the following recent market data (last 20 candles of a 100-candle view).
    Identify ONE key insight or setup based on your strategy.
    
    MARKET DATA:
    {chart_summary}
    
    OUTPUT FORMAT (JSON):
    {{
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "narrative": "A short, punchy sentence describing the setup (max 15 words).",
        "key_level": 1234.56 (A relevant price level to watch)
    }}
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing chart: {e}")
        return {
            "sentiment": "NEUTRAL",
            "narrative": "Market is consolidating.",
            "key_level": chart_data[-1]['close']
        }
