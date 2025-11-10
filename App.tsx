import React from 'react';
import { Controls } from './components/Controls';
import { SequencerGrid } from './components/SequencerGrid';
import { PianoRoll } from './components/PianoRoll';
import { useSequencer } from './hooks/useDrumMachine';

const App: React.FC = () => {
  const {
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
  } = useSequencer();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl bg-gray-800/50 rounded-2xl shadow-2xl shadow-cyan-500/10 p-4 md:p-8 backdrop-blur-sm border border-gray-700">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Drum & Bass Sequencer
          </h1>
          <p className="text-gray-400 mt-1">
            Craft your rhythm and melody. Press play.
          </p>
        </header>

        {isLoaded ? (
          <main className="flex flex-col gap-8">
            <Controls
              isPlaying={isPlaying}
              tempo={tempo}
              octave={octave}
              onPlayPause={handlePlayPause}
              onTempoChange={handleTempoChange}
              onOctaveChange={handleOctaveChange}
              onClear={clearGrid}
              onSave={savePattern}
              onLoad={loadPattern}
              onLoadDrumPreset={loadDrumPreset}
              onLoadBassPreset={loadBassPreset}
            />
            <SequencerGrid
              grid={grid}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onPadClick={togglePad}
              selectedSounds={selectedSounds}
              onSoundChange={handleSoundChange}
              trackVolumes={trackVolumes}
              onVolumeChange={handleVolumeChange}
              soloedTracks={soloedTracks}
              onSoloTrack={handleSoloTrack}
              onPreviewSample={previewSample}
              onStopPreview={stopPreview}
            />
            <PianoRoll
              grid={pianoRollGrid}
              currentStep={currentStep}
              isPlaying={isPlaying}
              onPadClick={togglePianoRollPad}
              synthVolume={synthVolume}
              onVolumeChange={handleSynthVolumeChange}
              noteDuration={noteDuration}
              onNoteDurationChange={handleNoteDurationChange}
            />
          </main>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
             <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            <p className="mt-4 text-gray-400">Loading audio engine...</p>
          </div>
        )}
         <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;