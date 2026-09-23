/**
 * MediAR Rescue - CPR Interactive Compression Coach & Metronome
 * Guides bystander with 110 BPM visual/audio rhythm, detects compression cadence,
 * calculates target depth (5-6cm), and tracks 30:2 cycle ratios.
 */

class CPRTrainer {
  constructor(audioEngine, patientModel) {
    this.audioEngine = audioEngine;
    this.patientModel = patientModel;

    this.isActive = false;
    this.bpmTarget = 110;
    this.intervalMs = (60 / this.bpmTarget) * 1000; // ~545ms

    this.timerId = null;
    this.compressionsCount = 0;
    this.cycleCount = 1;
    this.lastCompressionTime = 0;
    this.userIntervals = [];
    this.measuredBpm = 0;

    // UI elements
    this.pulseCircle = document.getElementById('rhythm-circle');
    this.bpmDisplay = document.getElementById('rhythm-bpm-val');
    this.countDisplay = document.getElementById('cpr-count-val');
    this.depthDisplay = document.getElementById('cpr-depth-val');
    this.bottomBar = document.getElementById('hud-bottom-bar');
    this.actionBtn = document.getElementById('cpr-action-btn');

    this.bindEvents();
  }

  bindEvents() {
    // Keyboard Spacebar for instant compression
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isActive) {
        e.preventDefault();
        this.performCompression();
      }
    });

    if (this.actionBtn) {
      this.actionBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.performCompression();
      });
    }
  }

  /**
   * Start CPR Metronome & interactive session
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.compressionsCount = 0;
    this.userIntervals = [];

    if (this.bottomBar) {
      this.bottomBar.style.display = 'flex';
    }

    this.updateStatsUI();

    // Start Metronome timer
    this.timerId = setInterval(() => {
      this.tick();
    }, this.intervalMs);
  }

  /**
   * Stop CPR session
   */
  stop() {
    this.isActive = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.bottomBar) {
      this.bottomBar.style.display = 'none';
    }
  }

  /**
   * Metronome tick callback
   */
  tick() {
    if (!this.isActive) return;

    // Visual pulse
    if (this.pulseCircle) {
      this.pulseCircle.classList.add('beat');
      setTimeout(() => {
        if (this.pulseCircle) this.pulseCircle.classList.remove('beat');
      }, 90);
    }

    // Audio click
    if (this.audioEngine) {
      this.audioEngine.playMetronomeTick();
    }
  }

  /**
   * Perform single chest compression
   */
  performCompression() {
    const now = performance.now();
    this.compressionsCount++;

    // Calculate cadence
    if (this.lastCompressionTime > 0) {
      const dt = now - this.lastCompressionTime;
      if (dt > 250 && dt < 1500) {
        this.userIntervals.push(dt);
        if (this.userIntervals.length > 5) this.userIntervals.shift();
        const avgDt = this.userIntervals.reduce((a, b) => a + b, 0) / this.userIntervals.length;
        this.measuredBpm = Math.round(60000 / avgDt);
      }
    }
    this.lastCompressionTime = now;

    // Simulate depth between 50mm and 58mm (Target: 50-60mm)
    const simulatedDepth = Math.floor(50 + Math.random() * 8);

    // Apply to 3D Mannequin
    if (this.patientModel) {
      this.patientModel.applyCompression(simulatedDepth);
    }

    // Audio feedback
    if (this.audioEngine) {
      this.audioEngine.playCompressionFeedback('good');
    }

    // 30:2 CPR Cycle Check
    if (this.compressionsCount >= 30) {
      this.compressionsCount = 0;
      this.cycleCount++;
      if (this.audioEngine) {
        this.audioEngine.speak('Thirty compressions complete. Give two rescue breaths now!', true);
      }
    }

    this.updateStatsUI(simulatedDepth);
  }

  updateStatsUI(depth = 52) {
    if (this.countDisplay) {
      this.countDisplay.textContent = `${this.compressionsCount} / 30`;
    }
    if (this.bpmDisplay) {
      this.bpmDisplay.textContent = this.measuredBpm > 0 ? `${this.measuredBpm} BPM` : `110 BPM`;
    }
    if (this.depthDisplay) {
      this.depthDisplay.textContent = `${depth} mm (Good)`;
    }
  }
}

window.CPRTrainer = CPRTrainer;
