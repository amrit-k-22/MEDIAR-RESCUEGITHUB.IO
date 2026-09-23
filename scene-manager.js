/**
 * MediAR Rescue - 3D Scene Manager
 * Configures Three.js WebGLRenderer, Camera, Cinematic Studio & Medical Lighting,
 * Virtual Floor Environment, and OrbitControls for desktop/mobile fallback.
 */

class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.initCamera();
    this.initRenderer();
    this.initLighting();
    this.initEnvironment();
    this.initControls();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Position camera overlooking patient from kneeling rescuer perspective
    this.camera.position.set(0.6, 1.3, 0.4);
    this.camera.lookAt(0, 0.2, -1.2);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true, // Crucial for Meta Quest 3S color passthrough AR!
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setClearColor(0x070b12, 1);
  }

  initLighting() {
    // Ambient soft blue fill
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.8);
    this.scene.add(ambientLight);

    // Key directional light (cool white surgical flood)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2, 4, 1);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    this.scene.add(keyLight);

    // Rim / Back light (cyan medical glow)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.5);
    rimLight.position.set(-2, 2.5, -3);
    this.scene.add(rimLight);

    // Under-body soft emergency glow
    const underLight = new THREE.PointLight(0x00e5ff, 0.8, 4);
    underLight.position.set(0, 0.1, -1.2);
    this.scene.add(underLight);
  }

  initEnvironment() {
    this.envGroup = new THREE.Group();
    this.envGroup.name = 'EnvironmentGroup';
    this.scene.add(this.envGroup);

    // High-tech floor grid with cyber-medical circular markings
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070d18,
      roughness: 0.8,
      metalness: 0.3
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.set(0, -0.01, -1.2);
    this.floor.receiveShadow = true;
    this.envGroup.add(this.floor);

    // Grid helper
    const grid = new THREE.GridHelper(8, 24, 0x00e5ff, 0x132742);
    grid.position.set(0, 0, -1.2);
    this.envGroup.add(grid);

    // Holographic rescue zone circle perimeter
    const rescueCircleGeo = new THREE.RingGeometry(1.2, 1.25, 48);
    const rescueCircleMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const rescueCircle = new THREE.Mesh(rescueCircleGeo, rescueCircleMat);
    rescueCircle.rotation.x = -Math.PI / 2;
    rescueCircle.position.set(0, 0.005, -1.2);
    this.envGroup.add(rescueCircle);
  }

  initControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
      this.controls.minDistance = 0.5;
      this.controls.maxDistance = 4.5;
      this.controls.target.set(0, 0.2, -1.2);
      this.controls.update();
    } else {
      // Lightweight fallback orbit controls without CDN dependency
      let isDragging = false;
      let prevMousePos = { x: 0, y: 0 };
      let spherical = { radius: 1.8, theta: 0.4, phi: 1.1 };
      const target = new THREE.Vector3(0, 0.2, -1.2);

      const updateCamera = () => {
        spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
        this.camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        this.camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
        this.camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        this.camera.lookAt(target);
      };

      this.canvas.addEventListener('pointerdown', (e) => {
        if (e.button === 0) {
          isDragging = true;
          prevMousePos = { x: e.clientX, y: e.clientY };
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMousePos.x;
        const dy = e.clientY - prevMousePos.y;
        prevMousePos = { x: e.clientX, y: e.clientY };

        spherical.theta -= dx * 0.008;
        spherical.phi -= dy * 0.008;
        updateCamera();
      });

      window.addEventListener('pointerup', () => { isDragging = false; });
      this.canvas.addEventListener('wheel', (e) => {
        spherical.radius = Math.max(0.6, Math.min(4.0, spherical.radius + e.deltaY * 0.002));
        updateCamera();
      }, { passive: true });

      updateCamera();
    }
  }

  setEnvironmentVisibility(visible) {
    if (this.envGroup) {
      this.envGroup.visible = visible;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    const delta = this.clock.getDelta();
    if (this.controls && !this.renderer.xr.isPresenting) {
      this.controls.update();
    }
    return delta;
  }
}

window.SceneManager = SceneManager;
