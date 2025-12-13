import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, IPriceLine } from 'lightweight-charts';
import { Candle, PriceLevel } from '../types';

interface ChartProps {
  data: Candle[];
  lines?: PriceLevel[];
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
  const { data, lines = [], colors: {
    backgroundColor = 'transparent',
    textColor = '#ffffff',
  } = {} } = props;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  useImperativeHandle(ref, () => ({
    updateData: (newData: Candle[]) => {
      if (seriesRef.current) {
        seriesRef.current.setData(newData as CandlestickData[]);
        chartRef.current?.timeScale().fitContent();
      }
    },
    appendData: (newData: Candle[]) => {
      if (seriesRef.current) {
        newData.forEach(d => {
          seriesRef.current?.update(d as CandlestickData);
        });
      }
    },
    reset: () => {
      if (seriesRef.current) {
        seriesRef.current.setData([]);
        // Clear lines on reset
        priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
        priceLinesRef.current = [];
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
        vertLines: { color: 'rgba(33, 150, 243, 0.3)' },
        horzLines: { color: 'rgba(33, 150, 243, 0.3)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

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
      const sortedData = [...data].sort((a, b) => (a.time > b.time ? 1 : -1));
      newSeries.setData(sortedData as CandlestickData[]);
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

  // Handle Price Lines
  useEffect(() => {
    if (!seriesRef.current) return;

    // Clear existing lines
    priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
    priceLinesRef.current = [];

    // Add new lines
    lines.forEach(line => {
      const priceLine = seriesRef.current?.createPriceLine({
        price: line.price,
        color: line.color,
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: line.title,
      });
      if (priceLine) {
        priceLinesRef.current.push(priceLine);
      }
    });

  }, [lines]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
});

Chart.displayName = 'Chart';

export default Chart;