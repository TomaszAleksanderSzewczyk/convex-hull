'use client';

import { Point } from '@/lib/types';

interface PointInputProps {
  points: Point[];
  onChange: (points: Point[]) => void;
}

export default function PointInput({ points, onChange }: PointInputProps) {
  const handleChange = (index: number, coord: 'x' | 'y', value: string) => {
    const numValue = value === '' || value === '-' ? 0 : parseFloat(value);
    const newPoints = [...points];
    newPoints[index] = {
      ...newPoints[index],
      [coord]: isNaN(numValue) ? 0 : numValue
    };
    onChange(newPoints);
  };

  const handleRandomize = () => {
    const randomPoints = Array.from({ length: 4 }, () => ({
      x: Math.floor(Math.random() * 21) - 10,
      y: Math.floor(Math.random() * 21) - 10
    }));
    onChange(randomPoints);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Input Points</h2>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        {points.map((point, index) => (
          <div key={index} className="flex items-center gap-1 sm:gap-2">
            <span className="font-medium text-gray-700 text-sm sm:text-base w-7 sm:w-8">P{index + 1}:</span>
            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
              <span className="text-gray-500 text-sm sm:text-base">(</span>
              <input
                type="number"
                value={point.x}
                onChange={(e) => handleChange(index, 'x', e.target.value)}
                className="w-12 sm:w-16 md:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="X"
              />
              <span className="text-gray-500 text-sm sm:text-base">,</span>
              <input
                type="number"
                value={point.y}
                onChange={(e) => handleChange(index, 'y', e.target.value)}
                className="w-12 sm:w-16 md:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded text-right text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Y"
              />
              <span className="text-gray-500 text-sm sm:text-base">)</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleRandomize}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm sm:text-base"
      >
        Randomize
      </button>
    </div>
  );
}
