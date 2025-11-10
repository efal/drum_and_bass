export const NUM_STEPS: number = 16;
export const NUM_NOTES: number = 12; // C, C#, D, D#, E, F, F#, G, G#, A, A#, B

export const INITIAL_SOUNDS: string[] = ['kick', 'snare', 'hihat', 'clap'];
export const NUM_TRACKS: number = INITIAL_SOUNDS.length;

export const SOUND_LIBRARY: { [category: string]: { name: string; id: string }[] } = {
  Kicks: [
    { name: 'Kick', id: 'kick' },
    { name: 'Boom', id: 'boom' },
  ],
  Snares: [
    { name: 'Snare', id: 'snare' },
    { name: 'Tink', id: 'tink' },
  ],
  'Hi-Hats': [
    { name: 'Hi-Hat', id: 'hihat' },
    { name: 'Open Hat', id: 'openhat' },
  ],
  Percussion: [
    { name: 'Clap', id: 'clap' },
    { name: 'Tom', id: 'tom' },
    { name: 'Ride', id: 'ride' },
  ],
};

// A flattened map of all available samples for easy loading
export const ALL_SAMPLES: Record<string, string> = {
  kick: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav',
  snare: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav',
  hihat: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav',
  clap: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav',
  boom: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/boom.wav',
  ride: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/ride.wav',
  tink: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav',
  tom: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tom.wav',
  openhat: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav',
};