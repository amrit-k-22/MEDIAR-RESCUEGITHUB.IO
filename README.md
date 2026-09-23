# MediAR Rescue: WebXR Emergency First-Aid Assistant

> **WebXR-based AR/VR emergency first-aid assistant developed for Meta Quest 3S browser and modern web browsers.**

MediAR Rescue provides real-time, situation-specific visual, audio, and spatial guidance during medical emergencies. Designed for bystanders without medical training, it provides 3D holographic guidance, an interactive CPR metronome, an AI triage decision tree, and spatial controller interaction.

---

## ✨ Features

- **🥽 Meta Quest 3S WebXR Support**:
  - **Color Passthrough AR (`immersive-ar`)**: Projects the holographic 3D patient and guidance markers directly onto your physical floor or table.
  - **Immersive VR (`immersive-vr`)**: Complete virtual simulation scene with ambient lighting and spatial emergency perimeter.
  - **Quest Touch Controllers**: Cyan laser pointer beams and trigger raycasting for clicking 3D floating buttons and performing CPR compressions.
  - **3D Spatial UI**: In-VR floating canvas HUD displaying real-time step guidance, clinical tips, and navigation controls.
- **🧑‍⚕️ 3D Anatomical Patient Mannequin**:
  - Stylized anatomical avatar with internal translucent organs: pulsing heart, expanding lungs, and ribcage silhouette.
  - Procedural chest compression deformation (50–60 mm depth).
  - Arterial bleeding particle simulation with windlass tourniquet hemostasis.
  - Multi-pose animation: Supine (CPR & Bleeding), Choking posture, and Recovery position.
- **🚑 4 Critical Clinical Protocols (AHA & ERC Compliant)**:
  1. **Cardiac Arrest & CPR**: Check responsiveness, 911 dispatch, hand placement reticle, 110 BPM metronome ("Stayin' Alive" rhythm), live compression depth meter, 30:2 cycle count, and AED defibrillation voice guide.
  2. **Severe Arterial Bleeding**: Direct pressure dressing, tourniquet placement 2-3 inches above wound, and windlass rod tightening.
  3. **Choking & Heimlich Maneuver**: 5 sharp back blows and 5 abdominal thrusts with upward/inward trajectory arrow.
  4. **Unconscious Breathing (Recovery Position)**: 5-step rolling maneuver to maintain open airway.
- **🔊 Zero-Dependency Audio & Speech Engine**:
  - Web Audio API procedural synthesis for 110 BPM metronome clicks, compression depth dings, and AED charge/shock sounds.
  - Web Speech Synthesis API (`window.speechSynthesis`) for clear vocal instruction playback.
- **🤖 AI Bystander Triage & Simulated Vision Scanner**:
  - 3-question rapid bystander diagnostic decision tree.
  - Simulated AR computer vision reticle with real-time bounding boxes and vitals analysis.

---

## 🚀 Getting Started

### Local Development / Desktop Browser

1. Clone this repository:
   ```bash
   git clone https://github.com/amrit-kaur22/mediar-rescue.git
   cd mediar-rescue
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080/index.html
   ```

---

## 🥽 Running on Meta Quest 3S

1. Connect your **Meta Quest 3S** to the same local Wi-Fi network as your host computer.
2. Note your computer's local IP address (e.g., `192.168.1.50`).
3. In the headset, open the **Meta Quest Browser**.
4. Go to `http://<YOUR_PC_IP>:8080/index.html`.
5. Click:
   - **🥽 Enter AR (Passthrough)**: Places the holographic patient on your physical floor.
   - **🕶️ Enter VR**: Enters the full virtual simulation environment.
6. Aim your Quest Touch controller laser pointers at the floating 3D spatial buttons or the patient's chest and pull the trigger!

---

## 📁 Project Structure

```
team_gamma/
├── index.html                 # Main WebXR entrypoint, 2D/3D HUD, and meta tags
├── README.md                  # Project documentation and Quest setup instructions
├── .gitignore                 # Git ignore file
├── css/
│   └── style.css              # Cyber-medical UI theme, glassmorphism, responsive HUD
└── js/
    ├── app.js                 # App coordinator, render loop, state management
    ├── xr-manager.js          # WebXR sessions (immersive-ar, immersive-vr, controllers)
    ├── scene-manager.js       # Three.js scene, camera, lighting, environment, fallback orbit controls
    ├── patient-model.js       # 3D anatomical patient mannequin, organs, bleeding particles, rigging
    ├── scenarios.js           # AHA/ERC emergency clinical protocols
    ├── cpr-trainer.js         # Interactive 110 BPM metronome & compression depth gauge
    ├── audio-engine.js        # Web Audio API synthesizer & Web Speech API vocal guidance
    ├── triage-ai.js           # AI bystander triage decision tree & simulated AR scanner
    └── spatial-ui.js          # Floating in-VR 3D canvas HUD & Quest controller raycaster
```

---

## 📜 Clinical Disclaimer
*MediAR Rescue is designed as an interactive emergency training and bystander assistance demonstration tool. In any real-world emergency, always immediately call emergency medical services (911/112/999) before taking action.*
