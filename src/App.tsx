
import React, { useState, useEffect } from 'react';
import { Controls } from './components/Controls';
import { PianoRoll } from './components/PianoRoll';
import { SequencerGrid } from './components/SequencerGrid';
import { useSequencer } from './hooks/useDrumMachine';

const OfflineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.99 9.19c-1.73-1.73-3.93-2.97-6.34-3.46L12 1 7.35 5.73C4.94 6.22 2.74 7.46 1.01 9.19c-.2.2-.2.51 0 .71l1.41 1.41c.2.2.51.2.71 0 1.78-1.78 4.16-2.83 6.68-2.83 1.28 0 2.5.27 3.63.76l5.3 5.3c.2.2.51.2.71 0l1.41-1.41c.2-.2.2-.51 0-.71l-1.41-1.41c.38-.16.77-.29 1.16-.4.39-.11.78-.19 1.17-.24v-1.17zM12 13.5l4.5 4.5c.2.2.51.2.71 0l1.41-1.41c.2-.2.2-.51 0-.71L12 9.27 5.38 15.89c-.2.2-.2.51 0 .71l1.41 1.41c.2.2.51.2.71 0L12 13.5z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const App: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
        <div className="text-center relative">
             {!isOnline && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 text-gray-400 px-3 py-1 rounded-full text-sm flex items-center gap-2 whitespace-nowrap">
                    <OfflineIcon className="w-4 h-4" />
                    <span>Offline Mode</span>
                </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-8">
                Drum & Bass Sequencer
            </h1>
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
        <header className="mb-6 text-center relative">
          {!isOnline && (
                <div className="inline-flex items-center gap-2 bg-gray-800/80 border border-gray-600 text-gray-400 px-3 py-1 rounded-full text-xs mb-2 animate-pulse">
                    <OfflineIcon className="w-3 h-3" />
                    <span>Offline</span>
                </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Drum & Bass Sequencer
          </h1>
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
