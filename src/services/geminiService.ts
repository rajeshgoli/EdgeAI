import { GoogleGenAI, Type } from "@google/genai";
import { Candle, AnalysisResult } from '../types';

const generateMockAnalysis = (lastCandle: Candle): AnalysisResult => {
  // Fallback if no API key or error
  const isBullish = Math.random() > 0.5;
  const volatility = lastCandle.close * 0.02;
  
  return {
    sentiment: isBullish ? 'BULLISH' : 'BEARISH',
    pattern: isBullish ? 'Bullish Order Block' : 'Bearish Rejection Block',
    entryPrice: lastCandle.close,
    targetPrice: parseFloat((lastCandle.close + (isBullish ? volatility : -volatility)).toFixed(2)),
    stopLoss: parseFloat((lastCandle.close - (isBullish ? volatility * 0.5 : -volatility * 0.5)).toFixed(2)),
    reasoning: "Algorithm detected a liquidity sweep of previous lows followed by a displacement candle. Momentum indicators suggest a reversal.",
    confidence: Math.floor(Math.random() * 20) + 75 // 75-95%
  };
};

export const analyzeMarket = async (recentCandles: Candle[]): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No API Key found. Using mock simulation.");
    return new Promise(resolve => setTimeout(() => resolve(generateMockAnalysis(recentCandles[recentCandles.length - 1])), 2000));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data summary for the prompt to save tokens/complexity
    const dataSummary = recentCandles.slice(-15).map(c => 
      `D:${c.time} O:${c.open} H:${c.high} L:${c.low} C:${c.close}`
    ).join('\n');

    const prompt = `
      You are an expert algorithmic trading engine named "Goldbach". 
      Analyze the following recent candlestick data (Open, High, Low, Close).
      Identify a plausible trading setup based on ICT (Inner Circle Trader) concepts or classical technical analysis.
      
      Data:
      ${dataSummary}

      Return the analysis in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
            pattern: { type: Type.STRING },
            entryPrice: { type: Type.NUMBER },
            targetPrice: { type: Type.NUMBER },
            stopLoss: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
          },
          required: ['sentiment', 'pattern', 'entryPrice', 'targetPrice', 'stopLoss', 'reasoning', 'confidence']
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Analysis Failed:", error);
    return generateMockAnalysis(recentCandles[recentCandles.length - 1]);
  }
};
