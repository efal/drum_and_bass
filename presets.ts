import { DrumPreset, BassPreset, DrumGrid, PianoRollGrid } from './types';
import { NUM_TRACKS, NUM_STEPS, NUM_NOTES } from './constants';

const createEmptyDrumGrid = (rows: number, cols: number): DrumGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(false));

const createEmptyPianoRollGrid = (rows: number, cols: number): PianoRollGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(0));

const createDrumGridFromPatterns = (patterns: (number[] | null)[]): DrumGrid => {
    const grid = createEmptyDrumGrid(NUM_TRACKS, NUM_STEPS);
    patterns.forEach((pattern, trackIndex) => {
        if (pattern && grid[trackIndex]) {
            pattern.forEach(step => {
                if (step >= 0 && step < NUM_STEPS) {
                    grid[trackIndex][step] = true;
                }
            });
        }
    });
    return grid;
};

// Notes are from high (B) to low (C). Index 0 = B, 1 = A#, ..., 11 = C
const createPianoGridWithDurations = (noteSteps: { noteRow: number, steps: { step: number; duration: number }[] }[]): PianoRollGrid => {
    const grid = createEmptyPianoRollGrid(NUM_NOTES, NUM_STEPS);
    noteSteps.forEach(({ noteRow, steps }) => {
        if (grid[noteRow]) {
            steps.forEach(({ step, duration }) => {
                grid[noteRow][step] = duration;
            });
        }
    });
    return grid;
};


// --- DRUM PRESETS ---

export const DRUM_PRESETS: DrumPreset[] = [
  {
    name: 'Four on the Floor',
    pattern: {
      grid: createDrumGridFromPatterns([
        [0, 4, 8, 12],       // Kick
        [4, 12],             // Snare
        [2, 6, 10, 14],      // Hi-Hat
        [4, 12],             // Clap
      ]),
      selectedSounds: ['kick', 'snare', 'hihat', 'clap'],
      trackVolumes: [0.9, 0.8, 0.6, 0.8],
      tempo: 125,
    },
  },
  {
    name: 'Basic Rock',
    pattern: {
      grid: createDrumGridFromPatterns([
        [0, 8],                        // Kick (on 1 and 3)
        [4, 12],                       // Snare (on 2 and 4)
        [0, 2, 4, 6, 8, 10, 12],       // Hi-Hat (8th notes, leaving last for open hat)
        [14],                          // Open Hat (on the last 8th note)
      ]),
      selectedSounds: ['kick', 'snare', 'hihat', 'openhat'],
      trackVolumes: [1.0, 0.85, 0.7, 0.75],
      tempo: 110,
    },
  },
  {
    name: 'Billie Jean',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 8],
            [4, 12],
            [0, 2, 4, 6, 8, 10, 12, 14],
            null,
        ]),
        selectedSounds: ['kick', 'snare', 'hihat', 'clap'],
        trackVolumes: [0.9, 0.8, 0.5, 0.8],
        tempo: 117,
    }
  },
  {
    name: 'Classic Funk',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 2, 6, 8, 11],
            [4, 10, 12],
            [0, 1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14],
            [7, 15],
        ]),
        selectedSounds: ['kick', 'snare', 'hihat', 'openhat'],
        trackVolumes: [0.8, 0.7, 0.6, 0.75],
        tempo: 98,
    }
  },
    {
    name: 'Trap Beat',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 7, 10],
            [4, 12],
            [0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13, 14],
            [15],
        ]),
        selectedSounds: ['kick', 'tink', 'hihat', 'openhat'],
        trackVolumes: [1.0, 0.7, 0.5, 0.8],
        tempo: 140,
    }
  },
  {
    name: 'Chill Lo-fi',
    pattern: {
      grid: createDrumGridFromPatterns([
        [0, 8],
        [4, 12],
        [0, 2, 4, 6, 8, 10, 12, 14],
        null
      ]),
      selectedSounds: ['kick', 'snare', 'hihat', 'tom'],
      trackVolumes: [0.7, 0.6, 0.4, 0.5],
      tempo: 85,
    }
  },
  {
    name: 'Breakbeat',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 6, 10],
            [4, 12],
            [0, 2, 4, 6, 8, 10, 12, 14],
            null
        ]),
        selectedSounds: ['boom', 'snare', 'hihat', 'ride'],
        trackVolumes: [1.0, 0.9, 0.6, 0.7],
        tempo: 130,
    }
  },
  {
    name: 'Two-Step',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 7, 12],
            [4, 12],
            [2, 6, 10, 14],
            null
        ]),
        selectedSounds: ['kick', 'snare', 'openhat', 'clap'],
        trackVolumes: [0.9, 0.8, 0.7, 0.8],
        tempo: 135,
    }
  },
  {
    name: 'Reggaeton',
    pattern: {
        grid: createDrumGridFromPatterns([
            [0, 4, 8, 12],
            [3, 7, 11, 15],
            null,
            null
        ]),
        selectedSounds: ['kick', 'snare', 'hihat', 'tom'],
        trackVolumes: [1.0, 0.7, 0.6, 0.8],
        tempo: 95,
    }
  }
];


// --- BASS PRESETS ---

export const BASS_PRESETS: BassPreset[] = [
  {
    name: 'Simple Arp',
    pattern: {
      pianoRollGrid: createPianoGridWithDurations([
        { noteRow: 11, steps: [{ step: 0, duration: 4 }] }, // C
        { noteRow: 9, steps: [{ step: 4, duration: 4 }] },  // D
        { noteRow: 7, steps: [{ step: 8, duration: 4 }] },  // E
        { noteRow: 6, steps: [{ step: 12, duration: 4 }] }, // F
      ]),
      octave: 3,
      synthVolume: 0.5,
      synthType: 'triangle',
      reverbMix: 0.2,
      delayMix: 0.3,
      delayTime: 0.375,
      delayFeedback: 0.4,
    }
  },
  {
    name: 'Another One Bites',
    pattern: {
      // E E E E | A G | E
      pianoRollGrid: createPianoGridWithDurations([
        { noteRow: 7, steps: [ // E
            { step: 0, duration: 2 }, { step: 2, duration: 1 }, { step: 3, duration: 1 }, 
            { step: 4, duration: 2 }, { step: 12, duration: 4 }
        ]},
        { noteRow: 2, steps: [{ step: 8, duration: 2 }] }, // A
        { noteRow: 4, steps: [{ step: 10, duration: 2 }] }, // G
      ]),
      octave: 1,
      synthVolume: 0.7,
      synthType: 'sawtooth',
      filterCutoff: 1200,
      filterResonance: 2,
      tempo: 110,
    }
  },
  {
    name: 'Seven Nation Army',
    pattern: {
      // E E G E D C B
      pianoRollGrid: createPianoGridWithDurations([
          { noteRow: 7, steps: [{ step: 0, duration: 3 }, { step: 4, duration: 2 }, { step: 8, duration: 2 }] },   // E
          { noteRow: 4, steps: [{ step: 6, duration: 2 }] },   // G
          { noteRow: 9, steps: [{ step: 10, duration: 2 }] },  // D
          { noteRow: 11, steps: [{ step: 12, duration: 2 }] }, // C
          { noteRow: 0, steps: [{ step: 14, duration: 2 }] },  // B (octave up)
      ]),
      octave: 1,
      synthVolume: 0.8,
      synthType: 'sawtooth',
      filterCutoff: 900,
      filterResonance: 5,
      tempo: 124,
    }
  },
  {
    name: 'Chameleon Funk',
    pattern: {
      // Bb Eb ...
      pianoRollGrid: createPianoGridWithDurations([
          { noteRow: 1, steps: [{ step: 0, duration: 7 }, { step: 11, duration: 1 }] },   // Bb
          { noteRow: 8, steps: [{ step: 7, duration: 4 }] },   // Eb
      ]),
      octave: 1,
      synthVolume: 0.65,
      synthType: 'sine',
      tempo: 104,
    }
  },
  {
    name: 'Blues Shuffle',
    pattern: {
        pianoRollGrid: createPianoGridWithDurations([
            { noteRow: 11, steps: [{ step: 0, duration: 4 }] }, // C
            { noteRow: 7, steps: [{ step: 4, duration: 4 }] },  // E
            { noteRow: 4, steps: [{ step: 8, duration: 4 }] },  // G
            { noteRow: 3, steps: [{ step: 12, duration: 1 }] }, // G# -> A
            { noteRow: 2, steps: [{ step: 13, duration: 3 }] }, // A
        ]),
        octave: 2,
        synthVolume: 0.7,
        synthType: 'square',
        tempo: 130,
    }
  },
    {
    name: 'Trance Gate',
    pattern: {
        pianoRollGrid: createPianoGridWithDurations([
            { noteRow: 11, steps: [{ step: 0, duration: 2 }, { step: 8, duration: 2 }]}, // C
            { noteRow: 4, steps: [{ step: 2, duration: 2 }, { step: 10, duration: 2 }]}, // G
            { noteRow: 6, steps: [{ step: 4, duration: 2 }, { step: 12, duration: 2 }]}, // F
            { noteRow: 2, steps: [{ step: 6, duration: 2 }, { step: 14, duration: 2 }]}, // A
        ]),
        octave: 2,
        synthVolume: 0.5,
        synthType: 'sawtooth',
        filterCutoff: 2500,
        filterResonance: 3,
        delayMix: 0.5,
        delayTime: 0.215,
        delayFeedback: 0.5,
        reverbMix: 0.15,
        tempo: 138,
    }
  },
  {
    name: 'Billie Jean',
    pattern: {
      // F# C# E C# | E F# E C#
      pianoRollGrid: createPianoGridWithDurations([
          { noteRow: 5, steps: [{ step: 0, duration: 2 }, { step: 10, duration: 2 }] },   // F#
          { noteRow: 10, steps: [{ step: 2, duration: 2 }, { step: 6, duration: 2 }, { step: 14, duration: 2 }] }, // C#
          { noteRow: 7, steps: [{ step: 4, duration: 2 }, { step: 8, duration: 2 }, { step: 12, duration: 2 }] },   // E
      ]),
      octave: 2,
      synthVolume: 0.65,
      synthType: 'sine',
      tempo: 117,
    }
  },
  {
    name: 'Funk Groove',
    pattern: {
        // G, D, F, G
        pianoRollGrid: createPianoGridWithDurations([
            { noteRow: 4, steps: [{ step: 0, duration: 6 }, { step: 12, duration: 4 }] }, // G
            { noteRow: 9, steps: [{ step: 6, duration: 2 }] },    // D
            { noteRow: 6, steps: [{ step: 8, duration: 4 }] },    // F
        ]),
        octave: 2,
        synthVolume: 0.6,
        synthType: 'sawtooth',
        filterCutoff: 1500,
        tempo: 98,
    }
  },
  {
    name: 'House Pulse',
    pattern: {
      // Pulsing 8th note bassline C
      pianoRollGrid: createPianoGridWithDurations([
        { noteRow: 11, steps: [
          { step: 0, duration: 2 }, { step: 2, duration: 2 }, { step: 4, duration: 2 }, { step: 6, duration: 2 },
          { step: 8, duration: 2 }, { step: 10, duration: 2 }, { step: 12, duration: 2 }, { step: 14, duration: 2 },
        ]}, // C
      ]),
      octave: 2,
      synthVolume: 0.6,
      synthType: 'sawtooth',
      filterType: 'lowpass',
      filterCutoff: 800,
      filterResonance: 4,
    }
  },
  {
    name: 'Acid Squelch',
    pattern: {
        pianoRollGrid: createPianoGridWithDurations([
            { noteRow: 11, steps: [{ step: 0, duration: 2}, { step: 4, duration: 2}, { step: 10, duration: 2}] }, // C
            { noteRow: 8, steps: [{ step: 6, duration: 2}, { step: 14, duration: 2}] }, // D#
            { noteRow: 6, steps: [{ step: 2, duration: 2}, { step: 8, duration: 2}, { step: 12, duration: 2}] }, // F
        ]),
        octave: 3,
        synthVolume: 0.6,
        synthPan: 0.2,
        synthType: 'square',
        filterType: 'lowpass',
        filterCutoff: 1200,
        filterResonance: 12,
        delayMix: 0.4,
        delayTime: 0.17,
        delayFeedback: 0.2,
        tempo: 130,
    }
  },
  {
    name: 'Sub Drone',
    pattern: {
        pianoRollGrid: createPianoGridWithDurations([
            { noteRow: 11, steps: [{ step: 0, duration: 16 }] }, // C
        ]),
        octave: 1,
        synthVolume: 0.8,
        synthType: 'sine',
        filterType: 'lowpass',
        filterCutoff: 400,
    }
  },
];