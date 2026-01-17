'use client';

import { useRef, useCallback, useState } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TooltipItem,
  Plugin,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { Point, HullResult, AlgorithmStep } from '@/lib/types';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface ChartProps {
  points: Point[];
  result: HullResult;
  step?: AlgorithmStep | null;
  visualizationMode?: boolean;
  onPointDrag?: (index: number, newPoint: Point) => void;
}

const pointColors = [
  { bg: '#3b82f6', border: '#1d4ed8' },
  { bg: '#10b981', border: '#059669' },
  { bg: '#f59e0b', border: '#d97706' },
  { bg: '#ef4444', border: '#dc2626' },
];

export default function Chart({ points, result, step, visualizationMode = false, onPointDrag }: ChartProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<Point | null>(null);

  // Use drag position for the dragged point, otherwise use original points
  const displayPoints = points.map((p, i) =>
    (draggingIndex === i && dragPosition) ? dragPosition : p
  );

  const allX = displayPoints.map(p => p.x);
  const allY = displayPoints.map(p => p.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const maxRange = Math.max(rangeX, rangeY);
  const padding = Math.max(3, maxRange * 0.5);

  // Find which point is at given pixel coordinates
  const findPointAtPixel = useCallback((chart: ChartJS<'scatter'>, x: number, y: number): number | null => {
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const hitRadius = 15; // pixels

    for (let i = 0; i < displayPoints.length; i++) {
      const pointPixelX = xScale.getPixelForValue(displayPoints[i].x);
      const pointPixelY = yScale.getPixelForValue(displayPoints[i].y);
      const distance = Math.sqrt((x - pointPixelX) ** 2 + (y - pointPixelY) ** 2);
      if (distance <= hitRadius) {
        return i;
      }
    }
    return null;
  }, [displayPoints]);

  // Convert pixel coordinates to data coordinates
  const pixelToData = useCallback((chart: ChartJS<'scatter'>, pixelX: number, pixelY: number): Point => {
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    return {
      x: Math.round((xScale.getValueForPixel(pixelX) ?? 0) * 10) / 10,
      y: Math.round((yScale.getValueForPixel(pixelY) ?? 0) * 10) / 10,
    };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (visualizationMode || !onPointDrag) return;

    const chart = chartRef.current;
    if (!chart) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pointIndex = findPointAtPixel(chart, x, y);
    if (pointIndex !== null) {
      setDraggingIndex(pointIndex);
      event.currentTarget.style.cursor = 'grabbing';
    }
  }, [visualizationMode, onPointDrag, findPointAtPixel]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (draggingIndex !== null) {
      const newPoint = pixelToData(chart, x, y);
      setDragPosition(newPoint);
    } else if (!visualizationMode && onPointDrag) {
      // Change cursor when hovering over a point
      const pointIndex = findPointAtPixel(chart, x, y);
      event.currentTarget.style.cursor = pointIndex !== null ? 'grab' : 'default';
    }
  }, [draggingIndex, pixelToData, findPointAtPixel, visualizationMode, onPointDrag]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null && dragPosition && onPointDrag) {
      onPointDrag(draggingIndex, dragPosition);
    }
    setDraggingIndex(null);
    setDragPosition(null);
    event.currentTarget.style.cursor = 'default';
  }, [draggingIndex, dragPosition, onPointDrag]);

  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null && dragPosition && onPointDrag) {
      onPointDrag(draggingIndex, dragPosition);
    }
    setDraggingIndex(null);
    setDragPosition(null);
    event.currentTarget.style.cursor = 'default';
  }, [draggingIndex, dragPosition, onPointDrag]);

  // Use step hull if in visualization mode, otherwise use final result
  const hullVertices = visualizationMode && step ? step.hullSoFar : result.vertices;

  // Custom plugin to draw hull polygon and visualization elements
  const visualizationPlugin: Plugin<'scatter'> = {
    id: 'visualization',
    beforeDatasetsDraw: (chart) => {
      const ctx = chart.ctx;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      ctx.save();

      // Draw hull polygon (filled) if we have at least 3 points
      if (hullVertices.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(xScale.getPixelForValue(hullVertices[0].x), yScale.getPixelForValue(hullVertices[0].y));
        for (let i = 1; i < hullVertices.length; i++) {
          ctx.lineTo(xScale.getPixelForValue(hullVertices[i].x), yScale.getPixelForValue(hullVertices[i].y));
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (hullVertices.length === 2) {
        // Draw line for 2 points
        ctx.beginPath();
        ctx.moveTo(xScale.getPixelForValue(hullVertices[0].x), yScale.getPixelForValue(hullVertices[0].y));
        ctx.lineTo(xScale.getPixelForValue(hullVertices[1].x), yScale.getPixelForValue(hullVertices[1].y));
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw visualization elements in step mode
      if (visualizationMode && step) {
        // Draw line from current point to candidate (solid blue line)
        if (step.currentPoint && step.candidatePoint) {
          ctx.beginPath();
          ctx.moveTo(
            xScale.getPixelForValue(step.currentPoint.x),
            yScale.getPixelForValue(step.currentPoint.y)
          );
          ctx.lineTo(
            xScale.getPixelForValue(step.candidatePoint.x),
            yScale.getPixelForValue(step.candidatePoint.y)
          );
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw line from current point to checking point (dashed yellow line)
        if (step.currentPoint && step.checkingPoint) {
          ctx.beginPath();
          ctx.moveTo(
            xScale.getPixelForValue(step.currentPoint.x),
            yScale.getPixelForValue(step.currentPoint.y)
          );
          ctx.lineTo(
            xScale.getPixelForValue(step.checkingPoint.x),
            yScale.getPixelForValue(step.checkingPoint.y)
          );
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw current point highlight (green circle)
        if (step.currentPoint) {
          const x = xScale.getPixelForValue(step.currentPoint.x);
          const y = yScale.getPixelForValue(step.currentPoint.y);
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(34, 197, 94, 1)';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Draw candidate point highlight (blue circle)
        if (step.candidatePoint) {
          const x = xScale.getPixelForValue(step.candidatePoint.x);
          const y = yScale.getPixelForValue(step.candidatePoint.y);
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Draw checking point highlight (yellow circle)
        if (step.checkingPoint) {
          const x = xScale.getPixelForValue(step.checkingPoint.x);
          const y = yScale.getPixelForValue(step.checkingPoint.y);
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(251, 191, 36, 1)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      ctx.restore();
    },
  };

  const pointDatasets = displayPoints.map((point, index) => ({
    label: `P${index + 1}`,
    data: [{ x: point.x, y: point.y }],
    backgroundColor: pointColors[index].bg,
    borderColor: pointColors[index].border,
    pointRadius: 12,
    pointHoverRadius: 14,
    pointBorderWidth: 2,
    pointHoverBorderWidth: 3,
    showLine: false,
    order: 1,
  }));

  const data = {
    datasets: pointDatasets,
  };

  const findOverlappingPoints = (x: number, y: number): number[] => {
    const overlapping: number[] = [];
    displayPoints.forEach((point, index) => {
      if (point.x === x && point.y === y) {
        overlapping.push(index);
      }
    });
    return overlapping;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: visualizationMode ? 0 : 300,
    },
    interaction: {
      mode: 'nearest' as const,
      intersect: true,
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: minX - padding,
        max: maxX + padding,
        title: {
          display: true,
          text: 'X',
          font: { size: 14, weight: 'bold' as const },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        type: 'linear' as const,
        min: minY - padding,
        max: maxY + padding,
        title: {
          display: true,
          text: 'Y',
          font: { size: 14, weight: 'bold' as const },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          generateLabels: (chart: ChartJS) => {
            const datasets = chart.data.datasets;
            return datasets.map((ds, i) => ({
              text: ds.label || '',
              fillStyle: pointColors[i]?.bg || '#000',
              strokeStyle: pointColors[i]?.border || '#000',
              lineWidth: 2,
              pointStyle: 'circle' as const,
              hidden: false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 14,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 4,
        callbacks: {
          title: (items: TooltipItem<'scatter'>[]) => {
            if (items.length === 0) return '';
            const x = items[0].parsed.x ?? 0;
            const y = items[0].parsed.y ?? 0;
            return `Position: (${x}, ${y})`;
          },
          label: (context: TooltipItem<'scatter'>) => {
            const x = context.parsed.x ?? 0;
            const y = context.parsed.y ?? 0;
            const overlapping = findOverlappingPoints(x, y);
            const currentLabel = context.dataset.label;
            const currentIndex = parseInt(currentLabel?.replace('P', '') || '0') - 1;

            if (overlapping[0] === currentIndex) {
              if (overlapping.length > 1) {
                return overlapping.map(idx => `P${idx + 1}`).join(', ') + ' (overlapping)';
              }
            }
            return currentLabel || '';
          },
          labelColor: (context: TooltipItem<'scatter'>) => {
            const bgColor = context.dataset.backgroundColor as string || '#000';
            return {
              borderColor: bgColor,
              backgroundColor: bgColor,
              borderWidth: 2,
              borderRadius: 2,
            };
          },
        },
        filter: (item: TooltipItem<'scatter'>) => {
          const x = item.parsed.x ?? 0;
          const y = item.parsed.y ?? 0;
          const overlapping = findOverlappingPoints(x, y);
          const currentLabel = item.dataset.label;
          const currentIndex = parseInt(currentLabel?.replace('P', '') || '0') - 1;
          return overlapping[0] === currentIndex;
        },
      },
    },
  };

  // Create a unique key based on hull vertices to force chart re-render when hull changes
  // Include step info in key to force re-render when step changes
  const stepKey = step ? `${step.currentPoint?.x},${step.currentPoint?.y}-${step.candidatePoint?.x},${step.candidatePoint?.y}-${step.checkingPoint?.x},${step.checkingPoint?.y}` : '';
  const chartKey = hullVertices.map(v => `${v.x},${v.y}`).join('|') + stepKey;

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-800">Visualization</h2>
      <div className="h-[280px] sm:h-[400px] md:h-[500px] lg:h-[600px]">
        <Scatter
          ref={chartRef}
          key={chartKey}
          data={data}
          options={options}
          plugins={[visualizationPlugin]}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Legend */}
      <div className="mt-2 sm:mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 justify-center text-xs sm:text-sm">
        {displayPoints.map((point, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2">
            <span
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex-shrink-0"
              style={{
                backgroundColor: pointColors[index].bg,
                borderColor: pointColors[index].border
              }}
            />
            <span className="text-gray-600 truncate">
              P{index + 1}: ({point.x}, {point.y})
            </span>
          </div>
        ))}
      </div>

      {/* Visualization legend */}
      {visualizationMode && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t flex flex-wrap gap-2 sm:gap-4 justify-center text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-green-500"></span>
            <span className="text-gray-500">Current point</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 sm:w-5 h-0.5 bg-blue-500"></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-blue-500"></span>
            <span className="text-gray-500">Candidate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 sm:w-5 h-0.5 bg-yellow-500" style={{backgroundImage: 'repeating-linear-gradient(90deg, #eab308 0, #eab308 3px, transparent 3px, transparent 6px)'}}></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-yellow-500"></span>
            <span className="text-gray-500">Checking</span>
          </div>
        </div>
      )}
    </div>
  );
}
