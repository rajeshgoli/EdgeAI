import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import { Candle } from '../types';

interface ChartProps {
  data: Candle[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export interface ChartHandle {
  updateData: (newData: Candle[]) => void;
  appendData: (newData: Candle[]) => void;
  reset: () => void;
}

const Chart = forwardRef<ChartHandle, ChartProps>((props, ref) => {
  const { data, colors: {
    backgroundColor = 'transparent',
    textColor = '#94a3b8',
  } = {} } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useImperativeHandle(ref, () => ({
    updateData: (newData: Candle[]) => {
      if (seriesRef.current) {
        seriesRef.current.setData(newData as CandlestickData[]);
        chartRef.current?.timeScale().fitContent();
      }
    },
    appendData: (newData: Candle[]) => {
        if(seriesRef.current) {
            newData.forEach(d => {
                seriesRef.current?.update(d as CandlestickData);
            });
        }
    },
    reset: () => {
        if(seriesRef.current) {
            seriesRef.current.setData([]);
        }
    }
  }));

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // V5 Change: use addSeries with the Series Constructor
    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = newSeries;
    
    // Initial Data
    if (data.length > 0) {
        newSeries.setData(data as CandlestickData[]);
        chart.timeScale().fitContent();
    }

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

  // Update data if props change significantly (optional, mostly handled by imperitive handle now for game loop)
  useEffect(() => {
      if (seriesRef.current && data.length > 0) {
          seriesRef.current.setData(data as CandlestickData[]);
          chartRef.current?.timeScale().fitContent();
      }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-full"
    />
  );
});

Chart.displayName = 'Chart';

export default Chart;