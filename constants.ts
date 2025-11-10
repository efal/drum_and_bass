export const NUM_STEPS: number = 16;
export const NUM_NOTES: number = 12; // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
export const NUM_TRACKS: number = 4;

export const INITIAL_SOUNDS = ['kick', 'snare', 'hihat', 'clap'];

export const SOUND_LIBRARY: { [key: string]: { id: string; name: string; url: string }[] } = {
  'JS30': [
      { id: 'kick', name: 'Kick', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav' },
      { id: 'snare', name: 'Snare', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav' },
      { id: 'hihat', name: 'Hi-Hat', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav' },
      { id: 'clap', name: 'Clap', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/clap.wav' },
      { id: 'boom', name: 'Boom', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/boom.wav' },
      { id: 'ride', name: 'Ride', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/ride.wav' },
      { id: 'tink', name: 'Tink', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tink.wav' },
      { id: 'tom', name: 'Tom', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/tom.wav' },
      { id: 'openhat', name: 'Open Hat', url: 'https://raw.githubusercontent.com/wesbos/JavaScript30/master/01%20-%20JavaScript%20Drum%20Kit/sounds/openhat.wav' },
  ]
};