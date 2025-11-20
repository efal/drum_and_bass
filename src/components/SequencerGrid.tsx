import React from 'react';
import { NUM_STEPS, SOUND_LIBRARY } from '../constants';
import { DrumGrid, DrumSound } from '../types';

interface SequencerGridProps {
  grid: DrumGrid;
  currentStep: number | null;
  isPlaying: boolean;
  onPadClick: (row: number, col: number) => void;
  selectedSounds: DrumSound[];
  onSoundChange: (trackIndex: number, newSound: DrumSound) => void;
  trackVolumes: number[];
  onVolumeChange: (trackIndex: number, newVolume: number) => void;
  trackPans: number[];
  onPanChange: (trackIndex: number, newPan: number) => void;
  soloedTracks: boolean[];
  onSoloTrack: (trackIndex: number) => void;
  onPreviewSample: (sound: DrumSound, volume: number) => void;
  onStopPreview: () => void;
}

const VolumeIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        {title && <title>{title}</title>}
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const PanIcon: React.FC<{ className?: string; title?: string }> = ({ className, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        {title && <title>{title}</title>}
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
);


const Pad: React.FC<{
  isActive: boolean;
  isCurrentStep: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ isActive, isCurrentStep, isPlaying, onClick, onMouseEnter, onMouseLeave }) => {
  const baseClasses = 'w-full h-full rounded-md transition-all duration-150 ease-in-out transform';
  
  let dynamicClasses;

  if (isActive) {
    if (isCurrentStep && isPlaying) {
      // Style for an active pad being played (bright flash, no pulse)
      dynamicClasses = 'bg-cyan-300 scale-105 shadow-xl shadow-cyan-300/50';
    } else {
      // Style for an active pad that is not being played (add pulsing glow)
      dynamicClasses = 'bg-cyan-500 animate-subtle-pulse';
    }
  } else {
    // Style for an inactive pad
    dynamicClasses = 'bg-gray-700/50 hover:bg-gray-600/80';
  }

  return (
    <div className="aspect-square">
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`${baseClasses} ${dynamicClasses}`}
            aria-pressed={isActive}
        />
    </div>
  );
};


export const SequencerGrid: React.FC<SequencerGridProps> = ({
  grid,
  currentStep,
  isPlaying,
  onPadClick,
  selectedSounds,
  onSoundChange,
  trackVolumes,
  onVolumeChange,
  trackPans,
  onPanChange,
  soloedTracks,
  onSoloTrack,
  onPreviewSample,
  onStopPreview,
}) => {
  return (
    <div
      className="grid gap-1 sm:gap-2 items-center"
      style={{ gridTemplateColumns: `minmax(240px, 1fr) repeat(${NUM_STEPS}, minmax(0, 1fr))` }}
    >
      {/* Header Row: Step numbers */}
      <div /> {/* Empty top-left corner */}
      {Array.from({ length: NUM_STEPS }).map((_, stepIndex) => (
        <div
          key={stepIndex}
          className={`text-center text-xs font-mono p-1 rounded-t-md transition-colors duration-150 ${
            currentStep === stepIndex && isPlaying ? 'text-cyan-300 bg-gray-700/80' : 'text-gray-500'
          }`}
        >
          {stepIndex + 1}
        </div>
      ))}

      {/* Grid Body: Instrument rows */}
      {selectedSounds.map((soundId, soundIndex) => (
        <React.Fragment key={soundIndex}>
          {/* Sound selector, Volume & Solo Controls */}
          <div className="flex items-center gap-2 pr-2">
            <div className="flex-grow flex flex-col gap-2">
                <select
                value={soundId}
                onChange={(e) => onSoundChange(soundIndex, e.target.value)}
                className="bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full appearance-none cursor-pointer"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                }}
                >
                {Object.entries(SOUND_LIBRARY).map(([category, sounds]) => (
                    <optgroup label={category} key={category}>
                    {sounds.map((sound) => (
                        <option key={sound.id} value={sound.id}>
                        {sound.name}
                        </option>
                    ))}
                    </optgroup>
                ))}
                </select>
                <div className="flex items-center gap-2">
                    <VolumeIcon className="w-5 h-5 text-gray-400" title="Volume"/>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={trackVolumes[soundIndex]}
                        onChange={(e) => onVolumeChange(soundIndex, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        aria-label={`Volume for track ${soundIndex + 1}`}
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <PanIcon className="w-5 h-5 text-gray-400" title="Pan"/>
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={trackPans[soundIndex]}
                        onChange={(e) => onPanChange(soundIndex, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        aria-label={`Pan for track ${soundIndex + 1}`}
                    />
                </div>
            </div>
             <button
              onClick={() => onSoloTrack(soundIndex)}
              className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm transition-colors flex-shrink-0 ${
                soloedTracks[soundIndex]
                  ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-pressed={soloedTracks[soundIndex]}
              title="Solo Track"
            >
              S
            </button>
          </div>
          {/* Pads for this sound */}
          {Array.from({ length: NUM_STEPS }).map((_, stepIndex) => (
            <Pad
              key={stepIndex}
              isActive={grid[soundIndex][stepIndex]}
              isCurrentStep={currentStep === stepIndex}
              isPlaying={isPlaying}
              onClick={() => onPadClick(soundIndex, stepIndex)}
              onMouseEnter={() => onPreviewSample(soundId, trackVolumes[soundIndex])}
              onMouseLeave={onStopPreview}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};