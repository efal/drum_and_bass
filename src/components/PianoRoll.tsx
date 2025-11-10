
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
  synthPan: number;
  onPanChange: (newPan: number) => void;
  synthType: OscillatorType;
  onSynthTypeChange: (newType: OscillatorType) => void;
  noteDuration: number;
  onNoteDurationChange: (newDuration: number) => void;
  filterType: BiquadFilterType;
  onFilterTypeChange: (newType: BiquadFilterType) => void;
  filterCutoff: number;
  onFilterCutoffChange: (newCutoff: number) => void;
  filterResonance: number;
  onFilterResonanceChange: (newResonance: number) => void;
  delayTime: number;
  onDelayTimeChange: (newTime: number) => void;
  delayFeedback: number;
  onDelayFeedbackChange: (newFeedback: number) => void;
  delayMix: number;
  onDelayMixChange: (newMix: number) => void;
  reverbMix: number;
  onReverbMixChange: (newMix: number) => void;
}

const NOTE_NAMES = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
const IS_BLACK_KEY = [false, true, false, true, false, true, false, false, true, false, true, false];

const SYNTH_TYPES: { value: OscillatorType, label: string }[] = [
    { value: 'sawtooth', label: 'Sawtooth' },
    { value: 'sine', label: 'Sine' },
    { value: 'square', label: 'Square' },
    { value: 'triangle', label: 'Triangle' },
];

const FILTER_TYPES: { value: BiquadFilterType, label: string }[] = [
    { value: 'lowpass', label: 'Lowpass' },
    { value: 'highpass', label: 'Highpass' },
    { value: 'bandpass', label: 'Bandpass' },
];

const DURATION_OPTIONS = [
  { label: '1/2', value: 2, title: 'Half Beat (2 steps)' },
  { label: '1', value: 4, title: 'One Beat (4 steps)' },
  { label: '2', value: 8, title: 'Two Beats (8 steps)' },
];

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

interface EffectControlProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    accentColor?: string;
}

const EffectControl: React.FC<EffectControlProps> = ({ label, value, onChange, min, max, step, accentColor = 'accent-pink-500' }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 font-medium">{label}</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${accentColor}`}
        />
    </div>
);


export const PianoRoll: React.FC<PianoRollProps> = ({
  grid, currentStep, isPlaying, onPadClick,
  synthVolume, onVolumeChange, synthPan, onPanChange, synthType, onSynthTypeChange,
  noteDuration, onNoteDurationChange,
  filterType, onFilterTypeChange, filterCutoff, onFilterCutoffChange,
  filterResonance, onFilterResonanceChange,
  delayTime, onDelayTimeChange, delayFeedback, onDelayFeedbackChange, delayMix, onDelayMixChange,
  reverbMix, onReverbMixChange,
}) => {
  return (
    <div className="grid gap-2 grid-cols-1 xl:grid-cols-[minmax(80px,auto)_1fr] mt-8 pt-4 border-t border-gray-700">
      
      {/* --- Controls Column --- */}
      <div className="xl:col-start-1 xl:col-end-2 xl:row-start-1 xl:row-end-3 p-4 bg-gray-900/40 rounded-lg">
        <h2 className="text-lg font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-400 mb-4">Bass Synth</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-1 gap-4">
            
            {/* --- Main Synth Controls --- */}
            <div className="flex flex-col gap-3 p-3 bg-gray-800/50 rounded-md">
                <EffectControl label="Volume" value={synthVolume} onChange={onVolumeChange} min={0} max={1} step={0.01} />
                <EffectControl label="Pan" value={synthPan} onChange={onPanChange} min={-1} max={1} step={0.1} accentColor="accent-violet-500" />
                <div>
                    <label className="text-xs text-gray-400 font-medium">Waveform</label>
                    <select value={synthType} onChange={(e) => onSynthTypeChange(e.target.value as OscillatorType)}
                        className="w-full text-xs bg-gray-700 text-white rounded p-1 border border-gray-600 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                    >
                        {SYNTH_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-gray-400 font-medium">Note Duration</label>
                    <div className="grid grid-cols-3 gap-1 bg-gray-900 p-1 rounded-md">
                        {DURATION_OPTIONS.map(({ label, value, title }) => (
                            <button key={value} onClick={() => onNoteDurationChange(value)} title={title}
                                className={`px-1 py-0.5 text-xs font-semibold rounded transition-colors ${ noteDuration === value ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}
                            >{label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Filter Controls --- */}
            <div className="flex flex-col gap-3 p-3 bg-gray-800/50 rounded-md">
                 <h3 className="text-sm font-semibold text-gray-300 text-center">Filter</h3>
                 <div>
                    <label className="text-xs text-gray-400 font-medium">Type</label>
                    <select value={filterType} onChange={(e) => onFilterTypeChange(e.target.value as BiquadFilterType)}
                        className="w-full text-xs bg-gray-700 text-white rounded p-1 border border-gray-600 focus:ring-1 focus:ring-pink-500 focus:outline-none"
                    >
                        {FILTER_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                    </select>
                </div>
                <EffectControl label="Cutoff" value={filterCutoff} onChange={onFilterCutoffChange} min={20} max={20000} step={1} />
                <EffectControl label="Resonance" value={filterResonance} onChange={onFilterResonanceChange} min={0} max={20} step={0.1} />
            </div>

            {/* --- Delay Controls --- */}
            <div className="flex flex-col gap-3 p-3 bg-gray-800/50 rounded-md">
                 <h3 className="text-sm font-semibold text-gray-300 text-center">Delay</h3>
                <EffectControl label="Mix" value={delayMix} onChange={onDelayMixChange} min={0} max={1} step={0.01} />
                <EffectControl label="Time" value={delayTime} onChange={onDelayTimeChange} min={0} max={1} step={0.01} />
                <EffectControl label="Feedback" value={delayFeedback} onChange={onDelayFeedbackChange} min={0} max={0.95} step={0.01} />
            </div>

             {/* --- Reverb Controls --- */}
            <div className="flex flex-col gap-3 p-3 bg-gray-800/50 rounded-md">
                 <h3 className="text-sm font-semibold text-gray-300 text-center">Reverb</h3>
                <EffectControl label="Mix" value={reverbMix} onChange={onReverbMixChange} min={0} max={1} step={0.01} />
            </div>
        </div>
      </div>

      {/* --- Grid Column --- */}
      <div className="xl:col-start-2 xl:col-end-3 xl:row-start-1 xl:row-end-3 grid gap-1 sm:gap-2 items-center"
        style={{ gridTemplateColumns: `minmax(30px, auto) repeat(${NUM_STEPS}, minmax(0, 1fr))` }}
      >
        <div />{/* Empty space above pads to align with drum step numbers */}
        <div style={{ gridColumn: `span ${NUM_STEPS}` }} />

        {/* Grid Body: Note rows */}
        {Array.from({ length: NUM_NOTES }).map((_, noteIndex) => {
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
    </div>
  );
};
