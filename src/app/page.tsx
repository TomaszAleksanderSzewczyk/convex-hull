'use client';

import { useState, useMemo } from 'react';
import { Point } from '@/lib/types';
import { convexHull } from '@/lib/convexHull';
import PointInput from '@/components/PointInput';
import Chart from '@/components/Chart';
import Result from '@/components/Result';

const initialPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 3 },
  { x: 0, y: 3 },
];

export default function Home() {
  const [points, setPoints] = useState<Point[]>(initialPoints);

  const result = useMemo(() => convexHull(points), [points]);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Convex Hull of 4 Points
        </h1>

        {/* Chart on top - full width, larger */}
        <div className="mb-6">
          <Chart points={points} result={result} />
        </div>

        {/* Controls below */}
        <div className="grid md:grid-cols-2 gap-6">
          <PointInput points={points} onChange={setPoints} />
          <Result result={result} />
        </div>
      </div>
    </main>
  );
}
