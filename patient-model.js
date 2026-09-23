/**
 * MediAR Rescue - 3D Anatomical Patient Model & Holographic Rig
 * High-detail stylized medical mannequin with internal holographic organs,
 * procedural skeletal rigging, wound particles, AED pads, and CPR deformation.
 * Optimized for 90 FPS rendering on Meta Quest 3S WebXR.
 */

class PatientModel {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = 'PatientRoot';
    this.scene.add(this.root);

    // Anatomical body parts references
    this.parts = {};
    this.holograms = {};
    this.particles = [];
    
    // Animation states
    this.currentPose = 'supine'; // 'supine' | 'choking' | 'recovery'
    this.chestDeformation = 0; // 0 to 1
    this.breathCycle = 0;
    this.heartbeatCycle = 0;
    this.isBleeding = false;
    this.isBreathing = false;
    this.isHeartBeating = false;
    this.aedPadsAttached = false;
    this.tourniquetTightened = false;

    this.initMaterials();
    this.buildMannequin();
    this.buildInternalOrgans();
    this.buildFirstAidHolograms();
    this.buildBleedingSystem();

    // Default placement on floor
    this.root.position.set(0, 0, -1.2);
  }

  initMaterials() {
    // Mannequin skin - high tech slate-blue medical silicone
    this.matSkin = new THREE.MeshStandardMaterial({
      color: 0x8ea8c3,
      roughness: 0.45,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95
    });

    // Joints & accent rings
    this.matJoint = new THREE.MeshStandardMaterial({
      color: 0x1f304d,
      roughness: 0.3,
      metalness: 0.5
    });

    // Holographic Translucent Heart
    this.matHeart = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2
    });

    // Holographic Lungs
    this.matLungs = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.45,
      wireframe: false
    });

    // Holographic Ribcage / Skeleton
    this.matRibs = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    // Target reticles and holographic arrows
    this.matHoloGlow = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    this.matHoloAlert = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    this.matTourniquet = new THREE.MeshStandardMaterial({
      color: 0xff9100,
      roughness: 0.6,
      metalness: 0.2
    });
  }

  buildMannequin() {
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.name = 'MannequinBody';
    this.root.add(this.bodyGroup);

    // Torso (Pelvis + Chest)
    // Lower Torso / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.19, 0.17, 0.26, 20);
    this.parts.pelvis = new THREE.Mesh(pelvisGeo, this.matSkin);
    this.parts.pelvis.position.set(0, 0.15, 0.1);
    this.parts.pelvis.rotation.x = Math.PI / 2;
    this.bodyGroup.add(this.parts.pelvis);

    // Chest / Upper Torso (Deflects during CPR compressions)
    this.parts.chestGroup = new THREE.Group();
    this.parts.chestGroup.position.set(0, 0.16, -0.16);
    this.bodyGroup.add(this.parts.chestGroup);

    const chestGeo = new THREE.CylinderGeometry(0.22, 0.19, 0.34, 24);
    this.parts.chestMesh = new THREE.Mesh(chestGeo, this.matSkin);
    this.parts.chestMesh.rotation.x = Math.PI / 2;
    this.parts.chestGroup.add(this.parts.chestMesh);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 16);
    this.parts.neck = new THREE.Mesh(neckGeo, this.matSkin);
    this.parts.neck.position.set(0, 0.14, -0.38);
    this.parts.neck.rotation.x = Math.PI / 2;
    this.bodyGroup.add(this.parts.neck);

    // Head
    this.parts.headGroup = new THREE.Group();
    this.parts.headGroup.position.set(0, 0.15, -0.52);
    this.bodyGroup.add(this.parts.headGroup);

    const headGeo = new THREE.SphereGeometry(0.12, 24, 24);
    headGeo.scale(0.9, 1.15, 1.0);
    this.parts.head = new THREE.Mesh(headGeo, this.matSkin);
    this.parts.headGroup.add(this.parts.head);

    // Face features (Nose & Chin for tilt visualization)
    const noseGeo = new THREE.ConeGeometry(0.025, 0.05, 8);
    this.parts.nose = new THREE.Mesh(noseGeo, this.matSkin);
    this.parts.nose.position.set(0, 0.12, -0.02);
    this.parts.nose.rotation.x = -Math.PI / 2;
    this.parts.headGroup.add(this.parts.nose);

    // Shoulders
    const shoulderGeo = new THREE.SphereGeometry(0.075, 16, 16);
    this.parts.leftShoulder = new THREE.Mesh(shoulderGeo, this.matJoint);
    this.parts.leftShoulder.position.set(-0.25, 0.14, -0.28);
    this.bodyGroup.add(this.parts.leftShoulder);

    this.parts.rightShoulder = new THREE.Mesh(shoulderGeo, this.matJoint);
    this.parts.rightShoulder.position.set(0.25, 0.14, -0.28);
    this.bodyGroup.add(this.parts.rightShoulder);

    // Left Arm Hierarchy
    this.parts.leftUpperArm = this.createLimb(0.06, 0.28, this.matSkin);
    this.parts.leftUpperArm.position.copy(this.parts.leftShoulder.position);
    this.parts.leftUpperArm.rotation.set(0, 0, -0.15);
    this.bodyGroup.add(this.parts.leftUpperArm);

    this.parts.leftForearm = this.createLimb(0.05, 0.26, this.matSkin);
    this.parts.leftForearm.position.set(-0.29, 0.12, 0.08);
    this.bodyGroup.add(this.parts.leftForearm);

    // Right Arm Hierarchy
    this.parts.rightUpperArm = this.createLimb(0.06, 0.28, this.matSkin);
    this.parts.rightUpperArm.position.copy(this.parts.rightShoulder.position);
    this.parts.rightUpperArm.rotation.set(0, 0, 0.15);
    this.bodyGroup.add(this.parts.rightUpperArm);

    this.parts.rightForearm = this.createLimb(0.05, 0.26, this.matSkin);
    this.parts.rightForearm.position.set(0.29, 0.12, 0.08);
    this.bodyGroup.add(this.parts.rightForearm);

    // Legs
    // Left Leg
    this.parts.leftThigh = this.createLimb(0.08, 0.42, this.matSkin);
    this.parts.leftThigh.position.set(-0.11, 0.12, 0.44);
    this.bodyGroup.add(this.parts.leftThigh);

    this.parts.leftShin = this.createLimb(0.065, 0.42, this.matSkin);
    this.parts.leftShin.position.set(-0.11, 0.09, 0.88);
    this.bodyGroup.add(this.parts.leftShin);

    // Right Leg (Site of Severe Femoral Arterial Bleeding scenario)
    this.parts.rightThigh = this.createLimb(0.08, 0.42, this.matSkin);
    this.parts.rightThigh.position.set(0.11, 0.12, 0.44);
    this.bodyGroup.add(this.parts.rightThigh);

    this.parts.rightShin = this.createLimb(0.065, 0.42, this.matSkin);
    this.parts.rightShin.position.set(0.11, 0.09, 0.88);
    this.bodyGroup.add(this.parts.rightShin);
  }

  createLimb(radius, length, material) {
    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(radius * 0.9, radius, length, 16);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
    return group;
  }

  buildInternalOrgans() {
    this.organsGroup = new THREE.Group();
    this.parts.chestGroup.add(this.organsGroup);

    // Pulsing Heart Mesh
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 0.03, -0.05, 0.06, -0.05, 0.1);
    heartShape.bezierCurveTo(-0.05, 0.14, 0, 0.16, 0, 0.13);
    heartShape.bezierCurveTo(0, 0.16, 0.05, 0.14, 0.05, 0.1);
    heartShape.bezierCurveTo(0.05, 0.06, 0, 0.03, 0, 0);

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();

    this.parts.heart = new THREE.Mesh(heartGeo, this.matHeart);
    this.parts.heart.position.set(0.03, 0.04, -0.02);
    this.parts.heart.rotation.x = -Math.PI / 2;
    this.parts.heart.scale.set(0.65, 0.65, 0.65);
    this.organsGroup.add(this.parts.heart);

    // Left & Right Lungs
    const lungGeo = new THREE.ConeGeometry(0.07, 0.18, 16);
    this.parts.leftLung = new THREE.Mesh(lungGeo, this.matLungs);
    this.parts.leftLung.position.set(-0.08, 0.03, -0.02);
    this.parts.leftLung.rotation.x = Math.PI;
    this.organsGroup.add(this.parts.leftLung);

    this.parts.rightLung = new THREE.Mesh(lungGeo, this.matLungs);
    this.parts.rightLung.position.set(0.09, 0.03, -0.02);
    this.parts.rightLung.rotation.x = Math.PI;
    this.organsGroup.add(this.parts.rightLung);

    // Ribcage cage hologram
    const ribsGeo = new THREE.CylinderGeometry(0.21, 0.18, 0.28, 12, 4, true);
    this.parts.ribcage = new THREE.Mesh(ribsGeo, this.matRibs);
    this.parts.ribcage.rotation.x = Math.PI / 2;
    this.parts.ribcage.position.set(0, 0.01, 0);
    this.organsGroup.add(this.parts.ribcage);
  }

  buildFirstAidHolograms() {
    this.holoGroup = new THREE.Group();
    this.root.add(this.holoGroup);

    // 1. CPR Hand Placement Target Disk on lower sternum
    const reticleGeo = new THREE.RingGeometry(0.035, 0.06, 32);
    this.holograms.cprReticle = new THREE.Mesh(reticleGeo, this.matHoloGlow);
    this.holograms.cprReticle.rotation.x = -Math.PI / 2;
    this.holograms.cprReticle.position.set(0, 0.32, -0.14);
    this.holoGroup.add(this.holograms.cprReticle);

    // Inner pulsing target crosshair
    const crossGeo = new THREE.RingGeometry(0.005, 0.02, 16);
    this.holograms.cprCross = new THREE.Mesh(crossGeo, this.matHoloAlert);
    this.holograms.cprCross.rotation.x = -Math.PI / 2;
    this.holograms.cprCross.position.set(0, 0.321, -0.14);
    this.holoGroup.add(this.holograms.cprCross);

    // Downward 3D force arrow for CPR compression vector
    const arrowConeGeo = new THREE.ConeGeometry(0.04, 0.08, 16);
    const arrowShaftGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 16);
    this.holograms.cprArrow = new THREE.Group();
    const cone = new THREE.Mesh(arrowConeGeo, this.matHoloGlow);
    cone.position.y = 0.04;
    cone.rotation.x = Math.PI; // point down
    const shaft = new THREE.Mesh(arrowShaftGeo, this.matHoloGlow);
    shaft.position.y = 0.14;
    this.holograms.cprArrow.add(cone);
    this.holograms.cprArrow.add(shaft);
    this.holograms.cprArrow.position.set(0, 0.38, -0.14);
    this.holoGroup.add(this.holograms.cprArrow);

    // 2. AED Defibrillator Electrode Pads
    this.holograms.aedGroup = new THREE.Group();
    this.holoGroup.add(this.holograms.aedGroup);

    // Pad 1: Upper Right Chest (below right clavicle)
    const padGeo = new THREE.PlaneGeometry(0.09, 0.07);
    const padMat1 = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00e676,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });
    this.holograms.aedPad1 = new THREE.Mesh(padGeo, padMat1);
    this.holograms.aedPad1.rotation.x = -Math.PI / 2;
    this.holograms.aedPad1.rotation.z = -0.3;
    this.holograms.aedPad1.position.set(-0.11, 0.30, -0.22);
    this.holograms.aedGroup.add(this.holograms.aedPad1);

    // Pad 2: Lower Left Ribs (lateral under left armpit)
    const padMat2 = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00e676,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });
    this.holograms.aedPad2 = new THREE.Mesh(padGeo, padMat2);
    this.holograms.aedPad2.rotation.x = -Math.PI / 2;
    this.holograms.aedPad2.rotation.y = 0.4;
    this.holograms.aedPad2.position.set(0.14, 0.28, -0.06);
    this.holograms.aedGroup.add(this.holograms.aedPad2);

    // Stand clear electrical safety perimeter ring
    const barrierGeo = new THREE.RingGeometry(0.7, 0.75, 48);
    this.holograms.shockBarrier = new THREE.Mesh(barrierGeo, this.matHoloAlert);
    this.holograms.shockBarrier.rotation.x = -Math.PI / 2;
    this.holograms.shockBarrier.position.set(0, 0.02, 0);
    this.holograms.shockBarrier.visible = false;
    this.holoGroup.add(this.holograms.shockBarrier);

    // 3. Tourniquet & Arterial Bleeding Marker
    this.holograms.woundGroup = new THREE.Group();
    this.holoGroup.add(this.holograms.woundGroup);

    // Wound location indicator (Right thigh)
    const woundRingGeo = new THREE.RingGeometry(0.04, 0.06, 24);
    this.holograms.woundMarker = new THREE.Mesh(woundRingGeo, this.matHoloAlert);
    this.holograms.woundMarker.rotation.x = -Math.PI / 2;
    this.holograms.woundMarker.position.set(0.11, 0.23, 0.50);
    this.holograms.woundGroup.add(this.holograms.woundMarker);

    // Tourniquet Band (placed 2-3 inches / 7cm above wound on upper thigh)
    const tourniquetGeo = new THREE.TorusGeometry(0.088, 0.025, 12, 24);
    this.holograms.tourniquet = new THREE.Mesh(tourniquetGeo, this.matTourniquet);
    this.holograms.tourniquet.position.set(0.11, 0.12, 0.36);
    this.holograms.tourniquet.rotation.y = Math.PI / 2;
    this.holograms.tourniquet.visible = false;
    this.holograms.woundGroup.add(this.holograms.tourniquet);

    // Windlass Rod
    const rodGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.16, 12);
    this.holograms.windlass = new THREE.Mesh(rodGeo, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 }));
    this.holograms.windlass.position.set(0.11, 0.23, 0.36);
    this.holograms.windlass.rotation.z = Math.PI / 2;
    this.holograms.windlass.visible = false;
    this.holograms.woundGroup.add(this.holograms.windlass);

    // 4. Heimlich Abdominal Thrust Vector (Arrow curving upward into abdomen)
    this.holograms.heimlichGroup = new THREE.Group();
    this.holograms.heimlichGroup.visible = false;
    this.holoGroup.add(this.holograms.heimlichGroup);

    const heimlichTargetGeo = new THREE.RingGeometry(0.03, 0.05, 24);
    this.holograms.heimlichTarget = new THREE.Mesh(heimlichTargetGeo, this.matHoloAlert);
    this.holograms.heimlichTarget.rotation.x = -Math.PI / 2;
    this.holograms.heimlichTarget.position.set(0, 0.28, 0.0);
    this.holograms.heimlichGroup.add(this.holograms.heimlichTarget);

    const heimlichArrow = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 16), this.matHoloAlert);
    heimlichArrow.position.set(0, 0.34, 0.06);
    heimlichArrow.rotation.x = -Math.PI / 4; // angle upward and inward!
    this.holograms.heimlichGroup.add(heimlichArrow);

    // Default visibility
    this.setHologramMode('cpr');
  }

  buildBleedingSystem() {
    // Particle system for spurting arterial wound
    const particleCount = 45;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0.11;
      positions[i * 3 + 1] = 0.23;
      positions[i * 3 + 2] = 0.50;

      velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: 0.25 + Math.random() * 0.35, // spurt upwards
        z: (Math.random() - 0.5) * 0.15,
        life: Math.random()
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xd50000,
      size: 0.028,
      transparent: true,
      opacity: 0.85
    });

    this.bloodParticles = new THREE.Points(geo, pMat);
    this.bloodParticles.visible = false;
    this.bloodVelocities = velocities;
    this.root.add(this.bloodParticles);
  }

  /**
   * Set hologram mode according to scenario step
   */
  setHologramMode(mode) {
    // Hide all first
    this.holograms.cprReticle.visible = false;
    this.holograms.cprCross.visible = false;
    this.holograms.cprArrow.visible = false;
    this.holograms.aedGroup.visible = false;
    this.holograms.shockBarrier.visible = false;
    this.holograms.woundGroup.visible = false;
    this.holograms.heimlichGroup.visible = false;
    this.bloodParticles.visible = false;

    switch(mode) {
      case 'cpr_compressions':
        this.holograms.cprReticle.visible = true;
        this.holograms.cprCross.visible = true;
        this.holograms.cprArrow.visible = true;
        break;
      case 'cpr_aed_pads':
        this.holograms.aedGroup.visible = true;
        break;
      case 'cpr_shock':
        this.holograms.aedGroup.visible = true;
        this.holograms.shockBarrier.visible = true;
        break;
      case 'bleeding_active':
        this.holograms.woundGroup.visible = true;
        this.holograms.woundMarker.visible = true;
        this.holograms.tourniquet.visible = false;
        this.holograms.windlass.visible = false;
        this.bloodParticles.visible = true;
        this.isBleeding = true;
        break;
      case 'bleeding_tourniquet':
        this.holograms.woundGroup.visible = true;
        this.holograms.woundMarker.visible = true;
        this.holograms.tourniquet.visible = true;
        this.holograms.windlass.visible = true;
        this.bloodParticles.visible = false;
        this.isBleeding = false;
        break;
      case 'choking_thrust':
        this.holograms.heimlichGroup.visible = true;
        break;
      case 'recovery':
        // No specific tool hologram, just position visual
        break;
      default:
        break;
    }
  }

  /**
   * Smoothly switch mannequin pose (supine, choking, recovery)
   */
  setPose(poseName) {
    this.currentPose = poseName;

    if (poseName === 'supine') {
      // Flat on back
      this.bodyGroup.rotation.set(0, 0, 0);
      this.parts.headGroup.rotation.set(0, 0, 0);
      this.parts.leftUpperArm.rotation.set(0, 0, -0.15);
      this.parts.rightUpperArm.rotation.set(0, 0, 0.15);
      this.parts.leftThigh.rotation.set(0, 0, 0);
      this.parts.rightThigh.rotation.set(0, 0, 0);
    } else if (poseName === 'choking') {
      // Leaning forward slightly, hands clutching neck
      this.bodyGroup.rotation.set(0.35, 0, 0);
      this.parts.headGroup.rotation.set(0.2, 0, 0);
      // Hands near neck
      this.parts.leftUpperArm.rotation.set(0.6, 0.4, -0.4);
      this.parts.rightUpperArm.rotation.set(0.6, -0.4, 0.4);
    } else if (poseName === 'recovery') {
      // Rolled onto side
      this.bodyGroup.rotation.set(0, 0, -1.25); // rolled 70 degrees onto left side
      this.parts.headGroup.rotation.set(0.2, 0, 0.3); // tilted back
      // Far right arm bent across chest supporting head
      this.parts.rightUpperArm.rotation.set(0.8, -0.4, 0.6);
      // Top right leg bent at hip & knee at 90 degrees to anchor
      this.parts.rightThigh.rotation.set(0.8, 0, 0.5);
    }
  }

  /**
   * Interactive CPR chest compression animation
   * @param {number} depthMm - 0 to 60 mm depth
   */
  applyCompression(depthMm) {
    const norm = Math.min(depthMm / 60, 1.2);
    this.chestDeformation = norm;

    // Deflect chest group downwards along local Y
    this.parts.chestGroup.position.y = 0.16 - (norm * 0.05);
    this.parts.chestMesh.scale.set(1 + norm * 0.12, 1 - norm * 0.22, 1 + norm * 0.12);

    // Reticle moves down with chest
    this.holograms.cprReticle.position.y = 0.32 - (norm * 0.05);
    this.holograms.cprCross.position.y = 0.321 - (norm * 0.05);
    this.holograms.cprArrow.position.y = 0.38 - (norm * 0.05);
  }

  /**
   * Update loops called on each render frame
   */
  update(delta) {
    // 1. Return chest smoothly after compression release
    if (this.chestDeformation > 0.01) {
      this.chestDeformation = THREE.MathUtils.lerp(this.chestDeformation, 0, delta * 15);
      this.applyCompression(this.chestDeformation * 55);
    }

    // 2. Holographic Pulse Animations
    this.heartbeatCycle += delta * 3.5;
    const pulse = 1 + Math.sin(this.heartbeatCycle) * 0.12;

    if (this.parts.heart) {
      this.parts.heart.scale.set(0.65 * pulse, 0.65 * pulse, 0.65 * pulse);
    }

    // Reticle animation
    if (this.holograms.cprReticle.visible) {
      this.holograms.cprCross.scale.set(pulse, pulse, pulse);
      this.holograms.cprArrow.position.y = 0.38 + Math.sin(this.heartbeatCycle * 1.5) * 0.025;
    }

    // Shock barrier rotation
    if (this.holograms.shockBarrier.visible) {
      this.holograms.shockBarrier.rotation.z += delta * 1.2;
    }

    // 3. Arterial Bleeding Particle Simulation
    if (this.isBleeding && this.bloodParticles) {
      const pos = this.bloodParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.bloodVelocities.length; i++) {
        const vel = this.bloodVelocities[i];
        const idx = i * 3;

        pos[idx] += vel.x * delta;
        pos[idx + 1] += vel.y * delta;
        pos[idx + 2] += vel.z * delta;

        // Gravity pulls blood down
        vel.y -= 1.8 * delta;

        // Hit the floor / reset
        if (pos[idx + 1] < 0.01) {
          pos[idx] = 0.11;
          pos[idx + 1] = 0.23;
          pos[idx + 2] = 0.50;
          vel.y = 0.25 + Math.random() * 0.35;
          vel.x = (Math.random() - 0.5) * 0.15;
          vel.z = (Math.random() - 0.5) * 0.15;
        }
      }
      this.bloodParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}

window.PatientModel = PatientModel;
