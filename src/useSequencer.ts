import { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from './audioEngine';

export type Subdivision = '16th' | '8th' | 'triplet';
export type Instrument = 'kick' | 'snare' | 'hihat' | 'synth';

export const INSTRUMENTS: Instrument[] = ['kick', 'snare', 'hihat', 'synth'];

export const useSequencer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [grid, setGrid] = useState<Record<Instrument, number[]>>({
    kick: Array(16).fill(0),
    snare: Array(16).fill(0),
    hihat: Array(16).fill(0),
    synth: Array(16).fill(0),
  });
  const [subdivisions, setSubdivisions] = useState<Record<Instrument, Subdivision>>({
    kick: '16th',
    snare: '16th',
    hihat: '16th',
    synth: '16th',
  });
  const [reverb, setReverbState] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [filter, setFilterState] = useState(10000);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextNoteTimeRef = useRef(0);
  const stepRef = useRef(0); // Master 16th note clock (0-15)
  const gridRef = useRef(grid);
  const subRef = useRef(subdivisions);

  useEffect(() => {
    gridRef.current = grid;
    subRef.current = subdivisions;
  }, [grid, subdivisions]);

  const scheduleNote = useCallback((masterTick: number, time: number) => {
    INSTRUMENTS.forEach((inst) => {
      const sub = subRef.current[inst];
      let instStep = -1;

      // 48 ticks per bar (16 steps * 3 ticks/step)
      // 16th: 3 ticks per step
      // 8th: 6 ticks per step
      // Triplet: 4 ticks per step
      if (sub === '16th') {
        if (masterTick % 3 === 0) instStep = masterTick / 3;
      } else if (sub === '8th') {
        if (masterTick % 6 === 0) instStep = masterTick / 6;
      } else if (sub === 'triplet') {
        if (masterTick % 4 === 0) instStep = masterTick / 4;
      }

      if (instStep !== -1 && instStep < 16) {
        const vel = gridRef.current[inst][instStep];
        if (vel > 0) {
          if (inst === 'kick') audioEngine.playKick(time, vel);
          else if (inst === 'snare') audioEngine.playSnare(time, vel);
          else if (inst === 'hihat') audioEngine.playHiHat(time, vel);
          else if (inst === 'synth') {
            const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
            audioEngine.playSynth(time, scale[instStep % scale.length], vel);
          }
        }
      }
    });
  }, []);

  const scheduler = useCallback(() => {
    const lookahead = 0.1; 
    const scheduleInterval = 0.025; 

    while (nextNoteTimeRef.current < audioEngine.currentTime + lookahead) {
      scheduleNote(stepRef.current, nextNoteTimeRef.current);
      
      const secondsPerBeat = 60.0 / bpm;
      // 48 ticks per bar = 12 ticks per beat. 
      // 1 tick = (60/bpm) / 12 seconds
      nextNoteTimeRef.current += secondsPerBeat / 12; 

      stepRef.current = (stepRef.current + 1) % 48;
      
      // Update UI (throttled)
      // Master clock is 48 ticks. 16 steps in UI.
      // 16th note step = masterTick / 3
      const capturedStep = Math.floor(stepRef.current / 3);
      requestAnimationFrame(() => setCurrentStep(capturedStep));
    }

    timerRef.current = setTimeout(scheduler, scheduleInterval * 1000);
  }, [bpm, scheduleNote]);

  const togglePlay = () => {
    if (isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPlaying(false);
      setCurrentStep(0);
      stepRef.current = 0;
    } else {
      audioEngine.init();
      nextNoteTimeRef.current = audioEngine.currentTime + 0.05;
      setIsPlaying(true);
      scheduler();
    }
  };

  const toggleStep = (instrument: Instrument, step: number) => {
    setGrid(prev => ({
      ...prev,
      [instrument]: prev[instrument].map((val, i) => (i === step ? (val + 1) % 4 : val)),
    }));
  };

  const setSubdivision = (instrument: Instrument, sub: Subdivision) => {
    setSubdivisions(prev => ({ ...prev, [instrument]: sub }));
  };

  const setReverb = (amount: number) => {
    setReverbState(amount);
    audioEngine.setReverb(amount);
  };

  const setVolume = (amount: number) => {
    setVolumeState(amount);
    audioEngine.setVolume(amount);
  };

  const setFilter = (freq: number) => {
    setFilterState(freq);
    audioEngine.setFilter(freq);
  };

  const clearGrid = () => {
    setGrid({
      kick: Array(16).fill(0),
      snare: Array(16).fill(0),
      hihat: Array(16).fill(0),
      synth: Array(16).fill(0),
    });
  };

  const randomizeGrid = () => {
    const generateRandomTrack = (probability: number) =>
      Array.from({ length: 16 }, () =>
        Math.random() < probability ? Math.floor(Math.random() * 3) + 1 : 0
      );

    const subs: Subdivision[] = ['16th', '8th', 'triplet'];
    const getRandomSub = () => subs[Math.floor(Math.random() * subs.length)];

    setGrid({
      kick: generateRandomTrack(0.25),
      snare: generateRandomTrack(0.15),
      hihat: generateRandomTrack(0.45),
      synth: generateRandomTrack(0.30),
    });

    setSubdivisions({
      kick: getRandomSub(),
      snare: getRandomSub(),
      hihat: getRandomSub(),
      synth: getRandomSub(),
    });

    setReverb(Math.random());
    setVolume(0.2 + Math.random() * 0.8);
    setFilter(200 + Math.random() * 9800);
  };

  return {
    isPlaying,
    bpm,
    setBpm,
    currentStep,
    grid,
    subdivisions,
    reverb,
    volume,
    filter,
    togglePlay,
    toggleStep,
    setSubdivision,
    setReverb,
    setVolume,
    setFilter,
    clearGrid,
    randomizeGrid,
  };
};
