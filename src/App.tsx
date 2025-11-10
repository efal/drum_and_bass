
import React from 'react';
import { Controls } from './components/Controls';
import { PianoRoll } from './components/PianoRoll';
import { SequencerGrid } from './components/SequencerGrid';
import { useSequencer } from './hooks/useDrumMachine';

const App: React.FC = () => {
  const {
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
    handleTempoChange,
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
    handleSynthVolumeChange,
    handleSynthPanChange,
    handleSynthTypeChange,
    handleNoteDurationChange,
    handleFilterTypeChange,
    handleFilterCutoffChange,
    handleFilterResonanceChange,
    handleDelayTimeChange,
    handleDelayFeedbackChange,
    handleDelayMixChange,
    handleReverbMixChange,
  } = useSequencer();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-2">
                Drum & Bass Sequencer
            </h1>
            <p className="text-gray-400 mb-8">
                Craft your rhythm and melody.
            </p>
            {isLoading ? (
                 <>
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-400">{loadingMessage}</p>
                </>
            ) : (
                <button 
                    onClick={initialize}
                    className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg text-xl transition-all duration-300 hover:bg-cyan-400 active:scale-95 shadow-lg shadow-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                >
                    Start Creating
                </button>
            )}
            {loadingMessage.startsWith('Error') && !isLoading && (
              <p className="mt-4 text-red-400">{loadingMessage}</p>
            )}
        </div>
      </div>
    );
  }

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

        <main className="flex flex-col gap-8">
          <Controls
            isPlaying={isPlaying}
            tempo={tempo}
            octave={octave}
            onPlayPause={handlePlayPause}
            onTempoChange={handleTempoChange}
            onOctaveChange={handleOctaveChange}
            onClear={clearPattern}
            onSave={savePattern}
            onLoad={loadPattern}
            onLoadDrumPreset={loadDrumPreset}
            onLoadBassPreset={loadBassPreset}
          />
          <SequencerGrid
            grid={drumGrid}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onPadClick={toggleDrumPad}
            selectedSounds={selectedSounds}
            onSoundChange={handleSoundChange}
            trackVolumes={trackVolumes}
            onVolumeChange={handleTrackVolumeChange}
            trackPans={trackPans}
            onPanChange={handleTrackPanChange}
            soloedTracks={soloedTracks}
            onSoloTrack={handleSoloTrack}
            onPreviewSample={handlePreviewSample}
            onStopPreview={handleStopPreview}
          />
          <PianoRoll
            grid={pianoRollGrid}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onPadClick={togglePianoRollPad}
            synthVolume={synthVolume}
            onVolumeChange={handleSynthVolumeChange}
            synthPan={synthPan}
            onPanChange={handleSynthPanChange}
            synthType={synthType}
            onSynthTypeChange={handleSynthTypeChange}
            noteDuration={noteDuration}
            onNoteDurationChange={handleNoteDurationChange}
            filterType={filterType}
            onFilterTypeChange={handleFilterTypeChange}
            filterCutoff={filterCutoff}
            onFilterCutoffChange={handleFilterCutoffChange}
            filterResonance={filterResonance}
            onFilterResonanceChange={handleFilterResonanceChange}
            delayTime={delayTime}
            onDelayTimeChange={handleDelayTimeChange}
            delayFeedback={delayFeedback}
            onDelayFeedbackChange={handleDelayFeedbackChange}
            delayMix={delayMix}
            onDelayMixChange={handleDelayMixChange}
            reverbMix={reverbMix}
            onReverbMixChange={handleReverbMixChange}
          />
        </main>

        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
