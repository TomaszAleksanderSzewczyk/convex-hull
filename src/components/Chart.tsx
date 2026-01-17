'use client';

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { Point, HullResult } from '@/lib/types';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ChartProps {
  points: Point[];
  result: HullResult;
}

export default function Chart({ points, result }: ChartProps) {
  const allX = points.map(p => p.x);
  const allY = points.map(p => p.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  // Larger padding for more visible plane
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const maxRange = Math.max(rangeX, rangeY);
  const padding = Math.max(3, maxRange * 0.5);

  const hullData = result.vertices.length > 0
    ? [...result.vertices, result.vertices[0]]
    : [];

  const data = {
    datasets: [
      {
        label: 'Convex Hull',
        data: hullData,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        showLine: true,
        pointRadius: 0,
        borderWidth: 3,
        order: 2,
      },
      {
        label: 'Points',
        data: points,
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 1)',
        pointRadius: 10,
        pointHoverRadius: 12,
        showLine: false,
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context: TooltipItem<'scatter'>) {
            const x = context.parsed.x ?? 0;
            const y = context.parsed.y ?? 0;
            return `(${x}, ${y})`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Visualization</h2>
      <div className="h-[500px] md:h-[600px]">
        <Scatter data={data} options={options} />
      </div>
    </div>
  );
}
