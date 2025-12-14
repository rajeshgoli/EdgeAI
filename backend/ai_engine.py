import google.generativeai as genai
import os
import json
import base64

# Configure Gemini
# Ideally this comes from env vars, but we'll check os.environ in the function or global scope
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def compile_strategy(pdf_text: str) -> dict:
    """
    Takes raw text from a PDF and asks Gemini to create a "Persona" or "Lens".
    Returns a dict with 'persona' (system prompt) and 'label' (one-word name).
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')

    prompt = f"""
    You are an expert financial analyst. I am going to give you a trading strategy document.
    Your goal is to internalize this strategy and become a "Persona" that analyzes charts STRICTLY through this lens.

    STRATEGY DOCUMENT:
    {pdf_text[:10000]}

    OUTPUT (JSON):
    {{
        "label": "A single word (lowercase, no spaces) that captures the essence of this strategy (e.g., 'momentum', 'breakout', 'wyckoff', 'ict', 'scalping')",
        "persona": "A concise System Instruction for an AI (under 200 words). Format: 'You are a [Strategy Name] expert. You look for [Key Patterns]. You use terms like [Key Terms].'"
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        result = json.loads(response.text)
        return {
            "label": result.get("label", "custom").lower().replace(" ", "-")[:15],
            "persona": result.get("persona", "You are a generic technical analyst.")
        }
    except Exception as e:
        print(f"Error compiling strategy: {e}")
        return {
            "label": "custom",
            "persona": "You are a generic technical analyst. Analyze the chart for trends and support/resistance."
        }

def analyze_chart(chart_data: list, strategy_persona: str, chart_screenshot: str = None) -> dict:
    """
    Sends chart data and the strategy persona to Gemini to get a narrative.
    If a screenshot is provided, uses multimodal analysis.
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')

    # Summarize chart data to save tokens/make it readable
    chart_summary = ""
    for i, candle in enumerate(chart_data[-20:]): # Look at last 20 candles closely
        chart_summary += f"T-{20-i}: Open={candle['open']}, High={candle['high']}, Low={candle['low']}, Close={candle['close']}\n"

    prompt = f"""
    {strategy_persona}

    TASK:
    Analyze the chart using your trading strategy framework.
    {"The image shows the actual chart with price levels marked." if chart_screenshot else ""}
    Identify ONE key insight or setup based on your strategy.

    MARKET DATA (last 20 candles):
    {chart_summary}

    OUTPUT FORMAT (JSON):
    {{
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "narrative": "A short, punchy sentence describing the setup (max 15 words).",
        "key_level": 1234.56 (A relevant price level to watch),
        "reasoning": "2-3 sentences explaining the analysis based on the strategy.",
        "confidence": 75 (0-100 confidence score)
    }}
    """

    try:
        if chart_screenshot:
            # Remove data URL prefix if present
            if chart_screenshot.startswith('data:image'):
                chart_screenshot = chart_screenshot.split(',')[1]

            # Decode base64 to bytes
            image_bytes = base64.b64decode(chart_screenshot)

            # Create image part for multimodal
            image_part = {
                "mime_type": "image/png",
                "data": image_bytes
            }

            response = model.generate_content(
                [prompt, image_part],
                generation_config={"response_mime_type": "application/json"}
            )
        else:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )

        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing chart: {e}")
        error_str = str(e).lower()
        # Return a fallback response instead of raising an exception
        # This prevents 500 errors and gives the frontend something to display
        if '429' in error_str or 'quota' in error_str or 'rate' in error_str:
            return {
                "sentiment": "NEUTRAL",
                "narrative": "API rate limit exceeded. Please wait a moment and try again.",
                "key_level": None,
                "reasoning": "The AI service is temporarily unavailable due to rate limiting.",
                "confidence": 0
            }
        return {
            "sentiment": "NEUTRAL",
            "narrative": "Analysis temporarily unavailable. Please try again.",
            "key_level": None,
            "reasoning": f"AI analysis error: {str(e)[:100]}",
            "confidence": 0
        }

def analyze_chart_with_goldbach(chart_data: list, goldbach_result: dict, chart_screenshot: str = None) -> dict:
    """
    Analyzes chart using Goldbach strategy with multimodal Gemini.
    Combines the mathematical Goldbach analysis with AI vision analysis of the chart.
    """
    model = genai.GenerativeModel('gemini-2.0-flash-exp')

    # Get the Goldbach analysis context
    dealing_range = goldbach_result.get('dealing_range', {})
    current_status = goldbach_result.get('current_status', {})
    signals = goldbach_result.get('signals', [])
    levels = goldbach_result.get('levels_to_draw', [])

    # Build context about Goldbach levels
    levels_context = "\n".join([f"  - {l['label']}: {l['price']}" for l in levels[:8]])  # Top 8 levels
    signals_context = "\n".join([f"  - {s['type']}: {s['details']}" for s in signals if s.get('detected')])

    prompt = f"""
    You are a Goldbach Trading Strategy expert. Analyze this chart using the Power of 3 (PO3) framework.

    GOLDBACH ANALYSIS CONTEXT:
    - Dealing Range: PO3={dealing_range.get('po3_size', 'N/A')}, Low={dealing_range.get('low', 'N/A')}, High={dealing_range.get('high', 'N/A')}
    - Current Price: {current_status.get('price', 'N/A')}
    - Zone: {current_status.get('zone', 'N/A')}
    - Nearest Level: {current_status.get('nearest_level', 'N/A')}

    KEY PRICE LEVELS (Goldbach Ratios):
{levels_context}

    DETECTED PATTERNS:
{signals_context if signals_context else '  - No special patterns detected'}

    {"The attached image shows the chart with Goldbach levels marked as horizontal lines." if chart_screenshot else ""}

    TASK:
    Based on the Goldbach framework and the chart:
    1. Confirm or refine the sentiment (BULLISH/BEARISH/NEUTRAL)
    2. Identify which Goldbach level is most significant right now
    3. Explain where price is likely headed based on the dealing range structure

    OUTPUT FORMAT (JSON):
    {{
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "narrative": "A punchy 10-15 word summary of the Goldbach setup.",
        "reasoning": "2-3 sentences explaining the PO3 dynamics and expected price behavior.",
        "confidence": 75,
        "target_level": "Name of the target Goldbach level",
        "stop_level": "Name of the invalidation level"
    }}
    """

    try:
        if chart_screenshot:
            # Remove data URL prefix if present
            if chart_screenshot.startswith('data:image'):
                chart_screenshot = chart_screenshot.split(',')[1]

            image_bytes = base64.b64decode(chart_screenshot)
            image_part = {
                "mime_type": "image/png",
                "data": image_bytes
            }

            response = model.generate_content(
                [prompt, image_part],
                generation_config={"response_mime_type": "application/json"}
            )
        else:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )

        ai_result = json.loads(response.text)

        # Merge AI insights with Goldbach analysis
        return {
            "sentiment": ai_result.get("sentiment", goldbach_result.get("sentiment", "NEUTRAL")),
            "narrative": ai_result.get("narrative", goldbach_result.get("narrative", "")),
            "reasoning": ai_result.get("reasoning", ""),
            "confidence": ai_result.get("confidence", 50),
            "target_level": ai_result.get("target_level"),
            "stop_level": ai_result.get("stop_level")
        }
    except Exception as e:
        print(f"Error in Goldbach AI analysis: {e}")
        # Fall back to pure mathematical analysis
        return {
            "sentiment": goldbach_result.get("sentiment", "NEUTRAL"),
            "narrative": goldbach_result.get("narrative", "Goldbach analysis complete."),
            "reasoning": f"AI analysis unavailable ({str(e)}). Using pure mathematical analysis.",
            "confidence": 50
        }
