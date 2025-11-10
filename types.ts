export type DrumSound = string;

export type DrumGrid = boolean[][];
export type PianoRollGrid = number[][];

export type AudioBuffers = {
  [key in DrumSound]?: AudioBuffer;
};

// Represents a full pattern for saving/loading
export interface Pattern {
  // Drum machine part
  grid: DrumGrid;
  selectedSounds: DrumSound[];
  trackVolumes: number[];
  tempo: number;

  // Synth part
  pianoRollGrid: PianoRollGrid;
  octave: number;
  synthVolume: number;
}


// --- New Preset Types for separate Drum/Bass loading ---

export interface DrumPattern {
  grid: DrumGrid;
  selectedSounds: DrumSound[];
  trackVolumes: number[];
  tempo: number;
}

export interface BassPattern {
  pianoRollGrid: PianoRollGrid;
  octave: number;
  synthVolume: number;
}

export interface DrumPreset {
  name: string;
  pattern: DrumPattern;
}

export interface BassPreset {
  name: string;
  pattern: BassPattern;
}