
# Exercise Configuration for AI Trainer
# This file mirrors the TypeScript exercise definitions to provide the Python backend
# with the necessary metadata for dynamic angle calculation and rep counting.

EXERCISE_CONFIGS = {
    'push-ups': {
        'name': 'Push-ups',
        'key_angles': ['left_elbow', 'right_elbow', 'torso_inclination'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (130, 200), 'right_elbow': (130, 200), 'torso_inclination': (45, 95)}},
            {'name': 'down', 'ranges': {'left_elbow': (30, 120), 'right_elbow': (30, 120), 'torso_inclination': (45, 95)}}
        ],
        'form_checks': [
            {'name': 'body_alignment', 'type': 'alignment', 'threshold': 15}
        ]
    },
    'squats': {
        'name': 'Squats',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'torso_inclination'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (130, 200), 'right_knee': (130, 200), 'left_hip': (130, 200), 'right_hip': (130, 200), 'torso_inclination': (0, 50)}},
            {'name': 'down', 'ranges': {'left_knee': (50, 130), 'right_knee': (50, 130), 'left_hip': (50, 130), 'right_hip': (50, 130), 'torso_inclination': (0, 50)}}
        ],
        'form_checks': [
            {'name': 'knee_stability', 'type': 'alignment', 'threshold': 15}
        ]
    },
    'bicep-curls': {
        'name': 'Bicep Curls',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (130, 200), 'right_elbow': (130, 200)}},
            {'name': 'up', 'ranges': {'left_elbow': (20, 100), 'right_elbow': (20, 100)}}
        ],
        'form_checks': [
            {'name': 'elbow_fixed', 'type': 'position', 'threshold': 15}
        ]
    },
    'plank': {
        'name': 'Plank',
        'key_angles': ['left_elbow', 'left_hip', 'left_knee', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (130, 200), 'left_elbow': (40, 140), 'torso_inclination': (45, 105)}}
        ],
        'form_checks': []
    },
    'lunges': {
        'name': 'Lunges',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (130, 200), 'right_knee': (130, 200)}},
            {'name': 'down', 'ranges': {'left_knee': (50, 130), 'right_knee': (50, 130)}}
        ],
        'form_checks': []
    },
    'jumping-jacks': {
        'name': 'Jumping Jacks',
        'key_angles': ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'closed', 'ranges': {'left_shoulder': (-20, 60), 'right_shoulder': (-20, 60)}},
            {'name': 'open', 'ranges': {'left_shoulder': (120, 200), 'right_shoulder': (120, 200)}}
        ],
        'form_checks': []
    },
    'shoulder-press': {
        'name': 'Shoulder Press',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (30, 130), 'right_elbow': (30, 130)}},
            {'name': 'up', 'ranges': {'left_elbow': (120, 200), 'right_elbow': (120, 200)}}
        ],
        'form_checks': []
    },
    'dumbbell-rows': {
        'name': 'Dumbbell Rows',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (120, 200), 'right_elbow': (120, 200)}},
            {'name': 'up', 'ranges': {'left_elbow': (10, 110), 'right_elbow': (10, 110)}}
        ],
        'form_checks': []
    },
    'mountain-climbers': {
        'name': 'Mountain Climbers',
        'key_angles': ['left_knee', 'right_knee', 'torso_inclination'],
        'stages': [
            {'name': 'neutral', 'ranges': {'left_knee': (110, 200), 'right_knee': (110, 200), 'torso_inclination': (45, 105)}},
            {'name': 'active', 'ranges': {'left_knee': (15, 120), 'right_knee': (15, 120), 'torso_inclination': (45, 105)}}
        ],
        'form_checks': []
    },
    'burpees': {
        'name': 'Burpees',
        'key_angles': ['left_hip', 'left_knee', 'left_elbow', 'torso_inclination'],
        'stages': [
            {'name': 'stand', 'ranges': {'torso_inclination': (-20, 60)}},
            {'name': 'plank', 'ranges': {'torso_inclination': (50, 105), 'left_elbow': (120, 200)}}
        ],
        'form_checks': []
    },
    'high-knees': {
        'name': 'High Knees',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'down', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}},
            {'name': 'up', 'ranges': {'left_knee': (30, 100), 'right_knee': (30, 100), 'left_hip': (50, 100)}}
        ],
        'form_checks': []
    },
    'jump-rope': {
        'name': 'Jump Rope',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'landed', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}},
            {'name': 'airborne', 'ranges': {'left_knee': (120, 160), 'right_knee': (120, 160), 'left_hip': (150, 190)}}
        ],
        'form_checks': []
    },
    'running-in-place': {
        'name': 'Running in Place',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'ground', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}},
            {'name': 'lifted', 'ranges': {'left_knee': (80, 120), 'right_knee': (80, 120)}}
        ],
        'form_checks': []
    },
    'forward-fold': {
        'name': 'Forward Fold',
        'key_angles': ['left_hip', 'right_hip', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (30, 90), 'right_hip': (30, 90), 'torso_inclination': (60, 120)}}
        ],
        'form_checks': []
    },
    'cat-cow': {
        'name': 'Cat-Cow',
        'key_angles': ['torso_inclination', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'cat', 'ranges': {'torso_inclination': (80, 120)}},
            {'name': 'cow', 'ranges': {'torso_inclination': (140, 180)}}
        ],
        'form_checks': []
    },
    'childs-pose': {
        'name': 'Child\'s Pose',
        'key_angles': ['left_hip', 'left_knee'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (30, 70), 'left_knee': (30, 70)}}
        ],
        'form_checks': []
    },
    'downward-dog': {
        'name': 'Downward Dog',
        'key_angles': ['left_hip', 'left_shoulder', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (60, 100), 'left_shoulder': (140, 180)}}
        ],
        'form_checks': []
    },
    'quad-stretch': {
        'name': 'Quad Stretch',
        'key_angles': ['left_knee', 'left_hip'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_knee': (30, 70), 'left_hip': (160, 200)}}
        ],
        'form_checks': []
    },
    'shoulder-stretch': {
        'name': 'Shoulder Stretch',
        'key_angles': ['left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_shoulder': (60, 120), 'right_shoulder': (160, 200)}}
        ],
        'form_checks': []
    },
    'jump-squats': {
        'name': 'Jump Squats',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'squat', 'ranges': {'left_knee': (60, 100), 'right_knee': (60, 100)}},
            {'name': 'jump', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}}
        ],
        'form_checks': []
    },
    'box-jumps': {
        'name': 'Box Jumps',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'ground', 'ranges': {'left_knee': (60, 120), 'right_knee': (60, 120), 'left_hip': (50, 120)}},
            {'name': 'landed', 'ranges': {'left_knee': (70, 130), 'right_knee': (70, 130), 'left_hip': (60, 130)}}
        ],
        'form_checks': []
    },
    'plyo-pushups': {
        'name': 'Plyo Push-ups',
        'key_angles': ['left_elbow', 'right_elbow', 'torso_inclination'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (60, 90), 'right_elbow': (60, 90)}},
            {'name': 'explosive', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}}
        ],
        'form_checks': []
    },
    'tuck-jumps': {
        'name': 'Tuck Jumps',
        'key_angles': ['left_knee', 'right_knee', 'left_hip'],
        'stages': [
            {'name': 'ground', 'ranges': {'left_knee': (140, 200), 'right_knee': (140, 200)}},
            {'name': 'tucked', 'ranges': {'left_knee': (30, 70), 'right_knee': (30, 70)}}
        ],
        'form_checks': []
    },
    'lateral-bounds': {
        'name': 'Lateral Bounds',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'left', 'ranges': {'left_knee': (80, 120)}},
            {'name': 'right', 'ranges': {'right_knee': (80, 120)}}
        ],
        'form_checks': []
    },
    'glute-bridges': {
        'name': 'Glute Bridge',
        'key_angles': ['left_hip', 'right_hip', 'left_knee', 'right_knee'],
        'stages': [
            {'name': 'down', 'ranges': {'left_hip': (40, 70), 'right_hip': (40, 70)}},
            {'name': 'up', 'ranges': {'left_hip': (160, 180), 'right_hip': (160, 180)}}
        ],
        'form_checks': []
    },
    'side-plank': {
        'name': 'Side Plank',
        'key_angles': ['left_hip', 'left_shoulder', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (160, 200)}}
        ],
        'form_checks': []
    },
    'wall-sit': {
        'name': 'Wall Sit',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_knee': (80, 100), 'right_knee': (80, 100)}}
        ],
        'form_checks': []
    },
    'tricep-dips': {
        'name': 'Tricep Dips',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (80, 100), 'right_elbow': (80, 100)}},
            {'name': 'up', 'ranges': {'left_elbow': (160, 180), 'right_elbow': (160, 180)}}
        ],
        'form_checks': []
    },
    'bird-dog': {
        'name': 'Bird Dog',
        'key_angles': ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_shoulder': (140, 180)}}
        ],
        'form_checks': []
    },
    'calf-raises': {
        'name': 'Calf Raises',
        'key_angles': ['left_knee', 'right_knee', 'torso_inclination'],
        'stages': [
            {'name': 'down', 'ranges': {'left_knee': (165, 200), 'right_knee': (165, 200), 'torso_inclination': (0, 20)}},  # Flat on ground, knees straight
            {'name': 'up', 'ranges': {'left_knee': (165, 200), 'right_knee': (165, 200), 'torso_inclination': (0, 30)}}     # On toes, body rises, torso shifts slightly
        ],
        'form_checks': []
    },
    'superman': {
        'name': 'Superman',
        'key_angles': ['left_hip', 'left_shoulder', 'torso_inclination'],
        'stages': [
            {'name': 'hold', 'ranges': {'left_hip': (160, 200), 'left_shoulder': (140, 180)}}
        ],
        'form_checks': []
    },
    'bicycle-crunches': {
        'name': 'Bicycle Crunches',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'right', 'ranges': {'right_knee': (60, 90)}},
            {'name': 'left', 'ranges': {'left_knee': (60, 90)}}
        ],
        'form_checks': []
    },
    'reverse-lunges': {
        'name': 'Reverse Lunge',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'down', 'ranges': {'left_knee': (80, 100), 'right_knee': (80, 100)}},
            {'name': 'up', 'ranges': {'left_knee': (160, 180), 'right_knee': (160, 180)}}
        ],
        'form_checks': []
    },
    'pike-pushups': {
        'name': 'Pike Push-ups',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'left_hip'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (70, 90), 'right_elbow': (70, 90)}},
            {'name': 'up', 'ranges': {'left_elbow': (160, 180), 'right_elbow': (160, 180)}}
        ],
        'form_checks': []
    },
    
    # ============================================
    # EQUIPMENT EXERCISES
    # ============================================
    
    # Resistance Band Exercises
    'rb_row': {
        'name': 'Resistance Band Row',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'extended', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}},
            {'name': 'pulled', 'ranges': {'left_elbow': (60, 100), 'right_elbow': (60, 100)}}
        ],
        'form_checks': []
    },
    'rb_chest_press': {
        'name': 'Resistance Band Chest Press',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder'],
        'stages': [
            {'name': 'retracted', 'ranges': {'left_elbow': (60, 100), 'right_elbow': (60, 100)}},
            {'name': 'extended', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Pull-up Bar Exercises
    'pb_pullup_standard': {
        'name': 'Pull-ups',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}},
            {'name': 'up', 'ranges': {'left_elbow': (40, 90), 'right_elbow': (40, 90)}}
        ],
        'form_checks': []
    },
    
    # Kettlebell Exercises
    'kb_swing': {
        'name': 'Kettlebell Swing',
        'key_angles': ['left_hip', 'right_hip', 'left_shoulder', 'torso_inclination'],
        'stages': [
            {'name': 'bottom', 'ranges': {'left_hip': (60, 100), 'torso_inclination': (30, 60)}},
            {'name': 'top', 'ranges': {'left_hip': (160, 200), 'left_shoulder': (140, 180)}}
        ],
        'form_checks': []
    },
    'kb_snatch': {
        'name': 'Kettlebell Snatch',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'left_hip'],
        'stages': [
            {'name': 'bottom', 'ranges': {'left_hip': (60, 100)}},
            {'name': 'top', 'ranges': {'left_elbow': (160, 200), 'left_shoulder': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Barbell Exercises
    'bb_squat': {
        'name': 'Barbell Squat',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'torso_inclination'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}},
            {'name': 'down', 'ranges': {'left_knee': (70, 110), 'right_knee': (70, 110)}}
        ],
        'form_checks': []
    },
    'bb_bench_press': {
        'name': 'Barbell Bench Press',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (60, 100), 'right_elbow': (60, 100)}},
            {'name': 'up', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Dumbbell Exercises (additional)
    'db_shoulder_press': {
        'name': 'Dumbbell Shoulder Press',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'down', 'ranges': {'left_elbow': (70, 110), 'right_elbow': (70, 110)}},
            {'name': 'up', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Cable Machine Exercises
    'cable_lat_pulldown': {
        'name': 'Cable Lat Pulldown',
        'key_angles': ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder'],
        'stages': [
            {'name': 'extended', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}},
            {'name': 'pulled', 'ranges': {'left_elbow': (60, 100), 'right_elbow': (60, 100)}}
        ],
        'form_checks': []
    },
    'cable_tricep_pushdown': {
        'name': 'Cable Tricep Pushdown',
        'key_angles': ['left_elbow', 'right_elbow'],
        'stages': [
            {'name': 'up', 'ranges': {'left_elbow': (60, 100), 'right_elbow': (60, 100)}},
            {'name': 'down', 'ranges': {'left_elbow': (160, 200), 'right_elbow': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Machine Exercises
    'machine_leg_press': {
        'name': 'Leg Press Machine',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'bent', 'ranges': {'left_knee': (70, 110), 'right_knee': (70, 110)}},
            {'name': 'extended', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}}
        ],
        'form_checks': []
    },
    
    # Smith Machine Exercises
    'smith_squat': {
        'name': 'Smith Machine Squat',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (160, 200), 'right_knee': (160, 200)}},
            {'name': 'down', 'ranges': {'left_knee': (70, 110), 'right_knee': (70, 110)}}
        ],
        'form_checks': []
    },
    
    # Bench Exercises
    'bench_bulgarian_split_squat': {
        'name': 'Bulgarian Split Squat',
        'key_angles': ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
        'stages': [
            {'name': 'up', 'ranges': {'left_knee': (160, 200)}},
            {'name': 'down', 'ranges': {'left_knee': (70, 110)}}
        ],
        'form_checks': []
    },
    
    # ============================================
    # RECOVERY EXERCISES (Time-based tracking)
    # ============================================
    
    'walking': {
        'name': 'Walking',
        'key_angles': [],  # Time-based, no angle tracking
        'stages': [],
        'form_checks': [],
        'tracking_type': 'time_based'
    },
    'gentle-yoga-flow': {
        'name': 'Gentle Yoga Flow',
        'key_angles': ['left_hip', 'left_shoulder', 'torso_inclination'],
        'stages': [
            {'name': 'flow', 'ranges': {'left_hip': (60, 200)}}
        ],
        'form_checks': [],
        'tracking_type': 'time_based'
    },
    'foam-rolling': {
        'name': 'Foam Rolling',
        'key_angles': [],  # Manual activity
        'stages': [],
        'form_checks': [],
        'tracking_type': 'time_based'
    },
    'deep-breathing': {
        'name': 'Deep Breathing',
        'key_angles': [],  # Breathing exercise
        'stages': [],
        'form_checks': [],
        'tracking_type': 'time_based'
    },
    'light-stretching-circuit': {
        'name': 'Light Stretching Circuit',
        'key_angles': ['left_hip', 'left_knee', 'left_shoulder'],
        'stages': [
            {'name': 'stretch', 'ranges': {'left_hip': (60, 200)}}
        ],
        'form_checks': [],
        'tracking_type': 'time_based'
    },
    'easy-cycling': {
        'name': 'Easy Cycling',
        'key_angles': ['left_knee', 'right_knee'],
        'stages': [
            {'name': 'pedal', 'ranges': {'left_knee': (60, 160)}}
        ],
        'form_checks': [],
        'tracking_type': 'time_based'
    }
}

# Add more exercises as needed, following the pattern in exercises.ts
