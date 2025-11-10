import React from 'react';
import { NUM_STEPS, NUM_NOTES } from '../constants';
import { PianoRollGrid } from '../types';

interface PianoRollProps {
  grid: PianoRollGrid;
  currentStep: number | null;
  isPlaying: boolean;
  onPadClick: (row: number, col: number) => void;
  synthVolume: number;
  onVolumeChange: (newVolume: number) => void;
  noteDuration: number;
  onNoteDurationChange: (newDuration: number) => void;
}

const NOTE_NAMES = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
const IS_BLACK_KEY = [false, true, false, true, false, true, false, false, true, false, true, false];


const VolumeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const Pad: React.FC<{
  noteStatus: 'none' | 'start' | 'continuation';
  isCurrentStep: boolean;
  isPlaying: boolean;
  onClick: () => void;
}> = ({ noteStatus, isCurrentStep, isPlaying, onClick }) => {
  const baseClasses = 'w-full h-full rounded-md transition-all duration-150 ease-in-out transform';
  
  let dynamicClasses;
  const isActive = noteStatus !== 'none';

  if (isActive) {
    if (isCurrentStep && isPlaying) {
      dynamicClasses = 'bg-yellow-300 scale-105 shadow-xl shadow-yellow-300/50';
    } else if (noteStatus === 'start') {
      dynamicClasses = 'bg-pink-500';
    } else { // continuation
      dynamicClasses = 'bg-pink-500/70';
    }
  } else {
    dynamicClasses = 'bg-gray-700/50 hover:bg-gray-600/80';
  }

  return (
    <div className="aspect-square">
        <button
            onClick={onClick}
            className={`${baseClasses} ${dynamicClasses}`}
            aria-pressed={isActive}
        />
    </div>
  );
};

const DURATION_OPTIONS = [
  { label: '1/2', value: 2, title: 'Half Beat (2 steps)' },
  { label: '1', value: 4, title: 'One Beat (4 steps)' },
  { label: '2', value: 8, title: 'Two Beats (8 steps)' },
];

export const PianoRoll: React.FC<PianoRollProps> = ({
  grid,
  currentStep,
  isPlaying,
  onPadClick,
  synthVolume,
  onVolumeChange,
  noteDuration,
  onNoteDurationChange,
}) => {
  return (
    <div
      className="grid gap-1 sm:gap-2 items-center mt-8 pt-4 border-t border-gray-700"
      style={{ gridTemplateColumns: `minmax(80px, auto) repeat(${NUM_STEPS}, minmax(0, 1fr))` }}
    >
      {/* Header Row: Title and Volume */}
      <div className="flex flex-col items-start gap-3 pr-2 h-full justify-center">
        <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400 self-center">Bass Synth</h2>
        <div className="flex items-center gap-2 w-full">
            <VolumeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={synthVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                aria-label="Synth Volume"
            />
        </div>
         <div className="w-full">
          <div className="text-sm text-gray-400 mb-1 text-center font-medium">Note Duration</div>
          <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-md">
            {DURATION_OPTIONS.map(({ label, value, title }) => (
              <button
                key={value}
                onClick={() => onNoteDurationChange(value)}
                title={title}
                className={`px-2 py-1 text-sm font-semibold rounded-md transition-colors ${
                  noteDuration === value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty space above pads to align with drum step numbers */}
      <div style={{ gridColumn: `span ${NUM_STEPS}` }} />

      {/* Grid Body: Note rows */}
      {Array.from({ length: NUM_NOTES }).map((_, noteIndex) => {
        // Pre-calculate note statuses for this row for efficient rendering
        const noteStatuses: ('none' | 'start' | 'continuation')[] = Array(NUM_STEPS).fill('none');
        for (let i = 0; i < NUM_STEPS; i++) {
            const duration = grid[noteIndex][i];
            if (duration > 0) {
                noteStatuses[i] = 'start';
                for (let j = 1; j < duration && i + j < NUM_STEPS; j++) {
                    noteStatuses[i+j] = 'continuation';
                }
            }
        }
        
        return (
            <React.Fragment key={noteIndex}>
              <div className={`flex items-center justify-center text-sm font-bold h-full rounded-md p-1 select-none
                ${IS_BLACK_KEY[noteIndex] 
                    ? 'bg-gray-800 text-white border-l-4 border-gray-800' 
                    : 'bg-gray-300 text-gray-900'
                }`}
              >
                {NOTE_NAMES[noteIndex]}
              </div>

              {Array.from({ length: NUM_STEPS }).map((_, stepIndex) => (
                <Pad
                  key={stepIndex}
                  noteStatus={noteStatuses[stepIndex]}
                  isCurrentStep={currentStep === stepIndex}
                  isPlaying={isPlaying}
                  onClick={() => onPadClick(noteIndex, stepIndex)}
                />
              ))}
            </React.Fragment>
        );
      })}
    </div>
  );
};