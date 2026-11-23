/**
 * Taskify Procedural Web Audio Synthesizer
 * Provides zero-asset offline ambient soundscapes and meditation chime.
 */

export type SoundscapeType = "none" | "rain" | "forest" | "cafe" | "white-noise";

class SoundscapeAudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: SoundscapeType = "none";
  private activeNodes: {
    sources: AudioNode[];
    gains: GainNode[];
    intervals: number[];
  } = { sources: [], gains: [], intervals: [] };
  private currentVolume: number = 0.5;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureMasterGain(): GainNode | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  /**
   * Generates a seamless looped pink noise buffer using Paul Kellet's algorithm.
   */
  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number = 4): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76160 * b5 - white * 0.016898;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.12;
    }
    return buffer;
  }

  /**
   * Generates a white noise buffer.
   */
  private createWhiteNoiseBuffer(ctx: AudioContext, seconds: number = 3): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }
    return buffer;
  }

  /**
   * Cleans up all active generators and nodes.
   */
  private clearActiveNodes() {
    this.activeNodes.intervals.forEach((id) => clearInterval(id));
    this.activeNodes.intervals = [];

    this.activeNodes.sources.forEach((s) => {
      try {
        if ("stop" in s && typeof (s as AudioScheduledSourceNode).stop === "function") {
          (s as AudioScheduledSourceNode).stop();
        }
        s.disconnect();
      } catch {}
    });
    this.activeNodes.sources = [];

    this.activeNodes.gains.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
    this.activeNodes.gains = [];
  }

  /**
   * Starts playing a procedural soundscape with smooth fade in.
   */
  public play(type: SoundscapeType, volume: number = this.currentVolume) {
    if (typeof window === "undefined") return;
    this.currentVolume = Math.max(0, Math.min(1, volume));

    if (type === "none") {
      this.stop();
      return;
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;
    const master = this.ensureMasterGain();
    if (!master) return;

    // Smoothly fade out previous soundscape if playing
    this.clearActiveNodes();
    this.currentType = type;

    // Master volume envelope
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(Math.max(0.01, this.currentVolume), ctx.currentTime + 1.2);

    if (type === "rain") {
      this.buildRainSoundscape(ctx, master);
    } else if (type === "forest") {
      this.buildForestSoundscape(ctx, master);
    } else if (type === "cafe") {
      this.buildCafeSoundscape(ctx, master);
    } else if (type === "white-noise") {
      this.buildWhiteNoiseSoundscape(ctx, master);
    }
  }

  /**
   * 1. Rain: Deep soothing rainfall + subtle droplet spatter
   */
  private buildRainSoundscape(ctx: AudioContext, dest: AudioNode) {
    // Layer 1: Pink noise base through lowpass
    const pinkBuffer = this.createPinkNoiseBuffer(ctx, 4);
    const pinkSource = ctx.createBufferSource();
    pinkSource.buffer = pinkBuffer;
    pinkSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(950, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(180, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.85, ctx.currentTime);

    pinkSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(dest);
    pinkSource.start();

    // Layer 2: White noise droplets
    const whiteBuffer = this.createWhiteNoiseBuffer(ctx, 2);
    const dropletSource = ctx.createBufferSource();
    dropletSource.buffer = whiteBuffer;
    dropletSource.loop = true;

    const dropletFilter = ctx.createBiquadFilter();
    dropletFilter.type = "bandpass";
    dropletFilter.frequency.setValueAtTime(2600, ctx.currentTime);
    dropletFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    const dropletGain = ctx.createGain();
    dropletGain.gain.setValueAtTime(0.18, ctx.currentTime);

    dropletSource.connect(dropletFilter);
    dropletFilter.connect(dropletGain);
    dropletGain.connect(dest);
    dropletSource.start();

    this.activeNodes.sources.push(pinkSource, dropletSource);
    this.activeNodes.gains.push(rainGain, dropletGain);
  }

  /**
   * 2. Forest: Soft wind gusts sweeping through trees + distant bird chirp
   */
  private buildForestSoundscape(ctx: AudioContext, dest: AudioNode) {
    const pinkBuffer = this.createPinkNoiseBuffer(ctx, 4);
    const windSource = ctx.createBufferSource();
    windSource.buffer = pinkBuffer;
    windSource.loop = true;

    // Resonant bandpass filter
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(450, ctx.currentTime);
    bandpass.Q.setValueAtTime(2.2, ctx.currentTime);

    // LFO to modulate wind frequency (sweeping rustle)
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.9, ctx.currentTime);

    windSource.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(dest);
    windSource.start();

    this.activeNodes.sources.push(windSource, lfo);
    this.activeNodes.gains.push(windGain, lfoGain);

    // Gentle bird chirp interval every 7 seconds
    const birdInterval = window.setInterval(() => {
      if (this.currentType !== "forest" || !this.ctx) return;
      this.playGentleChirp(this.ctx, dest);
    }, 7000);
    this.activeNodes.intervals.push(birdInterval);
  }

  private playGentleChirp(ctx: AudioContext, dest: AudioNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    const baseFreq = 2600 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  /**
   * 3. Cafe: Warm low-mid hum with randomized dynamic presence
   */
  private buildCafeSoundscape(ctx: AudioContext, dest: AudioNode) {
    const pinkBuffer = this.createPinkNoiseBuffer(ctx, 4);
    const cafeSource = ctx.createBufferSource();
    cafeSource.buffer = pinkBuffer;
    cafeSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1400, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(280, ctx.currentTime);

    const cafeGain = ctx.createGain();
    cafeGain.gain.setValueAtTime(0.7, ctx.currentTime);

    cafeSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(cafeGain);
    cafeGain.connect(dest);
    cafeSource.start();

    // Subtle LFO for gentle room variation
    const lfo = ctx.createOscillator();
    lfo.type = "triangle";
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(cafeGain.gain);
    lfo.start();

    this.activeNodes.sources.push(cafeSource, lfo);
    this.activeNodes.gains.push(cafeGain, lfoGain);
  }

  /**
   * 4. White Noise: Smooth full-spectrum static with gentle top-end roll-off
   */
  private buildWhiteNoiseSoundscape(ctx: AudioContext, dest: AudioNode) {
    const whiteBuffer = this.createWhiteNoiseBuffer(ctx, 3);
    const source = ctx.createBufferSource();
    source.buffer = whiteBuffer;
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(5500, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.65, ctx.currentTime);

    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(dest);
    source.start();

    this.activeNodes.sources.push(source);
    this.activeNodes.gains.push(gain);
  }

  /**
   * Stops playback with smooth fade out.
   */
  public stop() {
    if (!this.ctx || !this.masterGain || this.currentType === "none") return;
    const ctx = this.ctx;
    const master = this.masterGain;

    try {
      master.gain.setValueAtTime(Math.max(0.001, master.gain.value), ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => {
        this.clearActiveNodes();
        this.currentType = "none";
      }, 650);
    } catch {
      this.clearActiveNodes();
      this.currentType = "none";
    }
  }

  /**
   * Updates master volume in real-time.
   */
  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && this.currentType !== "none") {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Plays a 3-second preview of a soundscape.
   */
  public preview(type: SoundscapeType, seconds: number = 3) {
    this.play(type);
    setTimeout(() => {
      this.stop();
    }, seconds * 1000);
  }

  /**
   * Plays a serene harmonic singing bowl / meditation chime chord.
   * Frequencies: 528Hz (Solfeggio clarity) + 1056Hz + 1584Hz
   */
  public playChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chimeMaster = ctx.createGain();
    chimeMaster.connect(ctx.destination);
    chimeMaster.gain.setValueAtTime(0.4, now);

    const harmonics = [
      { freq: 528, gain: 0.6, decay: 3.5 },
      { freq: 1056, gain: 0.35, decay: 2.8 },
      { freq: 1584, gain: 0.15, decay: 2.0 },
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.exponentialRampToValueAtTime(gain, now + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(oscGain);
      oscGain.connect(chimeMaster);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }
}

// Global audio singleton
export const soundscapeAudio = new SoundscapeAudioService();
