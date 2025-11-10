import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_SAMPLES, INITIAL_SOUNDS, NUM_STEPS, NUM_TRACKS, NUM_NOTES } from '../constants';
import { DrumGrid, PianoRollGrid, AudioBuffers, DrumSound, Pattern, DrumPattern, BassPattern } from '../types';

const createDrumGrid = (rows: number, cols: number): DrumGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(false));

const createPianoRollGrid = (rows: number, cols: number): PianoRollGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(0));


const getFrequency = (noteIndex: number, octave: number): number => {
  // This assumes MIDI note 69 (A4) is 440 Hz.
  // The noteIndex is from our piano roll, where 0=B, 1=A#... 11=C.
  // We need to map this to a standard MIDI note number. C is usually 0.
  // MIDI for C in an octave is `octave * 12`.
  // Our C is index 11.
  // So, a note's MIDI value is (octave + 1) * 12 + (11 - noteIndex).
  // E.g., C at octave 3 is (3*12) + (11-11) = 36.
  // B at octave 3 is (3*12) + (11-0) = 47.
  const midiNote = (octave + 1) * 12 + (11 - noteIndex);
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

export const useSequencer = () => {
  // --- Drum State ---
  const [grid, setGrid] = useState<DrumGrid>(createDrumGrid(NUM_TRACKS, NUM_STEPS));
  const [selectedSounds, setSelectedSounds] = useState<DrumSound[]>(INITIAL_SOUNDS);
  const [trackVolumes, setTrackVolumes] = useState<number[]>(Array(NUM_TRACKS).fill(0.75));
  const [soloedTracks, setSoloedTracks] = useState<boolean[]>(Array(NUM_TRACKS).fill(false));
  
  // --- Synth State ---
  const [pianoRollGrid, setPianoRollGrid] = useState<PianoRollGrid>(createPianoRollGrid(NUM_NOTES, NUM_STEPS));
  const [octave, setOctave] = useState<number>(3);
  const [synthVolume, setSynthVolume] = useState<number>(0.5);
  const [noteDuration, setNoteDuration] = useState<number>(4); // in steps, default to 1 beat

  // --- Global State ---
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // --- Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<AudioBuffers>({});
  const playbackIntervalRef = useRef<number | null>(null);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const loadSamples = async () => {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleIds = Object.keys(ALL_SAMPLES);
      const loadPromises = sampleIds.map(async (soundId) => {
        try {
          const response = await fetch(ALL_SAMPLES[soundId]);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          audioBuffersRef.current[soundId] = audioBuffer;
        } catch (error) {
          console.error(`Failed to load sound: ${soundId}`, error);
        }
      });

      await Promise.all(loadPromises);
      setIsLoaded(true);
    };

    loadSamples();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSample = useCallback((sound: DrumSound, volume: number) => {
    if (!audioContextRef.current || !audioBuffersRef.current[sound]) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffersRef.current[sound]!;
    
    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    source.start();
  }, []);
  
  const playSynthNote = useCallback((noteIndex: number, noteOctave: number, noteVolume: number, durationInSeconds: number) => {
    if (!audioContextRef.current || durationInSeconds <= 0) return;
    const audioContext = audioContextRef.current;

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    const frequency = getFrequency(noteIndex, noteOctave);
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;
    // Simple AD envelope to prevent clicks
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(noteVolume, now + 0.02);
    // Ensure the ramp down doesn't happen before the ramp up
    const releaseTime = now + Math.max(0.03, durationInSeconds - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, releaseTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(releaseTime);
  }, []);


  const previewSample = useCallback((sound: DrumSound, volume: number) => {
    if (!audioContextRef.current || !audioBuffersRef.current[sound]) return;
     if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    if (previewSourceRef.current) {
      try { previewSourceRef.current.stop(); } catch (e) { /* Ignore */ }
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffersRef.current[sound]!;
    
    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    source.start();
    
    previewSourceRef.current = source;
    
    source.onended = () => {
      if (previewSourceRef.current === source) {
        previewSourceRef.current = null;
      }
    };
  }, []);
  
  const stopPreview = useCallback(() => {
    if (previewSourceRef.current) {
      try { previewSourceRef.current.stop(); } catch (e) { /* Ignore */ }
      previewSourceRef.current = null;
    }
  }, []);

  const schedulePlayback = useCallback(() => {
    setCurrentStep((prevStep) => {
      const nextStep = prevStep === null ? 0 : (prevStep + 1) % NUM_STEPS;
      
      const isAnyTrackSoloed = soloedTracks.some(isSolo => isSolo);

      selectedSounds.forEach((sound, rowIndex) => {
        const shouldPlay = !isAnyTrackSoloed || soloedTracks[rowIndex];
        if (grid[rowIndex][nextStep] && shouldPlay) {
          playSample(sound, trackVolumes[rowIndex]);
        }
      });
      
      const secondsPerStep = (60 / tempo) / 4;
      pianoRollGrid.forEach((row, noteRowIndex) => {
        const noteDurationInSteps = row[nextStep];
        if (noteDurationInSteps > 0) {
          const noteDurationInSeconds = noteDurationInSteps * secondsPerStep;
          playSynthNote(noteRowIndex, octave, synthVolume, noteDurationInSeconds);
        }
      });

      return nextStep;
    });
  }, [grid, playSample, selectedSounds, trackVolumes, soloedTracks, pianoRollGrid, octave, synthVolume, tempo, playSynthNote]);

  useEffect(() => {
    if (isPlaying) {
      if (playbackIntervalRef.current) {
        window.clearInterval(playbackIntervalRef.current);
      }
      const intervalTime = (60 / tempo) * 1000 / 4; 
      playbackIntervalRef.current = window.setInterval(schedulePlayback, intervalTime);
    } else {
      if (playbackIntervalRef.current) {
        window.clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setCurrentStep(null);
    }
    return () => {
      if (playbackIntervalRef.current) {
        window.clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, tempo, schedulePlayback]);

  const togglePad = useCallback((row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = !newGrid[row][col];
      return newGrid;
    });
  }, []);
  
  const togglePianoRollPad = useCallback((row: number, col: number) => {
    setPianoRollGrid((prevGrid) => {
        const newGrid = prevGrid.map(r => [...r]);
        
        let noteStartCol = -1;
        // Search backwards from the clicked column to find the start of the note
        for (let i = col; i >= 0; i--) {
            const duration = newGrid[row][i];
            if (duration > 0) {
                // Found a note start. Check if the clicked pad falls within its duration.
                if (i + duration > col) {
                    noteStartCol = i;
                }
                break; // Stop searching once we've checked the nearest preceding note start
            }
        }

        if (noteStartCol !== -1) {
            // Clicked on an existing note, so remove it
            newGrid[row][noteStartCol] = 0;
        } else {
            // Clicked on an empty space, so add a new note
            const newNoteEnd = col + noteDuration;
            for (let i = col; i < newNoteEnd && i < NUM_STEPS; i++) {
                if (newGrid[row][i] > 0) {
                    newGrid[row][i] = 0; // Clear any note starts in the way
                }
            }
            
            newGrid[row][col] = noteDuration;
        }
        
        return newGrid;
    });
}, [noteDuration]);


  const handlePlayPause = useCallback(() => {
    if (!isLoaded) return;
    if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  }, [isLoaded]);

  const handleTempoChange = useCallback((newTempo: number) => {
    setTempo(newTempo);
  }, []);

  const handleOctaveChange = useCallback((newOctave: number) => {
    setOctave(newOctave);
  }, []);
  
  const handleSynthVolumeChange = useCallback((newVolume: number) => {
    setSynthVolume(newVolume);
  }, []);

  const handleNoteDurationChange = useCallback((newDuration: number) => {
    setNoteDuration(newDuration);
  }, []);

  const clearGrid = useCallback(() => {
    setGrid(createDrumGrid(NUM_TRACKS, NUM_STEPS));
    setPianoRollGrid(createPianoRollGrid(NUM_NOTES, NUM_STEPS));
    setSoloedTracks(Array(NUM_TRACKS).fill(false));
  }, []);

  const handleSoundChange = useCallback((trackIndex: number, newSound: DrumSound) => {
    setSelectedSounds(prevSounds => {
        const newSounds = [...prevSounds];
        newSounds[trackIndex] = newSound;
        return newSounds;
    });
  }, []);

  const handleVolumeChange = useCallback((trackIndex: number, newVolume: number) => {
    setTrackVolumes(prevVolumes => {
        const newVolumes = [...prevVolumes];
        newVolumes[trackIndex] = newVolume;
        return newVolumes;
    });
  }, []);

  const handleSoloTrack = useCallback((trackIndex: number) => {
    setSoloedTracks(prev => {
        const newSoloed = [...prev];
        newSoloed[trackIndex] = !newSoloed[trackIndex];
        return newSoloed;
    });
  }, []);

  const savePattern = useCallback(() => {
    const pattern: Pattern = {
      grid,
      selectedSounds,
      trackVolumes,
      tempo,
      pianoRollGrid,
      octave,
      synthVolume,
    };
    const dataStr = JSON.stringify(pattern, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sequencer-pattern-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [grid, selectedSounds, trackVolumes, tempo, pianoRollGrid, octave, synthVolume]);

  const loadPattern = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File content is not a string.');
        const pattern: Pattern = JSON.parse(text);

        if (!pattern.grid || !pattern.selectedSounds || !pattern.trackVolumes || !pattern.tempo) {
          throw new Error('Invalid pattern file structure.');
        }

        setGrid(pattern.grid);
        setSelectedSounds(pattern.selectedSounds);
        setTrackVolumes(pattern.trackVolumes);
        setTempo(pattern.tempo);
        
        setPianoRollGrid(pattern.pianoRollGrid || createPianoRollGrid(NUM_NOTES, NUM_STEPS));
        setOctave(pattern.octave ?? 3);
        setSynthVolume(pattern.synthVolume ?? 0.5);

        setSoloedTracks(Array(NUM_TRACKS).fill(false));
      } catch (error) {
        console.error('Failed to load pattern:', error);
        alert('Error: Could not load the pattern file. It might be corrupted or in the wrong format.');
      }
    };
    reader.onerror = () => {
      console.error('File reading error');
      alert('Error: Could not read the selected file.');
    };
    reader.readAsText(file);
  }, []);
  
  const loadDrumPreset = useCallback((pattern: DrumPattern) => {
    setGrid(pattern.grid);
    setSelectedSounds(pattern.selectedSounds);
    setTrackVolumes(pattern.trackVolumes);
    setTempo(pattern.tempo);
    setSoloedTracks(Array(NUM_TRACKS).fill(false));
  }, []);

  const loadBassPreset = useCallback((pattern: BassPattern) => {
    setPianoRollGrid(pattern.pianoRollGrid);
    setOctave(pattern.octave);
    setSynthVolume(pattern.synthVolume);
  }, []);

  return {
    isLoaded,
    isPlaying,
    tempo,
    grid,
    currentStep,
    selectedSounds,
    trackVolumes,
    soloedTracks,
    pianoRollGrid,
    octave,
    synthVolume,
    noteDuration,
    togglePad,
    handlePlayPause,
    handleTempoChange,
    handleSoundChange,
    handleVolumeChange,
    handleSoloTrack,
    clearGrid,
    savePattern,
    loadPattern,
    loadDrumPreset,
    loadBassPreset,
    previewSample,
    stopPreview,
    togglePianoRollPad,
    handleOctaveChange,
    handleSynthVolumeChange,
    handleNoteDurationChange,
  };
};