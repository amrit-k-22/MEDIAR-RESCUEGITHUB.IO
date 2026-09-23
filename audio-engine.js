/**
 * MediAR Rescue - Audio Engine
 * Web Audio API procedural synthesis & Web Speech API vocal guidance.
 * Zero external audio assets needed - 100% reliable offline & in WebXR!
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.speechSynthesis = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.voices = [];
    this.preferredVoice = null;
    this.heartbeatTimer = null;

    this.initAudioContext();
    this.initVoices();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }
  }

  ensureContextRunning() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynthesis) return;
    const updateVoices = () => {
      this.voices = this.speechSynthesis.getVoices();
      // Try to find a clear English medical-style or natural voice
      this.preferredVoice = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David'))) 
                         || this.voices.find(v => v.lang.startsWith('en')) 
                         || this.voices[0];
    };
    updateVoices();
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  /**
   * Speak instruction aloud using Web Speech API
   * @param {string} text - text to speak
   * @param {boolean} interrupt - whether to cancel previous speech
   */
  speak(text, interrupt = true) {
    if (this.isMuted || !this.speechSynthesis || !text) return;

    if (interrupt) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    utterance.rate = 1.05; // Slightly urgent, authoritative and clear
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.speechSynthesis.speak(utterance);
    this.currentUtterance = utterance;
  }

  /**
   * Sharp CPR Metronome Click (110 BPM rhythm)
   */
  playMetronomeTick() {
    if (this.isMuted) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  /**
   * Sound effect when user pushes chest compression (Feedback)
   */
  playCompressionFeedback(depthQuality) {
    if (this.isMuted) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (depthQuality === 'good') {
      // Pleasant reassuring confirmation ding
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
    } else {
      // Lower frequency "push harder" thump
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
    }

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  /**
   * ECG Monitor Beep
   */
  playECGBeep(type = 'normal') {
    if (this.isMuted) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    if (type === 'normal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, this.audioCtx.currentTime); // C6
      gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } else if (type === 'alert') {
      // Two-tone warning beep
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    }
  }

  /**
   * AED Defibrillator Charging & Shock Sound Effect
   */
  playAEDChargeAndShock(onShockDelivered) {
    if (this.isMuted) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    // High rising pitch charge whine
    const chargeOsc = this.audioCtx.createOscillator();
    const chargeGain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    chargeOsc.type = 'sawtooth';
    chargeOsc.frequency.setValueAtTime(200, now);
    chargeOsc.frequency.exponentialRampToValueAtTime(2400, now + 1.8);

    chargeGain.gain.setValueAtTime(0.05, now);
    chargeGain.gain.linearRampToValueAtTime(0.25, now + 1.8);
    chargeGain.gain.setValueAtTime(0, now + 1.85);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.audioCtx.destination);

    chargeOsc.start(now);
    chargeOsc.stop(now + 1.85);

    // Shock burst at 1.9s
    setTimeout(() => {
      if (this.isMuted) return;
      const shockNow = this.audioCtx.currentTime;
      // White noise explosion burst
      const bufferSize = this.audioCtx.sampleRate * 0.35;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.08));
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const shockGain = this.audioCtx.createGain();
      shockGain.gain.setValueAtTime(0.6, shockNow);
      shockGain.gain.exponentialRampToValueAtTime(0.01, shockNow + 0.35);

      whiteNoise.connect(shockGain);
      shockGain.connect(this.audioCtx.destination);
      whiteNoise.start(shockNow);

      if (onShockDelivered) onShockDelivered();
    }, 1900);
  }

  /**
   * Radio squelch / 911 dispatch notification tone
   */
  playRadioChime() {
    if (this.isMuted) return;
    this.ensureContextRunning();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

// Global Audio Engine Instance
window.audioEngine = new AudioEngine();
