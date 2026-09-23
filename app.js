/**
 * MediAR Rescue - Master Application Controller
 * Coordinates Three.js render loop, scenario state machine, WebXR sessions,
 * 2D HUD & 3D Spatial UI synchronization, and audio narration.
 */

class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.currentScenarioId = 'cpr';
    this.currentStepIndex = 0;

    // Call dispatch timer
    this.dispatchSeconds = 142; // countdown to EMS arrival
    this.dispatchTimer = null;

    this.init();
  }

  init() {
    // 1. Scene & Renderer
    this.sceneManager = new SceneManager(this.canvas);
    this.scene = this.sceneManager.scene;
    this.camera = this.sceneManager.camera;
    this.renderer = this.sceneManager.renderer;

    // 2. Patient 3D Mannequin & Hologram Rig
    this.patientModel = new PatientModel(this.scene);

    // 3. In-VR Spatial 3D UI
    this.spatialUI = new SpatialUI(this.scene, this);

    // 4. CPR Interactive Coach
    this.cprTrainer = new CPRTrainer(window.audioEngine, this.patientModel);

    // 5. WebXR Manager (Quest 3S Passthrough AR & VR)
    this.xrManager = new XRManager(this.renderer, this.scene, this.camera, this);

    // 6. AI Triage Engine
    this.triageAI = new TriageAI(this);

    // 7. Bind 2D UI Controls
    this.bindUI();

    // 8. Load Initial Scenario
    this.selectScenario('cpr');

    // 9. Start Emergency 911 Clock
    this.startDispatchTimer();

    // 10. Start WebXR Render Loop
    this.renderer.setAnimationLoop((time, frame) => this.renderLoop(time, frame));
  }

  bindUI() {
    // Unlock Audio Context on first interaction
    const unlockAudio = () => {
      if (window.audioEngine) {
        window.audioEngine.ensureContextRunning();
      }
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Scenario sidebar items
    document.querySelectorAll('.scenario-item').forEach(item => {
      item.addEventListener('click', () => {
        const scenarioId = item.getAttribute('data-scenario');
        if (scenarioId) {
          this.selectScenario(scenarioId);
        }
      });
    });

    // Step Navigation buttons
    const btnNext = document.getElementById('btn-step-next');
    if (btnNext) btnNext.addEventListener('click', () => this.nextStep());

    const btnPrev = document.getElementById('btn-step-prev');
    if (btnPrev) btnPrev.addEventListener('click', () => this.prevStep());

    const btnReplay = document.getElementById('btn-step-replay');
    if (btnReplay) btnReplay.addEventListener('click', () => this.replayAudio());

    // Mute Audio toggle
    const btnAudio = document.getElementById('btn-toggle-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = window.audioEngine.toggleMute();
        btnAudio.textContent = isMuted ? '🔇 Audio Off' : '🔊 Audio On';
        btnAudio.classList.toggle('btn-secondary', isMuted);
        btnAudio.classList.toggle('btn-primary', !isMuted);
      });
    }

    // Call 911 shortcut
    const btnCall = document.getElementById('btn-emergency-call');
    if (btnCall) {
      btnCall.addEventListener('click', () => {
        window.audioEngine.playRadioChime();
        window.audioEngine.speak('Calling Emergency Services 911. Stay calm. Put phone on speaker. Paramedics dispatched.', true);
        const dispatchEl = document.getElementById('dispatch-text');
        if (dispatchEl) dispatchEl.textContent = 'EMS EN ROUTE (ETA 2 MIN)';
      });
    }
  }

  selectScenario(scenarioId) {
    if (!window.EMERGENCY_SCENARIOS[scenarioId]) return;
    this.currentScenarioId = scenarioId;
    this.currentStepIndex = 0;

    // Update sidebar active class
    document.querySelectorAll('.scenario-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-scenario') === scenarioId);
    });

    this.applyCurrentStep();
  }

  getCurrentScenario() {
    return window.EMERGENCY_SCENARIOS[this.currentScenarioId];
  }

  getCurrentStep() {
    const sc = this.getCurrentScenario();
    return sc.steps[this.currentStepIndex];
  }

  applyCurrentStep() {
    const scenario = this.getCurrentScenario();
    const step = this.getCurrentStep();
    const totalSteps = scenario.steps.length;

    // 1. Update 2D Step Card
    const counterEl = document.getElementById('step-counter-val');
    if (counterEl) counterEl.textContent = `STEP ${this.currentStepIndex + 1} / ${totalSteps}`;

    const tagEl = document.getElementById('step-critical-tag');
    if (tagEl) {
      tagEl.textContent = step.tag.toUpperCase();
      tagEl.className = `critical-tag ${step.tag}`;
    }

    const titleEl = document.getElementById('step-title-text');
    if (titleEl) titleEl.textContent = step.title;

    const instructEl = document.getElementById('step-instruction-text');
    if (instructEl) instructEl.textContent = step.instruction;

    const tipEl = document.getElementById('step-tip-text');
    if (tipEl) tipEl.textContent = step.tip;

    const progressFill = document.getElementById('step-progress-fill');
    if (progressFill) {
      const pct = ((this.currentStepIndex + 1) / totalSteps) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // 2. Update CPR Trainer state
    if (step.isCprActive) {
      this.cprTrainer.start();
    } else {
      this.cprTrainer.stop();
    }

    // 3. Update 3D Anatomical Patient Mannequin
    this.patientModel.setPose(step.pose || 'supine');
    this.patientModel.setHologramMode(step.hologramMode || 'none');

    // 4. Trigger AED shock sound if required by step
    if (step.triggerShockSound) {
      window.audioEngine.playAEDChargeAndShock(() => {
        // Shock delivered visual flash
        if (this.patientModel) {
          this.patientModel.applyCompression(35);
        }
      });
    }

    // 5. Update In-VR 3D Spatial UI
    this.spatialUI.updateContent({
      title: scenario.title,
      stepTitle: step.title,
      stepNum: this.currentStepIndex + 1,
      totalSteps: totalSteps,
      instruction: step.instruction,
      tip: step.tip,
      isCprActive: step.isCprActive
    });

    // 6. Voice guidance
    window.audioEngine.speak(step.voiceText || step.instruction, true);
  }

  nextStep() {
    const scenario = this.getCurrentScenario();
    if (this.currentStepIndex < scenario.steps.length - 1) {
      this.currentStepIndex++;
      this.applyCurrentStep();
    } else {
      window.audioEngine.speak('Protocol steps completed. Maintain care and monitor vitals until EMS arrives.');
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.applyCurrentStep();
    }
  }

  replayAudio() {
    const step = this.getCurrentStep();
    if (step) {
      window.audioEngine.speak(step.voiceText || step.instruction, true);
    }
  }

  startDispatchTimer() {
    this.dispatchTimer = setInterval(() => {
      if (this.dispatchSeconds > 0) {
        this.dispatchSeconds--;
        const mins = Math.floor(this.dispatchSeconds / 60);
        const secs = this.dispatchSeconds % 60;
        const dispText = document.getElementById('dispatch-text');
        if (dispText) {
          dispText.textContent = `911 EMS ARRIVAL: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      }
    }, 1000);
  }

  /**
   * Main WebGL / WebXR Animation Loop
   */
  renderLoop(time, frame) {
    const delta = this.sceneManager.update();

    // Update patient mannequin (breathing, heart pulse, bleeding particles)
    if (this.patientModel) {
      this.patientModel.update(delta);
    }

    // Render WebGL frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
