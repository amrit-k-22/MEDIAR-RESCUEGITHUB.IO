/**
 * MediAR Rescue - In-VR 3D Spatial UI & Quest Laser Controller Raycaster
 * Renders floating high-resolution 3D holographic canvas panels inside WebXR
 * on Meta Quest 3S with interactive controller trigger raycasting.
 */

class SpatialUI {
  constructor(scene, app) {
    this.scene = scene;
    this.app = app;
    this.interactiveObjects = [];

    // Create 2D offscreen canvas for rendering the 3D HUD texture
    this.canvasWidth = 1024;
    this.canvasHeight = 640;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvas.getContext('2d');

    // Polyfill roundRect for broader compatibility across VR/AR browsers
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 10) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
      };
    }

    // Create Three.js Texture & Mesh
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    // Plane mesh floating in 3D space
    const planeGeo = new THREE.PlaneGeometry(1.25, 0.78);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(planeGeo, planeMat);
    this.mesh.name = 'SpatialHUDMesh';
    // Position comfortably in front of user and slightly above patient
    this.mesh.position.set(0, 1.25, -1.1);
    this.mesh.rotation.x = -0.15; // slightly tilted up towards eye level
    this.scene.add(this.mesh);

    // Clickable hitboxes definitions on the 2D canvas
    this.buttons = [
      { id: 'prev', label: '◀ PREV', x: 50, y: 520, w: 200, h: 80, bg: '#1f304d' },
      { id: 'next', label: 'NEXT ▶', x: 270, y: 520, w: 220, h: 80, bg: '#00e5ff', textCol: '#031525' },
      { id: 'audio', label: '🔊 REPLAY', x: 510, y: 520, w: 220, h: 80, bg: '#1f304d' },
      { id: 'cpr', label: '⚡ CPR PUSH', x: 750, y: 520, w: 230, h: 80, bg: '#ff1744', textCol: '#ffffff' }
    ];

    this.currentData = {
      title: 'MediAR Rescue',
      stepNum: 1,
      totalSteps: 8,
      instruction: 'Initializing WebXR First-Aid Assistant...',
      tip: '',
      isCprActive: false
    };

    this.renderCanvas();
  }

  /**
   * Update the spatial UI with fresh step content
   */
  updateContent(data) {
    this.currentData = { ...this.currentData, ...data };
    this.renderCanvas();
  }

  /**
   * Draw the spatial HUD onto canvas
   */
  renderCanvas() {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Glassmorphism Card Background
    ctx.fillStyle = 'rgba(13, 20, 36, 0.90)';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 24);
    ctx.fill();

    // Cyan Neon Border
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Top Header Banner
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(this.currentData.title.toUpperCase(), 50, 75);

    // Step Badge
    ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(w - 280, 40, 230, 48, 12);
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "JetBrains Mono", Consolas, monospace';
    ctx.fillText(`STEP ${this.currentData.stepNum} / ${this.currentData.totalSteps}`, w - 260, 74);

    // Divider Line
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 105);
    ctx.lineTo(w - 50, 105);
    ctx.stroke();

    // Instruction Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Segoe UI", Roboto, sans-serif';
    this.wrapText(ctx, this.currentData.stepTitle || 'First-Aid Action', 50, 160, w - 100, 46);

    // Detailed Instruction Text
    ctx.fillStyle = '#d0deee';
    ctx.font = '28px "Segoe UI", Roboto, sans-serif';
    this.wrapText(ctx, this.currentData.instruction, 50, 250, w - 100, 38);

    // Clinical Tip Pill
    if (this.currentData.tip) {
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(50, 390, w - 100, 90, 12);
      ctx.fill();
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
      ctx.fillText('💡 CLINICAL TIP:', 70, 425);
      ctx.fillStyle = '#ffffff';
      ctx.font = '22px "Segoe UI", Roboto, sans-serif';
      this.wrapText(ctx, this.currentData.tip, 70, 455, w - 140, 30);
    }

    // Interactive Buttons
    this.buttons.forEach(btn => {
      ctx.fillStyle = btn.bg;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = btn.textCol || '#ffffff';
      ctx.font = 'bold 26px "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, btn.x + (btn.w / 2), btn.y + (btn.h / 2) + 9);
      ctx.textAlign = 'start';
    });

    this.texture.needsUpdate = true;
  }

  /**
   * Helper to wrap text cleanly
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  /**
   * Process intersection from Quest Controller laser pointer or mouse
   * @param {THREE.Vector2} uv - Texture coordinate (0 to 1)
   */
  handlePointerClick(uv) {
    if (!uv) return;
    const px = uv.x * this.canvasWidth;
    const py = (1 - uv.y) * this.canvasHeight; // Invert Y for canvas coordinate system

    for (const btn of this.buttons) {
      if (px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h) {
        this.triggerButtonAction(btn.id);
        break;
      }
    }
  }

  triggerButtonAction(btnId) {
    if (!this.app) return;
    switch(btnId) {
      case 'prev':
        this.app.prevStep();
        break;
      case 'next':
        this.app.nextStep();
        break;
      case 'audio':
        this.app.replayAudio();
        break;
      case 'cpr':
        if (this.app.cprTrainer) {
          this.app.cprTrainer.performCompression();
        }
        break;
      default:
        break;
    }
  }
}

window.SpatialUI = SpatialUI;
