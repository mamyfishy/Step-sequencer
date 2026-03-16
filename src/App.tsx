import { Play, Square, Trash2, Music, Zap, Activity, Settings2, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSequencer, INSTRUMENTS, Instrument, Subdivision } from './useSequencer';

export default function App() {
  const {
    isPlaying,
    bpm,
    setBpm,
    currentStep,
    grid,
    subdivisions,
    togglePlay,
    toggleStep,
    setSubdivision,
    setReverb,
    setVolume,
    setFilter,
    reverb,
    volume,
    filter,
    clearGrid,
    randomizeGrid,
  } = useSequencer();

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter flex items-center gap-2">
            <Zap className="text-[#00ff88] fill-[#00ff88] w-6 h-6 sm:w-8 sm:h-8" />
            SONIC<span className="text-[#00ff88]">GRID</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-mono opacity-50 uppercase tracking-widest mt-1">
            High-Precision Web Sequencer
          </p>
        </div>
        
        <div className="flex items-center w-full sm:w-auto">
          <div className="flex flex-col items-start sm:items-end w-full">
            <span className="text-[10px] font-bold opacity-40 uppercase">Tempo</span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <input
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                className="w-full sm:w-24 accent-[#00ff88]"
              />
              <span className="font-mono text-xl font-bold w-12 text-right">{bpm}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Controls */}
      <div className="flex gap-3 mb-8">
        <button
          id="play-button"
          onClick={togglePlay}
          className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
            isPlaying 
              ? 'bg-red-500/10 text-red-500 border border-red-500/50' 
              : 'bg-[#00ff88] text-black hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>
        
        <button
          id="random-button"
          onClick={randomizeGrid}
          className="px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-[#00ccff]"
          title="Randomize Grid"
        >
          <Shuffle size={20} />
        </button>

        <button
          id="clear-button"
          onClick={clearGrid}
          className="px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-red-400"
          title="Clear Grid"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Sequencer Grid */}
      <div className="flex-1 pb-4 w-full select-none">
        <div className="w-full flex flex-col gap-2 sm:gap-6">
          {INSTRUMENTS.map((inst) => (
            <div key={inst} className="sequencer-grid items-center">
              <div className="instrument-label gap-1 sm:gap-2">
                {inst === 'kick' && <Activity size={16} className="text-orange-500 shrink-0" />}
                {inst === 'snare' && <Zap size={16} className="text-blue-400 shrink-0" />}
                {inst === 'hihat' && <Music size={16} className="text-yellow-400 shrink-0" />}
                {inst === 'synth' && <Settings2 size={16} className="text-purple-400 shrink-0" />}
                <span className="hidden sm:inline w-12">{inst}</span>
                <select
                  value={subdivisions[inst]}
                  onChange={(e) => setSubdivision(inst, e.target.value as Subdivision)}
                  className="bg-white/5 text-[10px] p-1 rounded border border-white/10"
                >
                  <option value="16th">16</option>
                  <option value="8th">8</option>
                  <option value="triplet">3</option>
                </select>
              </div>
              {grid[inst].map((velocity, step) => {
                const isActive = velocity > 0;
                const opacity = velocity === 1 ? '40' : velocity === 2 ? 'a0' : 'ff';
                const shadowOpacity = velocity === 1 ? '00' : velocity === 2 ? '40' : '88';
                
                const baseColor = inst === 'kick' ? '#f97316' 
                  : inst === 'snare' ? '#60a5fa' 
                  : inst === 'hihat' ? '#facc15' 
                  : '#a855f7';

                return (
                  <motion.div
                    key={step}
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => toggleStep(inst, step)}
                    className={`step-pad ${isActive ? 'active' : 'inactive'} ${
                      currentStep === (step + 1) % 16 ? 'ring-2 ring-white/30' : ''
                    }`}
                    style={{
                      backgroundColor: isActive ? `${baseColor}${opacity}` : undefined,
                      boxShadow: isActive ? `0 0 15px ${baseColor}${shadowOpacity}` : 'none'
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Effects */}
      <footer className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest">Reverb</label>
          <input type="range" min="0" max="1" step="0.05" value={reverb} onChange={(e) => setReverb(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-300" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest">Volume</label>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-300" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-gray-400 uppercase tracking-widest">Filter</label>
          <input type="range" min="200" max="10000" step="100" value={filter} onChange={(e) => setFilter(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gray-300" />
        </div>
      </footer>

      {/* Visualizer Overlay (Optional aesthetic) */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 h-1 pointer-events-none overflow-hidden flex"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 h-full transition-opacity duration-100 ${
                  currentStep === (i + 1) % 16 ? 'bg-[#00ff88] opacity-100' : 'opacity-0'
                }`} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
