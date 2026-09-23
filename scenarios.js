/**
 * MediAR Rescue - Emergency Scenario Protocols
 * Evidence-based clinical guidelines following American Heart Association (AHA)
 * and European Resuscitation Council (ERC) standards.
 */

const EMERGENCY_SCENARIOS = {
  cpr: {
    id: 'cpr',
    title: 'Cardiac Arrest & CPR',
    subtitle: 'Chest compressions & AED protocol',
    icon: '❤️',
    urgency: 'high',
    steps: [
      {
        stepNum: 1,
        title: 'Check Responsiveness & Scene Safety',
        tag: 'high',
        instruction: 'Ensure the scene is safe for you and the victim. Kneel beside them, firmly tap both shoulders, and shout loudly: "Are you okay?!"',
        tip: 'Check for hazards like traffic, electrical wires, or unstable ground before approaching.',
        voiceText: 'Check responsiveness. Tap the shoulders firmly and shout: Are you okay?',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 2,
        title: 'Call 911 / EMS & Request AED',
        tag: 'high',
        instruction: 'If no response, immediately yell to a specific bystander: "You, call 911 and get an AED!" Put your phone on speaker if alone.',
        tip: 'Clearly point to an individual so responsibility is not diffused among bystanders.',
        voiceText: 'Call 911 immediately. Put your phone on speaker and get an Automated External Defibrillator.',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 3,
        title: 'Check Breathing & Signs of Life',
        tag: 'high',
        instruction: 'Look at the chest for normal rise and fall. Listen and feel for breathing for no more than 10 seconds. Agonal gasps are NOT normal breathing.',
        tip: 'Occasional irregular gasping sounds indicate cardiac arrest. Do not mistake gasps for breathing.',
        voiceText: 'Check for normal breathing for no more than ten seconds. If absent or only gasping, start CPR.',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 4,
        title: 'Hand Placement on Lower Sternum',
        tag: 'caution',
        instruction: 'Place the heel of one hand on the center of the chest (lower half of breastbone). Interlock fingers of your other hand on top. Keep elbows straight.',
        tip: 'Keep hands off the ribs and the very tip of the breastbone. Lock your shoulders directly over your hands.',
        voiceText: 'Place the heel of your hand in the center of the chest on the lower half of the breastbone. Interlock your fingers and lock your elbows.',
        hologramMode: 'cpr_compressions',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 5,
        title: 'High-Quality Chest Compressions',
        tag: 'high',
        instruction: 'Push HARD and FAST! Push down at least 2 inches (5-6 cm) at a rate of 100 to 120 beats per minute. Allow complete chest recoil between pumps.',
        tip: 'Follow the glowing rhythm pulse below or compress to the beat of "Stayin Alive". Target 30 compressions.',
        voiceText: 'Begin chest compressions now. Push hard and fast to the beat. Push down five to six centimeters and let the chest fully recoil.',
        hologramMode: 'cpr_compressions',
        pose: 'supine',
        isCprActive: true
      },
      {
        stepNum: 6,
        title: 'Attach AED Defibrillator Pads',
        tag: 'caution',
        instruction: 'When AED arrives, turn it on immediately. Peel and attach Pad 1 to upper right chest below collarbone, and Pad 2 to lower left ribcage.',
        tip: 'Wipe chest dry if wet. Do not stop compressions until AED voice says to pause for analysis.',
        voiceText: 'Attach the AED pads now. Place one pad on the upper right chest, and the second pad on the lower left ribcage.',
        hologramMode: 'cpr_aed_pads',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 7,
        title: 'AED Analysis & Stand Clear for Shock',
        tag: 'high',
        instruction: 'AED announces: "Analyzing heart rhythm. Do not touch patient." Shout loudly: "STAND CLEAR!" Ensure nobody is touching the patient.',
        tip: 'If shock is advised, confirm everyone is clear and press the flashing shock button.',
        voiceText: 'Analyzing heart rhythm. Stand clear! Do not touch the patient. Delivering shock now.',
        hologramMode: 'cpr_shock',
        pose: 'supine',
        isCprActive: false,
        triggerShockSound: true
      },
      {
        stepNum: 8,
        title: 'Resume CPR Compressions Immediately',
        tag: 'high',
        instruction: 'Immediately after the shock is delivered, resume high-quality chest compressions without delay. Continue 30 compressions and 2 breaths.',
        tip: 'Do not check for pulse immediately after shock. Continue CPR until EMS takes over or patient shows obvious signs of waking.',
        voiceText: 'Shock delivered. Resume chest compressions immediately without delay.',
        hologramMode: 'cpr_compressions',
        pose: 'supine',
        isCprActive: true
      }
    ]
  },

  bleeding: {
    id: 'bleeding',
    title: 'Severe Bleeding & Tourniquet',
    subtitle: 'Arterial spurting & hemorrhage control',
    icon: '🩸',
    urgency: 'high',
    steps: [
      {
        stepNum: 1,
        title: 'Identify Catastrophic Bleeding',
        tag: 'high',
        instruction: 'Look for bright red spurting or pooling blood on limbs. Arterial bleeding can cause death in less than 3 minutes if unmanaged.',
        tip: 'Expose the wound by cutting or tearing clothing to see the exact bleeding source.',
        voiceText: 'Identify the bleeding source. Arterial bleeding can be fatal within minutes. Act quickly.',
        hologramMode: 'bleeding_active',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 2,
        title: 'Apply Direct Pressure with Dressing',
        tag: 'high',
        instruction: 'Place clean gauze, cloth, or your hands directly over the bleeding site. Push down with your entire body weight.',
        tip: 'Do not remove blood-soaked dressings; pack more dressings firmly on top and maintain constant force.',
        voiceText: 'Apply firm direct pressure with both hands directly on the bleeding wound.',
        hologramMode: 'bleeding_active',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 3,
        title: 'Position Tourniquet Above Wound',
        tag: 'caution',
        instruction: 'If bleeding does not stop on a limb, place a tourniquet 2 to 3 inches (5-7 cm) above the injury. Never place directly over a joint (knee/elbow).',
        tip: 'If unsure of wound location under clothing, place high and tight at the root of the limb.',
        voiceText: 'Place the tourniquet two to three inches above the wound. Avoid joints like the knee or elbow.',
        hologramMode: 'bleeding_tourniquet',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 4,
        title: 'Tighten Windlass Rod until Bleeding Stops',
        tag: 'high',
        instruction: 'Twist the windlass rod clockwise until the bright red bleeding completely stops and the distal pulse is absent. Expect intense patient pain.',
        tip: 'A correctly applied tourniquet is painful. Reassure the patient and do not loosen it.',
        voiceText: 'Turn the windlass rod until the bleeding completely stops, then lock the rod securely.',
        hologramMode: 'bleeding_tourniquet',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 5,
        title: 'Lock Rod & Document Application Time',
        tag: 'normal',
        instruction: 'Secure the windlass rod inside the clip. Write the current time on the tourniquet time strap (e.g., "T = 14:45"). Keep patient warm.',
        tip: 'Never loosen or remove the tourniquet once applied. EMS or surgeons must remove it in the trauma bay.',
        voiceText: 'Lock the windlass in place. Note the exact time on the strap and keep the patient warm.',
        hologramMode: 'bleeding_tourniquet',
        pose: 'supine',
        isCprActive: false
      }
    ]
  },

  choking: {
    id: 'choking',
    title: 'Choking & Heimlich Maneuver',
    subtitle: 'Airway obstruction clearing',
    icon: '🫁',
    urgency: 'caution',
    steps: [
      {
        stepNum: 1,
        title: 'Assess Severe Airway Obstruction',
        tag: 'caution',
        instruction: 'Ask: "Are you choking? Can you speak?" If the person clutches their neck, cannot speak, breathe, or cough effectively, immediate action is required.',
        tip: 'If they are coughing forcefully, do NOT intervene—encourage them to keep coughing.',
        voiceText: 'Ask: Are you choking? If the person cannot speak or cough, prepare for immediate airway clearance.',
        hologramMode: 'none',
        pose: 'choking',
        isCprActive: false
      },
      {
        stepNum: 2,
        title: 'Deliver 5 Sharp Back Blows',
        tag: 'high',
        instruction: 'Lean victim forward so head is lower than chest. Support their chest with one hand. Deliver 5 sharp blows between shoulder blades with heel of hand.',
        tip: 'Gravity assists in dislodging the object out of the mouth rather than sliding further down.',
        voiceText: 'Lean the person forward. Deliver five firm back blows between the shoulder blades with the heel of your hand.',
        hologramMode: 'none',
        pose: 'choking',
        isCprActive: false
      },
      {
        stepNum: 3,
        title: 'Perform 5 Abdominal Thrusts (Heimlich)',
        tag: 'high',
        instruction: 'Stand behind victim, wrap arms around waist. Place fist thumb-side against abdomen, slightly above navel and well below ribcage. Pull sharply upward and inward.',
        tip: 'Each thrust should be a separate, distinct attempt to expel the foreign object like a cork.',
        voiceText: 'Stand behind them. Make a fist above the navel, grasp with your other hand, and give five quick upward and inward thrusts.',
        hologramMode: 'choking_thrust',
        pose: 'choking',
        isCprActive: false
      },
      {
        stepNum: 4,
        title: 'Alternate 5 Back Blows & 5 Thrusts',
        tag: 'caution',
        instruction: 'Repeat cycles of 5 back blows followed by 5 abdominal thrusts until the airway is cleared or the person becomes unconscious.',
        tip: 'Check the mouth after each cycle only if you can see a loose object.',
        voiceText: 'Alternate five back blows and five abdominal thrusts until the airway is clear.',
        hologramMode: 'choking_thrust',
        pose: 'choking',
        isCprActive: false
      },
      {
        stepNum: 5,
        title: 'If Victim Loses Consciousness',
        tag: 'high',
        instruction: 'Carefully lower the person to the ground onto their back. Call 911 immediately and begin 30 chest compressions. Look in mouth before breaths.',
        tip: 'Do NOT perform a blind finger sweep; only remove the object if clearly visible.',
        voiceText: 'If the victim collapses unconscious, lower them gently to the floor, call 911, and begin CPR compressions.',
        hologramMode: 'cpr_compressions',
        pose: 'supine',
        isCprActive: false
      }
    ]
  },

  recovery: {
    id: 'recovery',
    title: 'Unconscious Breathing (Recovery Position)',
    subtitle: 'Airway maintenance & aspiration prevention',
    icon: '🛌',
    urgency: 'normal',
    steps: [
      {
        stepNum: 1,
        title: 'Verify Normal Breathing',
        tag: 'normal',
        instruction: 'Confirm patient is unresponsive but breathing normally. The recovery position prevents the tongue from blocking the airway and avoids vomit inhalation.',
        tip: 'Remove glasses and bulky items from victim pockets before rolling.',
        voiceText: 'Confirm the patient is unresponsive but breathing normally. We will place them in the recovery position.',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 2,
        title: 'Position Nearest Arm at 90 Degrees',
        tag: 'normal',
        instruction: 'Kneel beside the patient. Place the arm nearest to you out at a right angle to their body, elbow bent with palm facing upward.',
        tip: 'This creates a stable rolling pivot that protects the shoulder joint.',
        voiceText: 'Place the arm closest to you at a ninety degree angle with palm facing up.',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 3,
        title: 'Cross Far Hand Over to Near Cheek',
        tag: 'normal',
        instruction: 'Bring the patient’s far arm across their chest. Place the back of their hand against their near cheek and hold it in place.',
        tip: 'The hand will act as a cushion to support and stabilize the head once rolled.',
        voiceText: 'Bring the far arm across the chest and place the back of the hand against the cheek.',
        hologramMode: 'none',
        pose: 'supine',
        isCprActive: false
      },
      {
        stepNum: 4,
        title: 'Bend Far Knee & Roll Towards You',
        tag: 'caution',
        instruction: 'With your other hand, pull up their far leg just above the knee, keeping foot flat on floor. Gently pull the knee toward you to roll them onto their side.',
        tip: 'Roll smoothly using the bent knee as a lever. The bent leg will anchor their body safely on their side.',
        voiceText: 'Bend the far knee up and gently roll the patient towards you onto their side.',
        hologramMode: 'none',
        pose: 'recovery',
        isCprActive: false
      },
      {
        stepNum: 5,
        title: 'Tilt Head Back & Clear Airway',
        tag: 'normal',
        instruction: 'Gently tilt the head back and lift the chin so the airway remains open. Check that fluids can drain freely from the mouth. Continuously monitor breathing.',
        tip: 'Never leave the patient unattended. If breathing stops at any point, roll them back and start CPR immediately.',
        voiceText: 'Tilt the head back gently to ensure the airway stays open. Continue monitoring breathing until paramedics arrive.',
        hologramMode: 'none',
        pose: 'recovery',
        isCprActive: false
      }
    ]
  }
};

window.EMERGENCY_SCENARIOS = EMERGENCY_SCENARIOS;
