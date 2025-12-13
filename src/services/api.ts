const API_URL = 'http://localhost:8003';

export interface Candle {
    time: number; // Unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface SpinResponse {
    past_data: Candle[];
    future_data: Candle[];
}

export interface AnalysisResult {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    narrative: string;
    key_level?: number;
    goldbach_levels?: { value: number; label: string; color: string }[];
}

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

export const analyzeMarket = async (chartData: Candle[], strategyPersona?: string): Promise<AnalysisResult> => {
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chart_data: chartData,
            strategy_persona: strategyPersona,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to analyze market');
    }
    return response.json();
};
