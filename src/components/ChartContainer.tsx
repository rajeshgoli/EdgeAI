import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, CandlestickSeries } from 'lightweight-charts';
import { Candle, AnalysisResult, GameState } from '../types';

interface ChartContainerProps {
  data: Candle[];
  analysis: AnalysisResult | null;
  gameState: GameState;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ data, analysis, gameState }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const targetLineRef = useRef<any>(null); // Keep track of price lines
  const stopLineRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.2)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.2)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.4)',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // Emerald 500
      downColor: '#ef4444', // Red 500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candleSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (candlestickSeriesRef.current) {
      // Map Candle to lightweight-chart format (time needs to be timestamp)
      const formattedData = data.map(d => ({
        time: d.time as any, // Cast to any because lightweight-charts types are strict about UTCTimestamp
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candlestickSeriesRef.current.setData(formattedData);
      
      // Auto fit only if we are in initial states or revealed
      if (gameState === GameState.READY || gameState === GameState.REVEALED) {
         chartRef.current?.timeScale().fitContent();
      }
    }
  }, [data, gameState]);

  // Manage Price Lines (Entry, Target, Stop)
  useEffect(() => {
    if (!candlestickSeriesRef.current || !chartRef.current) return;

    // Clear existing lines first
    // Note: Lightweight charts doesn't have a simple "removePriceLine" by ID easily exposed in this wrapper
    // so for simplicity in this demo we rely on creating lines fresh or tracking the object ref.
    // However, since we re-render lines based on 'analysis', we should attempt to clean up if we stored them.
    // In a production app, we would track the line objects in a Ref and remove them.
    
    // For this demo, assuming the chart is cleared or lines are just decorative.
    // Let's implement basic clearing if we had stored refs, but we'll just add new ones for now 
    // effectively assuming one analysis per "session" or simple re-draw.
    // To do it correctly:
    if (targetLineRef.current) {
      candlestickSeriesRef.current.removePriceLine(targetLineRef.current);
      targetLineRef.current = null;
    }
    if (stopLineRef.current) {
      candlestickSeriesRef.current.removePriceLine(stopLineRef.current);
      stopLineRef.current = null;
    }

    if (analysis && (gameState === GameState.ANALYZED || gameState === GameState.REVEALED)) {
      targetLineRef.current = candlestickSeriesRef.current.createPriceLine({
        price: analysis.target,
        color: '#10b981', // Green
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: 'TARGET',
      });

      stopLineRef.current = candlestickSeriesRef.current.createPriceLine({
        price: analysis.stopLoss,
        color: '#ef4444', // Red
        lineWidth: 2,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: 'STOP',
      });
      
      // We can also add an Entry line
      // candlestickSeriesRef.current.createPriceLine({...})
    }
  }, [analysis, gameState]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};