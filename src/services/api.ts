import { Candle, AnalysisResult, SpinResponse, GoldbachLevelsResponse } from '../types';

const API_URL = 'http://localhost:8000';

export const spinWheel = async (): Promise<SpinResponse> => {
    const response = await fetch(`${API_URL}/spin`);
    if (!response.ok) {
        throw new Error('Failed to spin the wheel');
    }
    return response.json();
};

export const compileStrategy = async (file: File): Promise<{ persona: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/compile_strategy`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to compile strategy');
    }
    return response.json();
};

export const analyzeMarket = async (
    chartData: Candle[],
    strategyPersona?: string,
    chartScreenshot?: string
): Promise<AnalysisResult> => {
    console.log("analyzeMarket called with:", {
        chartDataLength: chartData.length,
        hasPersona: !!strategyPersona,
        hasScreenshot: !!chartScreenshot,
        screenshotSize: chartScreenshot?.length || 0
    });

    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chart_data: chartData,
            strategy_persona: strategyPersona,
            chart_screenshot: chartScreenshot,
        }),
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Failed to analyze market: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("API response data:", result);
    return result;
};

export const getGoldbachLevels = async (
    visibleHigh: number,
    visibleLow: number,
    currentPrice: number
): Promise<GoldbachLevelsResponse> => {
    const response = await fetch(`${API_URL}/goldbach_levels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            visible_high: visibleHigh,
            visible_low: visibleLow,
            current_price: currentPrice,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get Goldbach levels');
    }
    return response.json();
};
