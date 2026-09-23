/**
 * MediAR Rescue - WebXR Session & Quest Touch Controller Manager
 * Supports both color Passthrough AR ('immersive-ar') and Virtual Reality ('immersive-vr')
 * for Meta Quest 3S with controller laser pointers and hand tracking.
 */

class XRManager {
  constructor(renderer, scene, camera, app) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.app = app;

    this.xrSession = null;
    this.sessionType = null; // 'ar' | 'vr'
    this.controllers = [];
    this.controllerGrips = [];
    this.raycaster = new THREE.Raycaster();
    this.tempMatrix = new THREE.Matrix4();

    // UI Buttons
    this.btnAR = document.getElementById('btn-enter-ar');
    this.btnVR = document.getElementById('btn-enter-vr');

    this.initXR();
  }

  async initXR() {
    if (!navigator.xr) {
      this.updateButtonStates(false, false);
      return;
    }

    // Enable WebXR on Three.js WebGLRenderer
    this.renderer.xr.enabled = true;

    // Check AR (Quest 3S Color Passthrough) & VR support
    const arSupported = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
    const vrSupported = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);

    this.updateButtonStates(arSupported, vrSupported);
    this.setupControllers();
  }

  updateButtonStates(arSupported, vrSupported) {
    if (this.btnAR) {
      if (arSupported) {
        this.btnAR.disabled = false;
        this.btnAR.addEventListener('click', () => this.requestSession('immersive-ar'));
      } else {
        this.btnAR.disabled = true;
        this.btnAR.title = 'Passthrough AR requires Meta Quest 3/3S or WebXR AR device';
      }
    }

    if (this.btnVR) {
      if (vrSupported) {
        this.btnVR.disabled = false;
        this.btnVR.addEventListener('click', () => this.requestSession('immersive-vr'));
      } else {
        this.btnVR.disabled = true;
        this.btnVR.title = 'VR requires WebXR compatible headset or Quest Browser';
      }
    }
  }

  async requestSession(sessionMode) {
    if (this.xrSession) {
      await this.xrSession.end();
      return;
    }

    try {
      const sessionInit = {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hit-test', 'hand-tracking']
      };

      const session = await navigator.xr.requestSession(sessionMode, sessionInit);
      this.xrSession = session;
      this.sessionType = sessionMode === 'immersive-ar' ? 'ar' : 'vr';

      // Passthrough AR configuration: set alpha transparent background
      if (this.sessionType === 'ar') {
        this.renderer.setClearColor(0x000000, 0);
        if (this.app.sceneManager) {
          this.app.sceneManager.setEnvironmentVisibility(false);
        }
      } else {
        this.renderer.setClearColor(0x070b12, 1);
        if (this.app.sceneManager) {
          this.app.sceneManager.setEnvironmentVisibility(true);
        }
      }

      await this.renderer.xr.setSession(session);
      document.body.classList.add('in-xr');

      session.addEventListener('end', () => {
        this.xrSession = null;
        this.sessionType = null;
        document.body.classList.remove('in-xr');
        this.renderer.setClearColor(0x070b12, 1);
        if (this.app.sceneManager) {
          this.app.sceneManager.setEnvironmentVisibility(true);
        }
      });

      window.audioEngine.speak('WebXR session active. Use Quest controllers to point and click.');
    } catch (err) {
      console.warn('WebXR session request failed:', err);
      alert(`Could not start WebXR session: ${err.message}. If testing on Quest 3S, make sure to open in Meta Quest Browser.`);
    }
  }

  setupControllers() {
    // Setup Controller 0 & Controller 1
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      
      // Laser beam visual
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -3) // 3 meters beam
      ]);
      const laserMat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.7
      });
      const laser = new THREE.Line(laserGeo, laserMat);
      laser.name = 'LaserPointer';
      controller.add(laser);

      // Quest controller trigger press
      controller.addEventListener('selectstart', (e) => this.onControllerSelect(e.target));
      this.scene.add(controller);
      this.controllers.push(controller);

      // Grip controller model (visual sphere/hand indicator)
      const controllerGrip = this.renderer.xr.getControllerGrip(i);
      const gripGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const gripMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
      controllerGrip.add(new THREE.Mesh(gripGeo, gripMat));
      this.scene.add(controllerGrip);
      this.controllerGrips.push(controllerGrip);
    }
  }

  /**
   * Handle trigger pull on Meta Quest 3S Touch Controller
   */
  onControllerSelect(controller) {
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);

    // 1. Raycast against Spatial 3D UI
    if (this.app.spatialUI && this.app.spatialUI.mesh) {
      const hits = this.raycaster.intersectObject(this.app.spatialUI.mesh);
      if (hits.length > 0) {
        const uv = hits[0].uv;
        this.app.spatialUI.handlePointerClick(uv);
        return;
      }
    }

    // 2. Raycast against Patient Chest for interactive CPR
    if (this.app.patientModel && this.app.patientModel.parts.chestMesh) {
      const hits = this.raycaster.intersectObject(this.app.patientModel.parts.chestMesh, true);
      if (hits.length > 0 && this.app.cprTrainer && this.app.cprTrainer.isActive) {
        this.app.cprTrainer.performCompression();
      }
    }
  }
}

window.XRManager = XRManager;
