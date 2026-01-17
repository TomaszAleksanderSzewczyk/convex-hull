'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Point } from '@/lib/types';
import { convexHull } from '@/lib/convexHull';
import { jarvisMarchWithSteps } from '@/lib/algorithm/jarvisMarchSteps';
import PointInput from '@/components/PointInput';
import Chart from '@/components/Chart';
import Result from '@/components/Result';
import AlgorithmControls from '@/components/AlgorithmControls';

const initialPoints: Point[] = [
  { x: 0, y: 0 },
  { x: 4, y: 0 },
  { x: 4, y: 3 },
  { x: 0, y: 3 },
];

export default function Home() {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const [visualizationMode, setVisualizationMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const result = useMemo(() => convexHull(points), [points]);
  const steps = useMemo(() => jarvisMarchWithSteps(points), [points]);

  const currentStep = steps[currentStepIndex] || null;

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, steps.length]);

  // Reset step when points change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [points]);

  const handlePlay = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [currentStepIndex, steps.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePointsChange = useCallback((newPoints: Point[]) => {
    setPoints(newPoints);
    setVisualizationMode(false);
  }, []);

  const handlePointDrag = useCallback((index: number, newPoint: Point) => {
    setPoints(prev => {
      // Only update if the point actually changed
      if (prev[index].x === newPoint.x && prev[index].y === newPoint.y) {
        return prev;
      }
      const updated = [...prev];
      updated[index] = newPoint;
      return updated;
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Convex Hull of 4 Points
        </h1>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setVisualizationMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !visualizationMode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Result
            </button>
            <button
              onClick={() => {
                setVisualizationMode(true);
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                visualizationMode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Step-by-Step
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <Chart
            points={points}
            result={result}
            step={currentStep}
            visualizationMode={visualizationMode}
            onPointDrag={handlePointDrag}
          />
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <PointInput points={points} onChange={handlePointsChange} />

          {visualizationMode ? (
            <AlgorithmControls
              steps={steps}
              currentStepIndex={currentStepIndex}
              isPlaying={isPlaying}
              onStepChange={setCurrentStepIndex}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          ) : (
            <Result result={result} />
          )}
        </div>
      </div>
    </main>
  );
}
