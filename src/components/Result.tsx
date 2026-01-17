'use client';

import { HullResult } from '@/lib/types';

interface ResultProps {
  result: HullResult;
}

const typeLabels = {
  point: 'Point',
  segment: 'Segment',
  triangle: 'Triangle',
  quadrilateral: 'Quadrilateral',
};

const typeColors = {
  point: 'bg-gray-500',
  segment: 'bg-yellow-500',
  triangle: 'bg-green-500',
  quadrilateral: 'bg-blue-500',
};

export default function Result({ result }: ResultProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">Result</h2>

      <div className="mb-3 sm:mb-4">
        <span className="text-sm sm:text-base text-gray-600">Hull Type: </span>
        <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-sm sm:text-base font-medium ${typeColors[result.type]}`}>
          {typeLabels[result.type]}
        </span>
      </div>

      <div>
        <span className="text-sm sm:text-base text-gray-600 block mb-2">Hull Vertices ({result.vertices.length}):</span>
        {result.vertices.length === 0 ? (
          <p className="text-gray-400 italic text-sm sm:text-base">No vertices</p>
        ) : (
          <ul className="space-y-1">
            {result.vertices.map((vertex, index) => (
              <li key={index} className="font-mono bg-gray-100 px-2 sm:px-3 py-1 rounded text-sm sm:text-base">
                V{index + 1}: ({vertex.x}, {vertex.y})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
