
import { useState, useEffect, useRef, useCallback } from 'react';
import { NUM_STEPS, NUM_NOTES, NUM_TRACKS, INITIAL_SOUNDS, SOUND_LIBRARY } from '../constants';
import { PianoRollGrid, Pattern, BassPattern, DrumGrid, DrumSound, AudioBuffers, DrumPattern } from '../types';

const createDrumGrid = (rows: number, cols: number): DrumGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(false));

const createPianoRollGrid = (rows: number, cols: number): PianoRollGrid =>
  Array.from({ length: rows }, () => Array(cols).fill(0));

const getFrequency = (noteIndex: number, octave: number): number => {
  const midiNote = (octave + 1) * 12 + (11 - noteIndex);
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

// Helper to generate a simple reverb impulse response
const createReverbImpulseResponse = async (audioContext: AudioContext): Promise<AudioBuffer> => {
    const sampleRate = audioContext.sampleRate;
    const duration = 2; // seconds
    const decay = 3;
    const impulse = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < impulse.length; i++) {
        const n = impulse.length - i;
        left[i] = (Math.random() * 2 - 1) * Math.pow(n / impulse.length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(n / impulse.length, decay);
    }
    return impulse;
};


export const useSequencer = () => {
  // --- App State ---
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  // --- Drum State ---
  const [drumGrid, setDrumGrid] = useState<DrumGrid>(createDrumGrid(NUM_TRACKS, NUM_STEPS));
  const [selectedSounds, setSelectedSounds] = useState<DrumSound[]>(INITIAL_SOUNDS);
  const [trackVolumes, setTrackVolumes] = useState<number[]>(Array(NUM_TRACKS).fill(0.8));
  const [trackPans, setTrackPans] = useState<number[]>(Array(NUM_TRACKS).fill(0));
  const [soloedTracks, setSoloedTracks] = useState<boolean[]>(Array(NUM_TRACKS).fill(false));
  
  // --- Synth State ---
  const [pianoRollGrid, setPianoRollGrid] = useState<PianoRollGrid>(createPianoRollGrid(NUM_NOTES, NUM_STEPS));
  const [octave, setOctave] = useState<number>(3);
  const [synthVolume, setSynthVolume] = useState<number>(0.5);
  const [synthPan, setSynthPan] = useState<number>(0);
  const [synthType, setSynthType] = useState<OscillatorType>('sawtooth');
  const [noteDuration, setNoteDuration] = useState<number>(4);
  
  // --- Effects State ---
  const [filterType, setFilterType] = useState<BiquadFilterType>('lowpass');
  const [filterCutoff, setFilterCutoff] = useState<number>(8000);
  const [filterResonance, setFilterResonance] = useState<number>(1);
  const [delayTime, setDelayTime] = useState<number>(0.0);
  const [delayFeedback, setDelayFeedback] = useState<number>(0.0);
  const [delayMix, setDelayMix] = useState<number>(0.0);
  const [reverbMix, setReverbMix] = useState<number>(0.0);

  // --- Global State ---
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  // --- Refs ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<AudioBuffers>({});
  const playbackIntervalRef = useRef<number | null>(null);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // --- Audio Node Refs ---
  const drumTrackChannelsRef = useRef<{gain: GainNode, panner: StereoPannerNode}[]>([]);
  const effectsInputRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const delaySendRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbSendRef = useRef<GainNode | null>(null);
  const synthMasterGainRef = useRef<GainNode | null>(null);
  const synthPannerNodeRef = useRef<StereoPannerNode | null>(null);


  // Helper to ensure values are finite numbers before being used by the Web Audio API
  const safeNumber = (val: unknown, fallback: number): number => {
    return (typeof val === 'number' && isFinite(val)) ? val : fallback;
  };

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    // --- Create and connect nodes only once ---
    if (!effectsInputRef.current) {
        const audioContext = audioContextRef.current;
        
        // --- Create Synth Effects Chain ---
        effectsInputRef.current = audioContext.createGain();
        filterNodeRef.current = audioContext.createBiquadFilter();
        delayNodeRef.current = audioContext.createDelay(1.0);
        delayFeedbackRef.current = audioContext.createGain();
        delaySendRef.current = audioContext.createGain();
        reverbNodeRef.current = audioContext.createConvolver();
        reverbSendRef.current = audioContext.createGain();
        synthMasterGainRef.current = audioContext.createGain();
        synthPannerNodeRef.current = audioContext.createStereoPanner();
        
        // Set initial values from state to prevent clicks or unwanted sounds
        filterNodeRef.current.type = filterType;
        filterNodeRef.current.frequency.value = filterCutoff;
        filterNodeRef.current.Q.value = filterResonance;
        delayNodeRef.current.delayTime.value = delayTime;
        delayFeedbackRef.current.gain.value = delayFeedback;
        delaySendRef.current.gain.value = delayMix;
        reverbSendRef.current.gain.value = reverbMix;
        synthMasterGainRef.current.gain.value = synthVolume;
        synthPannerNodeRef.current.pan.value = synthPan;

        reverbNodeRef.current.buffer = await createReverbImpulseResponse(audioContext);

        // --- Connect Synth Effects Chain ---
        effectsInputRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(synthMasterGainRef.current);
        filterNodeRef.current.connect(delaySendRef.current);
        delaySendRef.current.connect(delayNodeRef.current);
        delayNodeRef.current.connect(delayFeedbackRef.current).connect(delayNodeRef.current);
        delayNodeRef.current.connect(synthMasterGainRef.current);
        filterNodeRef.current.connect(reverbSendRef.current);
        reverbSendRef.current.connect(reverbNodeRef.current);
        reverbNodeRef.current.connect(synthMasterGainRef.current);
        synthMasterGainRef.current.connect(synthPannerNodeRef.current);
        synthPannerNodeRef.current.connect(audioContext.destination);

        // --- Create Drum Track Channels ---
        drumTrackChannelsRef.current = [];
        for (let i = 0; i < NUM_TRACKS; i++) {
            const gain = audioContext.createGain();
            gain.gain.value = trackVolumes[i];
            const panner = audioContext.createStereoPanner();
            panner.pan.value = trackPans[i];
            gain.connect(panner).connect(audioContext.destination);
            drumTrackChannelsRef.current[i] = { gain, panner };
        }
    }
  }, [filterType, filterCutoff, filterResonance, delayTime, delayFeedback, delayMix, reverbMix, synthVolume, synthPan, trackVolumes, trackPans]);

  const loadSamples = useCallback(async () => {
    await initAudio();
    const allSounds = Object.values(SOUND_LIBRARY).flat();
    const promises = allSounds.map(async (sound, index) => {
        try {
            setLoadingMessage(`Loading samples... (${index + 1}/${allSounds.length})`);
            const response = await fetch(sound.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for sound URL ${sound.url}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            buffersRef.current[sound.id] = audioBuffer;
        } catch (error) {
            console.error(`Failed to load and decode sound '${sound.id}':`, error);
        }
    });
    await Promise.all(promises);
  }, [initAudio]);

  useEffect(() => {
    // This effect is only for cleanup on unmount.
    return () => { audioContextRef.current?.close(); };
  }, []);

  const initialize = useCallback(async () => {
    if (isReady || isLoading) return;

    setIsLoading(true);
    setLoadingMessage('Initializing audio...');
    try {
      await loadSamples();
      setLoadingMessage('Ready!');
      setIsReady(true);
    } catch (error) {
      console.error("Failed to initialize:", error);
      setLoadingMessage("Error: Could not initialize audio. Please refresh and try again.");
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [loadSamples, isReady, isLoading]);


  // Effect parameter updates
  useEffect(() => { if (filterNodeRef.current) filterNodeRef.current.type = filterType; }, [filterType]);
  useEffect(() => { if (filterNodeRef.current && audioContextRef.current) filterNodeRef.current.frequency.setTargetAtTime(filterCutoff, audioContextRef.current.currentTime, 0.01); }, [filterCutoff]);
  useEffect(() => { if (filterNodeRef.current && audioContextRef.current) filterNodeRef.current.Q.setTargetAtTime(filterResonance, audioContextRef.current.currentTime, 0.01); }, [filterResonance]);
  useEffect(() => { if (delayNodeRef.current && audioContextRef.current) delayNodeRef.current.delayTime.setTargetAtTime(delayTime, audioContextRef.current.currentTime, 0.01); }, [delayTime]);
  useEffect(() => { if (delayFeedbackRef.current && audioContextRef.current) delayFeedbackRef.current.gain.setTargetAtTime(delayFeedback, audioContextRef.current.currentTime, 0.01); }, [delayFeedback]);
  useEffect(() => { if (delaySendRef.current && audioContextRef.current) delaySendRef.current.gain.setTargetAtTime(delayMix, audioContextRef.current.currentTime, 0.01); }, [delayMix]);
  useEffect(() => { if (reverbSendRef.current && audioContextRef.current) reverbSendRef.current.gain.setTargetAtTime(reverbMix, audioContextRef.current.currentTime, 0.01); }, [reverbMix]);
  useEffect(() => { if (synthMasterGainRef.current && audioContextRef.current) synthMasterGainRef.current.gain.setTargetAtTime(synthVolume, audioContextRef.current.currentTime, 0.01); }, [synthVolume]);
  useEffect(() => { if (synthPannerNodeRef.current && audioContextRef.current) synthPannerNodeRef.current.pan.setTargetAtTime(synthPan, audioContextRef.current.currentTime, 0.01); }, [synthPan]);
  
  useEffect(() => {
    trackVolumes.forEach((volume, i) => {
        if(drumTrackChannelsRef.current[i] && audioContextRef.current) {
            drumTrackChannelsRef.current[i].gain.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.01);
        }
    });
  }, [trackVolumes]);

  useEffect(() => {
    trackPans.forEach((pan, i) => {
        if(drumTrackChannelsRef.current[i] && audioContextRef.current) {
            drumTrackChannelsRef.current[i].panner.pan.setTargetAtTime(pan, audioContextRef.current.currentTime, 0.01);
        }
    });
  }, [trackPans]);

  const playSample = useCallback((soundId: string, trackIndex: number) => {
    const channel = drumTrackChannelsRef.current[trackIndex];
    if (!audioContextRef.current || !buffersRef.current[soundId] || !channel) return;
    const audioContext = audioContextRef.current;
    const source = audioContext.createBufferSource();
    source.buffer = buffersRef.current[soundId];
    source.connect(channel.gain);
    source.start();
  }, []);

  const playSynthNote = useCallback((noteIndex: number, noteOctave: number, durationInSeconds: number) => {
    if (!audioContextRef.current || durationInSeconds <= 0 || !effectsInputRef.current) return;
    const audioContext = audioContextRef.current;

    const oscillator = audioContext.createOscillator();
    oscillator.type = synthType;
    const frequency = getFrequency(noteIndex, noteOctave);

    if (!isFinite(frequency)) return;
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.02);
    const releaseTime = now + Math.max(0.03, durationInSeconds - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, releaseTime);

    oscillator.connect(gainNode);
    gainNode.connect(effectsInputRef.current);
    
    oscillator.start(now);
    oscillator.stop(releaseTime);
  }, [synthType]);

  const schedulePlayback = useCallback(() => {
    setCurrentStep((prevStep) => {
      const nextStep = prevStep === null ? 0 : (prevStep + 1) % NUM_STEPS;
      const secondsPerStep = (60 / tempo) / 4;
      
      const anySoloed = soloedTracks.some(s => s);
      drumGrid.forEach((row, soundIndex) => {
          if (row[nextStep]) {
              if (!anySoloed || soloedTracks[soundIndex]) {
                  playSample(selectedSounds[soundIndex], soundIndex);
              }
          }
      });
      
      pianoRollGrid.forEach((row, noteRowIndex) => {
        const noteDurationInSteps = row[nextStep];
        if (noteDurationInSteps > 0) {
          const noteDurationInSeconds = noteDurationInSteps * secondsPerStep;
          playSynthNote(noteRowIndex, octave, noteDurationInSeconds);
        }
      });

      return nextStep;
    });
  }, [drumGrid, pianoRollGrid, octave, tempo, soloedTracks, selectedSounds, playSample, playSynthNote]);

  useEffect(() => {
    if (isPlaying) {
      if (playbackIntervalRef.current) window.clearInterval(playbackIntervalRef.current);
      const intervalTime = (60 / tempo) * 1000 / 4; 
      playbackIntervalRef.current = window.setInterval(schedulePlayback, intervalTime);
    } else {
      if (playbackIntervalRef.current) {
        window.clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setCurrentStep(null);
    }
    return () => { if (playbackIntervalRef.current) window.clearInterval(playbackIntervalRef.current); };
  }, [isPlaying, tempo, schedulePlayback]);
  
  const handlePlayPause = useCallback(() => {
    if (!isReady) return;
    initAudio();
    setIsPlaying((prev) => !prev);
  }, [isReady, initAudio]);

  const toggleDrumPad = useCallback((row: number, col: number) => {
    setDrumGrid(prev => prev.map((r, rIndex) => rIndex === row ? r.map((cell, cIndex) => cIndex === col ? !cell : cell) : r));
  }, []);
  
  const togglePianoRollPad = useCallback((row: number, col: number) => {
    setPianoRollGrid((prevGrid) => {
        const newGrid = prevGrid.map(r => [...r]);
        let noteStartCol = -1;
        for (let i = col; i >= 0; i--) {
            const duration = newGrid[row][i];
            if (duration > 0 && i + duration > col) {
                noteStartCol = i;
                break;
            }
        }
        if (noteStartCol !== -1) {
            newGrid[row][noteStartCol] = 0;
        } else {
            const newNoteEnd = col + noteDuration;
            for (let i = col; i < newNoteEnd && i < NUM_STEPS; i++) if (newGrid[row][i] > 0) newGrid[row][i] = 0;
            newGrid[row][col] = noteDuration;
        }
        return newGrid;
    });
  }, [noteDuration]);

  const clearPattern = useCallback(() => {
    setDrumGrid(createDrumGrid(NUM_TRACKS, NUM_STEPS));
    setPianoRollGrid(createPianoRollGrid(NUM_NOTES, NUM_STEPS));
    setTempo(120);
    setSelectedSounds(INITIAL_SOUNDS);
    setTrackVolumes(Array(NUM_TRACKS).fill(0.8));
    setTrackPans(Array(NUM_TRACKS).fill(0));
    setSoloedTracks(Array(NUM_TRACKS).fill(false));
    setOctave(3);
    setSynthVolume(0.5);
    setSynthPan(0);
    setSynthType('sawtooth');
    setNoteDuration(4);
    setFilterType('lowpass');
    setFilterCutoff(8000);
    setFilterResonance(1);
    setDelayTime(0.0);
    setDelayFeedback(0.0);
    setDelayMix(0.0);
    setReverbMix(0.0);
  }, []);

  const savePattern = useCallback(() => {
    const pattern: Pattern = { drumGrid, selectedSounds, trackVolumes, trackPans, pianoRollGrid, octave, synthVolume, synthPan, synthType, tempo, filterType, filterCutoff, filterResonance, delayTime, delayFeedback, delayMix, reverbMix };
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
  }, [drumGrid, selectedSounds, trackVolumes, trackPans, pianoRollGrid, octave, synthVolume, synthPan, synthType, tempo, filterType, filterCutoff, filterResonance, delayTime, delayFeedback, delayMix, reverbMix]);

  const loadPattern = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const pattern: Pattern = JSON.parse(text);
        if (!pattern.drumGrid || !pattern.selectedSounds || !pattern.trackVolumes || !pattern.pianoRollGrid || pattern.octave === undefined || pattern.synthVolume === undefined || !pattern.tempo) {
          throw new Error('Invalid pattern file structure.');
        }
        setDrumGrid(pattern.drumGrid);
        setSelectedSounds(pattern.selectedSounds);
        setTrackVolumes(Array.isArray(pattern.trackVolumes) ? pattern.trackVolumes.map(v => safeNumber(v, 0.8)) : Array(NUM_TRACKS).fill(0.8));
        setTrackPans(Array.isArray(pattern.trackPans) ? pattern.trackPans.map(p => safeNumber(p, 0)) : Array(NUM_TRACKS).fill(0));
        setPianoRollGrid(pattern.pianoRollGrid);
        setOctave(safeNumber(pattern.octave, 3));
        setSynthVolume(safeNumber(pattern.synthVolume, 0.5));
        setSynthPan(safeNumber(pattern.synthPan, 0));
        setSynthType(pattern.synthType || 'sawtooth');
        setTempo(safeNumber(pattern.tempo, 120));
        setFilterType(pattern.filterType || 'lowpass');
        setFilterCutoff(safeNumber(pattern.filterCutoff, 8000));
        setFilterResonance(safeNumber(pattern.filterResonance, 1));
        setDelayTime(safeNumber(pattern.delayTime, 0.0));
        setDelayFeedback(safeNumber(pattern.delayFeedback, 0.0));
        setDelayMix(safeNumber(pattern.delayMix, 0.0));
        setReverbMix(safeNumber(pattern.reverbMix, 0.0));
      } catch (error) {
        console.error('Failed to load pattern:', error);
        alert('Error: Could not load the pattern file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const loadDrumPreset = useCallback((pattern: DrumPattern) => {
    setDrumGrid(pattern.grid);
    setSelectedSounds(pattern.selectedSounds);
    setTrackVolumes(Array.isArray(pattern.trackVolumes) ? pattern.trackVolumes.map(v => safeNumber(v, 0.8)) : Array(NUM_TRACKS).fill(0.8));
    if(pattern.tempo) setTempo(safeNumber(pattern.tempo, 120));
  }, []);

  const loadBassPreset = useCallback((pattern: BassPattern) => {
    setPianoRollGrid(pattern.pianoRollGrid);
    setOctave(safeNumber(pattern.octave, 3));
    setSynthVolume(safeNumber(pattern.synthVolume, 0.5));
    setSynthPan(safeNumber(pattern.synthPan, 0));
    setSynthType(pattern.synthType || 'sawtooth');
    if(pattern.tempo) setTempo(safeNumber(pattern.tempo, 120));
    setFilterType(pattern.filterType || 'lowpass');
    setFilterCutoff(safeNumber(pattern.filterCutoff, 8000));
    setFilterResonance(safeNumber(pattern.filterResonance, 1));
    setDelayTime(safeNumber(pattern.delayTime, 0.0));
    setDelayFeedback(safeNumber(pattern.delayFeedback, 0.0));
    setDelayMix(safeNumber(pattern.delayMix, 0.0));
    setReverbMix(safeNumber(pattern.reverbMix, 0.0));
  }, []);

  const handleSoundChange = useCallback((trackIndex: number, newSound: DrumSound) => {
    setSelectedSounds(prev => prev.map((s, i) => i === trackIndex ? newSound : s));
  }, []);
  
  const handleTrackVolumeChange = useCallback((trackIndex: number, newVolume: number) => {
    setTrackVolumes(prev => prev.map((v, i) => i === trackIndex ? newVolume : v));
  }, []);

  const handleTrackPanChange = useCallback((trackIndex: number, newPan: number) => {
    setTrackPans(prev => prev.map((p, i) => i === trackIndex ? newPan : p));
  }, []);

  const handleSoloTrack = useCallback((trackIndex: number) => {
    setSoloedTracks(prev => prev.map((s, i) => i === trackIndex ? !s : s));
  }, []);

  const handlePreviewSample = useCallback((soundId: DrumSound, volume: number) => {
    if (previewSourceRef.current) previewSourceRef.current.stop();
    if (!audioContextRef.current || !buffersRef.current[soundId] || !isFinite(volume)) return;
    const audioContext = audioContextRef.current;
    const source = audioContext.createBufferSource();
    source.buffer = buffersRef.current[soundId];
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
    previewSourceRef.current = source;
  }, []);
  
  const handleStopPreview = useCallback(() => {
    if (previewSourceRef.current) {
        previewSourceRef.current.stop(audioContextRef.current!.currentTime + 0.01);
        previewSourceRef.current = null;
    }
  }, []);

  const handleOctaveChange = useCallback((newOctave: number) => {
    if (isFinite(newOctave)) {
        setOctave(Math.max(0, Math.min(8, newOctave)));
    }
  }, []);

  return {
    isReady,
    initialize,
    isLoading, 
    loadingMessage, 
    isPlaying, 
    tempo, 
    currentStep,
    drumGrid, 
    selectedSounds, 
    trackVolumes, 
    trackPans,
    soloedTracks,
    pianoRollGrid, 
    octave, 
    synthVolume,
    synthPan, 
    synthType, 
    noteDuration,
    filterType, 
    filterCutoff, 
    filterResonance, 
    delayTime, 
    delayFeedback, 
    delayMix, 
    reverbMix,
    handlePlayPause, 
    handleTempoChange: setTempo, 
    clearPattern, 
    savePattern, 
    loadPattern,
    loadDrumPreset, 
    loadBassPreset,
    toggleDrumPad, 
    handleSoundChange, 
    handleTrackVolumeChange, 
    handleTrackPanChange,
    handleSoloTrack, 
    handlePreviewSample, 
    handleStopPreview,
    togglePianoRollPad, 
    handleOctaveChange, 
    handleSynthVolumeChange: setSynthVolume, 
    handleSynthPanChange: setSynthPan,
    handleSynthTypeChange: setSynthType,
    handleNoteDurationChange: setNoteDuration,
    handleFilterTypeChange: setFilterType,
    handleFilterCutoffChange: setFilterCutoff,
    handleFilterResonanceChange: setFilterResonance,
    handleDelayTimeChange: setDelayTime,
    handleDelayFeedbackChange: setDelayFeedback,
    handleDelayMixChange: setDelayMix,
    handleReverbMixChange: setReverbMix,
  };
};
