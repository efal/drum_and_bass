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

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
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
    <div className="w-full bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 p-3 shadow-xl flex flex-col gap-3">
      {/* Top Row: Controls excluding Tempo */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
        
        {/* Left Group: Play Button */}
        <button
            onClick={onPlayPause}
            className={`h-10 w-14 flex items-center justify-center rounded-md transition-all duration-200 flex-shrink-0 ${
            isPlaying 
            ? 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/20' 
            : 'bg-gray-700 text-cyan-400 hover:bg-gray-600 border border-gray-600'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
        >
            {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>

        {/* Center Group: Octave & Presets */}
        <div className="flex flex-wrap justify-center gap-2 items-center flex-grow">
             {/* Compact Octave */}
            <div className="flex items-center bg-gray-900/60 rounded-md px-2 py-1 h-10 border border-gray-700">
                <span className="text-[10px] font-bold text-gray-500 uppercase mr-2">Octave</span>
                 <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                        <label key={val} className={`cursor-pointer w-6 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                        octave === val 
                            ? 'bg-cyan-600 text-white shadow-sm' 
                            : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        }`}>
                        <input
                            type="radio"
                            name="octave"
                            value={val}
                            checked={octave === val}
                            onChange={() => onOctaveChange(val)}
                            className="hidden"
                        />
                        {val}
                        </label>
                    ))}
                 </div>
            </div>

            {/* Presets */}
            <div className="flex gap-2">
                <select
                    onChange={handleDrumPresetChange}
                    value=""
                    className="h-10 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded px-3 border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
                    title="Drum Presets"
                >
                    <option value="" disabled className="text-gray-400">Drums</option>
                    {DRUM_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name} className="bg-gray-800 text-white">{preset.name}</option>
                    ))}
                </select>

                <select
                    onChange={handleBassPresetChange}
                    value=""
                    className="h-10 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded px-3 border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
                    title="Bass Presets"
                >
                    <option value="" disabled className="text-gray-400">Synth</option>
                    {BASS_PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name} className="bg-gray-800 text-white">{preset.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Right Group: Actions */}
        <div className="flex items-center gap-1 bg-gray-900/30 p-1 rounded-lg border border-gray-700/50 ml-auto md:ml-0">
             <button onClick={onClear} className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors" title="Clear Pattern">
                <TrashIcon className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-gray-700 mx-1"></div>
              <button onClick={onSave} className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded transition-colors" title="Save Pattern">
                <SaveIcon className="w-4 h-4" />
              </button>
              <button onClick={handleLoadClick} className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded transition-colors" title="Load Pattern">
                <UploadIcon className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </div>
      </div>
      
      {/* Bottom Row: Precise Tempo Slider */}
      <div className="flex items-center gap-3 bg-gray-900/40 rounded px-3 py-2 border border-gray-700/50">
         <span className="text-xs font-bold text-gray-500 uppercase w-10">Tempo</span>
         <input
            type="range"
            min="40"
            max="240"
            step="1"
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
         />
         <div className="flex items-end gap-1 min-w-[4.5rem] justify-end">
             <span className="text-3xl font-mono text-cyan-300 font-bold leading-none">{tempo}</span>
             <span className="text-xs font-bold text-gray-500 mb-1">BPM</span>
         </div>
      </div>

    </div>
  );
};