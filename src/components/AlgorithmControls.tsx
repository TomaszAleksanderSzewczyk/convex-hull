'use client';

import { AlgorithmStep } from '@/lib/types';

interface AlgorithmControlsProps {
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  onStepChange: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function AlgorithmControls({
  steps,
  currentStepIndex,
  isPlaying,
  onStepChange,
  onPlay,
  onPause,
  onReset,
  speed,
  onSpeedChange,
}: AlgorithmControlsProps) {
  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex >= steps.length - 1;

  const stepTypeColors = {
    start: 'bg-blue-100 text-blue-800 border-blue-300',
    checking: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    found: 'bg-green-100 text-green-800 border-green-300',
    complete: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Algorithm Visualization</h2>

      {/* Current step info */}
      <div className={`p-2 sm:p-3 rounded-lg border mb-3 sm:mb-4 ${stepTypeColors[currentStep?.type || 'start']}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-xs font-medium uppercase">{currentStep?.type}</span>
          <span className="text-[10px] sm:text-xs">Step {currentStepIndex + 1} / {steps.length}</span>
        </div>
        <p className="text-xs sm:text-sm">{currentStep?.description}</p>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
        <button
          onClick={onReset}
          disabled={currentStepIndex === 0}
          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <button
          onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous step"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20"/>
            <line x1="5" y1="19" x2="5" y2="5"/>
          </svg>
        </button>

        {isPlaying ? (
          <button
            onClick={onPause}
            className="p-1.5 sm:p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            title="Pause"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={isComplete}
            className="p-1.5 sm:p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
        )}

        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
          disabled={isComplete}
          className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next step"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      {/* Speed control */}
      <div className="mb-3 sm:mb-4">
        <label className="text-xs sm:text-sm text-gray-600 block mb-1">Speed: {speed}x</label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-blue-500 transition-all duration-200"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
