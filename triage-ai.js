/**
 * MediAR Rescue - AI Triage Assessment & Optical Vision Scanner
 * Rapid 3-question bystander diagnostic decision tree,
 * plus simulated AR computer vision bounding-box scanner.
 */

class TriageAI {
  constructor(app) {
    this.app = app;
    this.modal = document.getElementById('triage-modal');
    this.questionText = document.getElementById('triage-question-text');
    this.optionsContainer = document.getElementById('triage-options-container');
    this.scannerOverlay = document.getElementById('scanner-overlay');
    this.isScanning = false;
    this.currentStep = 1;

    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById('btn-open-triage');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openTriage());
    }

    const closeBtn = document.getElementById('btn-close-triage');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeTriage());
    }

    const scanBtn = document.getElementById('btn-toggle-scan');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => this.toggleScanner());
    }
  }

  openTriage() {
    this.currentStep = 1;
    this.renderStep1();
    if (this.modal) {
      this.modal.classList.add('active');
    }
  }

  closeTriage() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }

  renderStep1() {
    this.questionText.textContent = 'Question 1: Is the victim conscious & responsive?';
    this.optionsContainer.innerHTML = `
      <button class="triage-btn" id="triage-resp-no">
        <span>❌ No — Unresponsive (Eyes closed, no reaction)</span>
        <span>➔</span>
      </button>
      <button class="triage-btn" id="triage-resp-yes">
        <span>✅ Yes — Conscious / Responding to voice or touch</span>
        <span>➔</span>
      </button>
    `;

    document.getElementById('triage-resp-no').addEventListener('click', () => this.renderStep2Unconscious());
    document.getElementById('triage-resp-yes').addEventListener('click', () => this.renderStep2Conscious());
  }

  renderStep2Unconscious() {
    this.questionText.textContent = 'Question 2: Are they breathing normally?';
    this.optionsContainer.innerHTML = `
      <button class="triage-btn" id="triage-breath-no" style="border-color: #ff1744; background: rgba(255,23,68,0.15)">
        <span>🚨 NO breathing OR only agonal gasping / snoring sounds</span>
        <span>➔</span>
      </button>
      <button class="triage-btn" id="triage-breath-yes">
        <span>✅ YES — Chest rising & falling steadily</span>
        <span>➔</span>
      </button>
    `;

    document.getElementById('triage-breath-no').addEventListener('click', () => {
      this.finishTriage('cpr', 'CARDIAC ARREST DETECTED! Immediate chest compressions & AED required.');
    });

    document.getElementById('triage-breath-yes').addEventListener('click', () => {
      this.finishTriage('recovery', 'Unconscious but breathing: Place in Recovery Position immediately to prevent airway obstruction.');
    });
  }

  renderStep2Conscious() {
    this.questionText.textContent = 'Question 2: What is the primary emergency symptom?';
    this.optionsContainer.innerHTML = `
      <button class="triage-btn" id="triage-sym-bleed" style="border-color: #ff1744;">
        <span>🩸 Severe spurting / pulsing blood from an arm or leg</span>
        <span>➔</span>
      </button>
      <button class="triage-btn" id="triage-sym-choke" style="border-color: #ffb300;">
        <span>🫁 Clutching neck, cannot speak, breathe, or cough (Choking)</span>
        <span>➔</span>
      </button>
      <button class="triage-btn" id="triage-sym-chest">
        <span>💔 Severe crushing chest pain & shortness of breath</span>
        <span>➔</span>
      </button>
    `;

    document.getElementById('triage-sym-bleed').addEventListener('click', () => {
      this.finishTriage('bleeding', 'ARTERIAL HEMORRHAGE! Apply direct pressure & tourniquet immediately.');
    });

    document.getElementById('triage-sym-choke').addEventListener('click', () => {
      this.finishTriage('choking', 'SEVERE AIRWAY OBSTRUCTION! Deliver 5 back blows followed by 5 Heimlich thrusts.');
    });

    document.getElementById('triage-sym-chest').addEventListener('click', () => {
      this.finishTriage('cpr', 'SUSPECTED ACUTE CORONARY SYNDROME! Prepare for potential cardiac arrest.');
    });
  }

  finishTriage(scenarioId, diagnosis) {
    this.closeTriage();
    if (this.app) {
      this.app.selectScenario(scenarioId);
      window.audioEngine.speak(`Triage assessment complete: ${diagnosis}`, true);
    }
  }

  /**
   * Simulated AI Camera Scanner
   */
  toggleScanner() {
    this.isScanning = !this.isScanning;
    if (this.scannerOverlay) {
      if (this.isScanning) {
        this.scannerOverlay.classList.add('active');
        window.audioEngine.playRadioChime();
        window.audioEngine.speak('AI Emergency Vision Scanner active. Analyzing patient posture and trauma indicators.');
        
        // Auto identify after 3.5 seconds
        setTimeout(() => {
          if (this.isScanning) {
            const scanTag = document.querySelector('.scan-tag');
            if (scanTag) scanTag.textContent = 'TARGET: CARDIAC ARREST DETECTED (CONFIDENCE 96%)';
            window.audioEngine.playECGBeep('alert');
          }
        }, 3000);
      } else {
        this.scannerOverlay.classList.remove('active');
      }
    }
  }
}

window.TriageAI = TriageAI;
