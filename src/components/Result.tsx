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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Result</h2>

      <div className="mb-4">
        <span className="text-gray-600">Hull Type: </span>
        <span className={`inline-block px-3 py-1 rounded-full text-white font-medium ${typeColors[result.type]}`}>
          {typeLabels[result.type]}
        </span>
      </div>

      <div>
        <span className="text-gray-600 block mb-2">Hull Vertices ({result.vertices.length}):</span>
        {result.vertices.length === 0 ? (
          <p className="text-gray-400 italic">No vertices</p>
        ) : (
          <ul className="space-y-1">
            {result.vertices.map((vertex, index) => (
              <li key={index} className="font-mono bg-gray-100 px-3 py-1 rounded">
                V{index + 1}: ({vertex.x}, {vertex.y})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
