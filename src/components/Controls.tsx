
import React, { useRef } from 'react';
import { BassPattern, DrumPattern } from '../types';
import { BASS_PRESETS, DRUM_PRESETS } from '../presets';

interface ControlsProps {
  isPlaying: boolean;
  tempo: number;
  octave: number;
  onPlayPause: () => void;
  onTempoChange: (newTempo: number) => void;
  onOctaveChange: (newOctave: number) => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onLoadDrumPreset: (pattern: DrumPattern) => void;
  onLoadBassPreset: (pattern: BassPattern) => void;
}

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-8-8-8 8h4v6zm-4 2h14v2H5v-2z"/>
  </svg>
);

const MusicNoteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

const DrumIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 9.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-7-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S13.88 2.5 12.5 2.5zm-8 7C3.12 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zM12 17.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
    </svg>
);

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  tempo,
  octave,
  onPlayPause,
  onTempoChange,
  onOctaveChange,
  onClear,
  onSave,
  onLoad,
  onLoadDrumPreset,
  onLoadBassPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoad(file);
    }
    event.target.value = '';
  };
  
  const handleDrumPresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = event.target.value;
    const preset = DRUM_PRESETS.find(p => p.name === presetName);
    if (preset) {
        onLoadDrumPreset(preset.pattern);
    }
    event.target.value = '';
  };

  const handleBassPresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = event.target.value;
    const preset = BASS_PRESETS.find(p => p.name === presetName);
    if (preset) {
        onLoadBassPreset(preset.pattern);
    }
    event.target.value = '';
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <button
          onClick={onPlayPause}
          className="w-14 h-14 bg-cyan-500 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/30"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
           <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md transition-colors hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            onClick={onSave}
            className="p-2 bg-gray-700 text-gray-300 rounded-md transition-colors hover:bg-gray-600"
            aria-label="Save Pattern"
          >
            <SaveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleLoadClick}
            className="p-2 bg-gray-700 text-gray-300 rounded-md transition-colors hover:bg-gray-600"
            aria-label="Load Pattern"
          >
            <UploadIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
        <div className="flex items-center gap-2">
             <div className="relative">
                <DrumIcon className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                    onChange={handleDrumPresetChange}
                    defaultValue=""
                    className="bg-gray-700 text-gray-300 rounded-md pl-10 pr-4 py-2 border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none cursor-pointer hover:bg-gray-600"
                    aria-label="Load a drum preset"
                >
                    <option value="" disabled>Drum Beats...</option>
                    {DRUM_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                    ))}
                </select>
            </div>
             <div className="relative">
                <MusicNoteIcon className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                    onChange={handleBassPresetChange}
                    defaultValue=""
                    className="bg-gray-700 text-gray-300 rounded-md pl-10 pr-4 py-2 border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none cursor-pointer hover:bg-gray-600"
                    aria-label="Load a bassline preset"
                >
                    <option value="" disabled>Basslines...</option>
                    {BASS_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="octave" className="text-gray-400 font-medium">Octave</label>
            <input
              id="octave"
              type="number"
              min="0"
              max="8"
              value={octave}
              onChange={(e) => onOctaveChange(parseInt(e.target.value, 10))}
              className="w-20 bg-gray-800 text-white text-center rounded-md border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none p-2"
              aria-label="Synth Octave"
            />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label htmlFor="tempo" className="text-gray-400 font-medium">Tempo</label>
        <input
          id="tempo"
          type="range"
          min="40"
          max="240"
          step="1"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
          className="w-full sm:w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <span className="text-lg font-mono bg-gray-800 px-3 py-1 rounded-md w-16 text-center">{tempo}</span>
      </div>
    </div>
  );
};
