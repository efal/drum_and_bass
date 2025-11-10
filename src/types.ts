export type DrumSound = string;
export type DrumGrid = boolean[][];
export type PianoRollGrid = number[][];
export type AudioBuffers = { [key: string]: AudioBuffer };

// Represents a drum pattern for presets
export interface DrumPattern {
  grid: DrumGrid;
  selectedSounds: DrumSound[];
  trackVolumes: number[];
  tempo?: number;
}

// Represents a bassline pattern for presets
export interface BassPattern {
  pianoRollGrid: PianoRollGrid;
  octave: number;
  synthVolume: number;
  synthPan?: number;
  synthType?: OscillatorType;
  tempo?: number; // Optional tempo for presets
  filterType?: BiquadFilterType;
  filterCutoff?: number;
  filterResonance?: number;
  delayTime?: number;
  delayFeedback?: number;
  delayMix?: number;
  reverbMix?: number;
}

// Represents a full pattern for saving/loading
export interface Pattern {
  drumGrid: DrumGrid;
  selectedSounds: DrumSound[];
  trackVolumes: number[];
  trackPans: number[];
  pianoRollGrid: PianoRollGrid;
  octave: number;
  synthVolume: number;
  synthPan: number;
  synthType: OscillatorType;
  tempo: number;
  filterType: BiquadFilterType;
  filterCutoff: number;
  filterResonance: number;
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
  reverbMix: number;
}

export interface DrumPreset {
  name: string;
  pattern: DrumPattern;
}

export interface BassPreset {
  name: string;
  pattern: BassPattern;
}
