import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, IPriceLine } from 'lightweight-charts';
import { Candle, PriceLevel } from '../types';

interface ChartProps {
  data: Candle[];
  lines?: PriceLevel[];
  onVisibleRangeChange?: (high: number, low: number, currentPrice: number) => void;
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
  getScreenshot: () => string | null;
  getVisibleRange: () => { high: number; low: number; currentPrice: number } | null;
}

const Chart = forwardRef<ChartHandle, ChartProps>((props, ref) => {
  const { data, lines = [], onVisibleRangeChange, colors: {
    backgroundColor = 'transparent',
    textColor = '#94a3b8',
  } = {} } = props;

  const dataRef = useRef<Candle[]>(data);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Keep data ref updated
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useImperativeHandle(ref, () => ({
    updateData: (newData: Candle[]) => {
      if (seriesRef.current) {
        const sortedData = [...newData].sort((a, b) => (a.time > b.time ? 1 : -1));
        const uniqueData = sortedData.filter((item, index, self) =>
          index === 0 || item.time !== self[index - 1].time
        );
        seriesRef.current.setData(uniqueData as CandlestickData[]);
        dataRef.current = newData;
        chartRef.current?.timeScale().fitContent();
      }
    },
    appendData: (newData: Candle[]) => {
      if (seriesRef.current) {
        newData.forEach(d => {
          seriesRef.current?.update(d as CandlestickData);
        });
        dataRef.current = [...dataRef.current, ...newData];
      }
    },
    reset: () => {
      if (seriesRef.current) {
        seriesRef.current.setData([]);
        dataRef.current = [];
        // Clear lines on reset
        priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
        priceLinesRef.current = [];
      }
    },
    getScreenshot: () => {
      if (chartContainerRef.current) {
        const canvas = chartContainerRef.current.querySelector('canvas');
        if (canvas) {
          return canvas.toDataURL('image/png');
        }
      }
      return null;
    },
    getVisibleRange: () => {
      if (!chartRef.current || !seriesRef.current || dataRef.current.length === 0) return null;

      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (!visibleRange) return null;

      const startIdx = Math.max(0, Math.floor(visibleRange.from));
      const endIdx = Math.min(dataRef.current.length - 1, Math.ceil(visibleRange.to));

      const visibleData = dataRef.current.slice(startIdx, endIdx + 1);
      if (visibleData.length === 0) return null;

      const high = Math.max(...visibleData.map(d => d.high));
      const low = Math.min(...visibleData.map(d => d.low));
      const currentPrice = dataRef.current[dataRef.current.length - 1].close;

      return { high, low, currentPrice };
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
        vertLines: { color: 'rgba(51, 65, 85, 0.2)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.2)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 1, // CrosshairMode.Normal
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

    chartRef.current = chart;

    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // Emerald 500
      downColor: '#ef4444', // Red 500
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = newSeries;

    // Initial Data
    if (data.length > 0) {
      // Sort and deduplicate data
      const sortedData = [...data].sort((a, b) => (a.time > b.time ? 1 : -1));
      const uniqueData = sortedData.filter((item, index, self) =>
        index === 0 || item.time !== self[index - 1].time
      );
      newSeries.setData(uniqueData as CandlestickData[]);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Subscribe to visible range changes for dynamic Goldbach updates
    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleVisibleRangeChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!onVisibleRangeChange || dataRef.current.length === 0) return;

        const visibleRange = chart.timeScale().getVisibleLogicalRange();
        if (!visibleRange) return;

        const startIdx = Math.max(0, Math.floor(visibleRange.from));
        const endIdx = Math.min(dataRef.current.length - 1, Math.ceil(visibleRange.to));

        const visibleData = dataRef.current.slice(startIdx, endIdx + 1);
        if (visibleData.length === 0) return;

        const high = Math.max(...visibleData.map(d => d.high));
        const low = Math.min(...visibleData.map(d => d.low));
        const currentPrice = dataRef.current[dataRef.current.length - 1].close;

        onVisibleRangeChange(high, low, currentPrice);
      }, 300); // Debounce 300ms
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(debounceTimer);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chart.remove();
    };
  }, [onVisibleRangeChange]);

  // Handle Price Lines
  useEffect(() => {
    if (!seriesRef.current) return;

    // Clear existing lines
    priceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line));
    priceLinesRef.current = [];

    // Add new lines
    lines.forEach(line => {
      if (typeof line.price !== 'number' || isNaN(line.price)) {
        console.warn('Invalid price line skipped:', line);
        return;
      }

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