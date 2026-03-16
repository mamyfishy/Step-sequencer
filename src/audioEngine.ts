/**
 * Web Audio Synthesis Engine
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.reverbGain = this.ctx.createGain();
      this.convolver = this.ctx.createConvolver();
      this.filterNode = this.ctx.createBiquadFilter();
      
      // Generate simple impulse response for reverb
      const length = this.ctx.sampleRate * 2;
      const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }
      this.convolver.buffer = impulse;
      
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 20000;
      
      this.masterGain.connect(this.filterNode);
      this.filterNode.connect(this.ctx.destination);
      
      this.masterGain.connect(this.convolver);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.ctx.destination);
      
      this.reverbGain.gain.value = 0; // Default off
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setReverb(amount: number) {
    if (this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime(amount, this.ctx!.currentTime, 0.1);
    }
  }

  setVolume(amount: number) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(amount, this.ctx!.currentTime, 0.1);
    }
  }

  setFilter(freq: number) {
    if (this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx!.currentTime, 0.1);
    }
  }

  get currentTime() {
    return this.ctx?.currentTime || 0;
  }

  private createWhiteNoise() {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    return whiteNoise;
  }

  playKick(time: number, velocity: number = 3) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vGain = velocity / 3;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1 * vGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  playSnare(time: number, velocity: number = 3) {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.createWhiteNoise();
    if (!noise) return;
    const vGain = velocity / 3;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1 * vGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, time);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7 * vGain, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.2);
    osc.stop(time + 0.2);
  }

  playHiHat(time: number, velocity: number = 3) {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.createWhiteNoise();
    if (!noise) return;
    const vGain = velocity / 3;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 7000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3 * vGain, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  playSynth(time: number, freq: number = 440, velocity: number = 3) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vGain = velocity / 3;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.2 * vGain, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }
}

export const audioEngine = new AudioEngine();
