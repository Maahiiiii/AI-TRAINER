
from exercise_configs import EXERCISE_CONFIGS

def validate_form(exercise_id, landmarks, angles):
    """
    COMPLETE form validation for ALL 53 exercises.
    Returns a list of string feedback messages.
    """
    feedback = []
    
    if not landmarks or not angles:
        return feedback
    
    # === BICEP CURLS ===
    if exercise_id == 'bicep-curls':
        left_elbow = landmarks[13]
        left_shoulder = landmarks[11]
        
        if left_elbow.visibility > 0.5 and left_shoulder.visibility > 0.5:
            elbow_drift = abs(left_elbow.x - left_shoulder.x)
            if elbow_drift > 0.28:
                feedback.append("Keep elbows at your sides - don't swing")
        
        left_elbow_angle = angles.get('left_elbow', 180)
        if left_elbow_angle > 100 and left_elbow_angle < 130:
            feedback.append("Curl higher - bring weight to shoulder")
    
    # === PUSH-UPS ===
    elif exercise_id == 'push-ups':
        if (landmarks[11].visibility > 0.6 and
            landmarks[23].visibility > 0.6 and
            landmarks[27].visibility > 0.6):
            
            shoulder = landmarks[11]
            hip = landmarks[23]
            ankle = landmarks[27]
            
            expected_hip_y = (shoulder.y + ankle.y) / 2
            hip_deviation = abs(hip.y - expected_hip_y)
            
            if hip_deviation > 0.18:
                if hip.y > expected_hip_y:
                    feedback.append("Tighten your core - hips are too low")
                else:
                    feedback.append("Lower your hips - maintain straight line")
        
        left_elbow_angle = angles.get('left_elbow', 180)
        if left_elbow_angle > 115 and left_elbow_angle < 135:
            feedback.append("Go lower - bend elbows to 90 degrees")
    
    # === SQUATS ===
    elif exercise_id == 'squats':
        left_knee_angle = angles.get('left_knee', 180)
        right_knee_angle = angles.get('right_knee', 180)
        avg_knee = (left_knee_angle + right_knee_angle) / 2
        
        if 100 < avg_knee < 135:
            feedback.append("Squat deeper - thighs parallel to ground")
        
        if (landmarks[25].visibility > 0.6 and landmarks[26].visibility > 0.6 and
            landmarks[23].visibility > 0.6 and landmarks[24].visibility > 0.6):
            left_knee_x = landmarks[25].x
            right_knee_x = landmarks[26].x
            knee_width = abs(left_knee_x - right_knee_x)
            
            left_hip_x = landmarks[23].x
            right_hip_x = landmarks[24].x
            hip_width = abs(left_hip_x - right_hip_x)
            
            if knee_width < (hip_width * 0.65):
                feedback.append("Push knees out - track over toes")
        
        torso = angles.get('torso_inclination', 0)
        if torso > 50:
            feedback.append("Keep chest up - don't lean forward")
    
    # === PLANK ===
    elif exercise_id == 'plank':
        if (landmarks[11].visibility > 0.6 and landmarks[23].visibility > 0.6 and
            landmarks[27].visibility > 0.6):
            
            shoulder_y = landmarks[11].y
            hip_y = landmarks[23].y
            ankle_y = landmarks[27].y
            
            expected_hip_y = (shoulder_y + ankle_y) / 2
            deviation = abs(hip_y - expected_hip_y)
            
            if deviation > 0.12:
                if hip_y > expected_hip_y:
                    feedback.append("Lift your hips - engage your core")
                else:
                    feedback.append("Lower your hips slightly")
    
    # === SHOULDER PRESS ===
    elif exercise_id in ['shoulder-press', 'db_shoulder_press']:
        torso = angles.get('torso_inclination', 0)
        if torso > 25:
            feedback.append("Keep torso upright - don't arch your back")
    
    # === LUNGES ===
    elif exercise_id == 'lunges':
        inclination = angles.get('torso_inclination', 0)
        if inclination > 35:
            feedback.append("Keep chest up - don't lean forward")

    # === JUMPING JACKS ===
    elif exercise_id == 'jumping-jacks':
        left = angles.get('left_shoulder', 0)
        right = angles.get('right_shoulder', 0)
        if abs(left - right) > 40:
            feedback.append("Move arms symmetrically")
        
    # === DUMBBELL ROWS ===
    elif exercise_id == 'dumbbell-rows':
        inclination = angles.get('torso_inclination', 0)
        if inclination < 35:
            feedback.append("Bend over more - keep back flat")
              
    # === MOUNTAIN CLIMBERS ===
    elif exercise_id == 'mountain-climbers':
        inclination = angles.get('torso_inclination', 90)
        if inclination < 50:
            feedback.append("Keep hips down - maintain plank")

    # === BURPEES ===
    elif exercise_id == 'burpees':
        left_elbow = angles.get('left_elbow', 0)
        if left_elbow > 160: 
            inclination = angles.get('torso_inclination', 0)
            if inclination > 40 and inclination < 70:
                feedback.append("Engage core during plank phase")
    
    # === GLUTE BRIDGES ===
    elif exercise_id == 'glute-bridges':
        left_hip = angles.get('left_hip', 0)
        if left_hip > 160:
            if landmarks[11].visibility > 0.6 and landmarks[23].visibility > 0.6:
                hip_y = landmarks[23].y
                shoulder_y = landmarks[11].y
                if hip_y > shoulder_y + 0.05:
                    feedback.append("Squeeze glutes - lift hips higher")
    
    # === SIDE PLANK ===
    elif exercise_id == 'side-plank':
        if landmarks[23].visibility > 0.6 and landmarks[27].visibility > 0.6:
            hip_y = landmarks[23].y
            ankle_y = landmarks[27].y
            if abs(hip_y - ankle_y) < 0.2:
                feedback.append("Lift hips higher - form straight line")
    
    # === WALL SIT ===
    elif exercise_id == 'wall-sit':
        left_knee = angles.get('left_knee', 180)
        if left_knee < 70 or left_knee > 110:
            feedback.append("Adjust - thighs should be parallel")
    
    # === TRICEP DIPS ===
    elif exercise_id == 'tricep-dips':
        left_elbow = angles.get('left_elbow', 180)
        if left_elbow < 75 and landmarks[13].visibility > 0.6:
            elbow_width = abs(landmarks[13].x - landmarks[14].x) if landmarks[14].visibility > 0.6 else 0
            shoulder_width = abs(landmarks[11].x - landmarks[12].x)
            if elbow_width > shoulder_width * 1.3:
                feedback.append("Keep elbows back - don't flare")
    
    # === BIRD DOG ===
    elif exercise_id == 'bird-dog':
        if landmarks[23].visibility > 0.6 and landmarks[24].visibility > 0.6:
            if abs(landmarks[23].y - landmarks[24].y) > 0.1:
                feedback.append("Keep hips level - don't rotate")
    
    # === REVERSE LUNGES ===
    elif exercise_id == 'reverse-lunges':
        if angles.get('torso_inclination', 0) > 30:
            feedback.append("Keep torso upright")
    
    # === PIKE PUSHUPS ===
    elif exercise_id == 'pike-pushups':
        if angles.get('torso_inclination', 0) < 40:
            feedback.append("Keep hips high - maintain pike")
    
    # === JUMP SQUATS ===
    elif exercise_id == 'jump-squats':
        left_knee = angles.get('left_knee', 180)
        if left_knee < 160 and left_knee > 100:
            feedback.append("Land softly - bend knees")
    
    # === BOX JUMPS ===
    elif exercise_id == 'box-jumps':
        if angles.get('left_knee', 180) > 150:
            feedback.append("Land with bent knees - absorb impact")
    
    # === HIGH KNEES ===
    elif exercise_id == 'high-knees':
        min_knee = min(angles.get('left_knee', 180), angles.get('right_knee', 180))
        if min_knee > 100 and min_knee < 160:
            feedback.append("Drive knees higher - to hip level")
    
    # === BICYCLE CRUNCHES ===
    elif exercise_id == 'bicycle-crunches':
        if landmarks[11].visibility > 0.6 and landmarks[12].visibility > 0.6:
            if abs(landmarks[11].x - landmarks[12].x) < 0.15:
                feedback.append("Twist more - elbow to opposite knee")
    
    # === SUPERMAN ===
    elif exercise_id == 'superman':
        if landmarks[11].visibility > 0.6 and landmarks[23].visibility > 0.6:
            if abs(landmarks[11].y - landmarks[23].y) < 0.1:
                feedback.append("Lift chest and legs higher")
    
    # === FORWARD FOLD ===
    elif exercise_id == 'forward-fold':
        if angles.get('torso_inclination', 0) < 70:
            feedback.append("Fold deeper - chest toward thighs")
    
    # === DOWNWARD DOG ===
    elif exercise_id == 'downward-dog':
        left_hip = angles.get('left_hip', 180)
        if left_hip < 60 or left_hip > 110:
            feedback.append("Adjust hips - form inverted V")
    
    # === QUAD STRETCH ===
    elif exercise_id == 'quad-stretch':
        if angles.get('left_knee', 180) > 80:
            feedback.append("Pull heel closer to glutes")
    
    # === KETTLEBELL SWING ===
    elif exercise_id == 'kb_swing':
        if angles.get('left_hip', 180) > 120 and angles.get('torso_inclination', 0) < 25:
            feedback.append("Hinge at hips - explosive drive")
    
    # === PULL-UPS ===
    elif exercise_id == 'pb_pullup_standard':
        left_elbow = angles.get('left_elbow', 180)
        if left_elbow < 90 and left_elbow > 50:
            feedback.append("Pull higher - chin over bar")
    
    # === BARBELL SQUAT ===
    elif exercise_id == 'bb_squat':
        if angles.get('left_knee', 180) > 110 and angles.get('left_knee', 180) < 140:
            feedback.append("Squat to parallel or below")
        if angles.get('torso_inclination', 0) > 45:
            feedback.append("Keep chest up - upright torso")
    
    # === BULGARIAN SPLIT SQUAT ===
    elif exercise_id == 'bench_bulgarian_split_squat':
        if angles.get('left_knee', 180) < 70:
            feedback.append("Don't let knee go too far forward")
        if angles.get('torso_inclination', 0) > 35:
            feedback.append("Keep torso upright")
    
    # === RESISTANCE BAND ROW ===
    elif exercise_id == 'rb_row':
        if angles.get('left_elbow', 180) > 110:
            feedback.append("Pull back further - squeeze shoulder blades")
    
    # === RESISTANCE BAND CHEST PRESS ===
    elif exercise_id == 'rb_chest_press':
        if angles.get('torso_inclination', 0) > 20:
            feedback.append("Keep chest up and core engaged")
    
    # === CALF RAISES ===
    elif exercise_id == 'calf-raises':
        if landmarks[27].visibility > 0.6 and landmarks[23].visibility > 0.6:
            if abs(landmarks[27].y - landmarks[25].y) < 0.05:
                feedback.append("Rise higher on toes")
    
    # === TUCK JUMPS ===
    elif exercise_id == 'tuck-jumps':
        left_knee = angles.get('left_knee', 180)
        if left_knee > 80 and left_knee < 140:
            feedback.append("Tuck knees higher to chest")
    
    # === PLYO PUSHUPS ===
    elif exercise_id == 'plyo-pushups':
        if landmarks[15].visibility > 0.6 and landmarks[16].visibility > 0.6:
            wrist_y = (landmarks[15].y + landmarks[16].y) / 2
            shoulder_y = (landmarks[11].y + landmarks[12].y) / 2
            if abs(wrist_y - shoulder_y) < 0.05:
                feedback.append("Explode higher - hands off ground")
    
    # === CAT-COW ===
    elif exercise_id == 'cat-cow':
        inclination = angles.get('torso_inclination', 90)
        if inclination < 70 or inclination > 130:
            feedback.append("Move through full range - arch and round")
    
    # === LATERAL BOUNDS ===
    elif exercise_id == 'lateral-bounds':
        left_knee = angles.get('left_knee', 180)
        right_knee = angles.get('right_knee', 180)
        if abs(left_knee - right_knee) < 30:
            feedback.append("Push off harder - land on one leg")
    
    # === BARBELL BENCH PRESS ===
    elif exercise_id == 'bb_bench_press':
        if angles.get('left_elbow', 180) > 100 and angles.get('left_elbow', 180) < 140:
            feedback.append("Lower bar to chest")
        if landmarks[11].visibility > 0.6 and landmarks[12].visibility > 0.6:
            if abs(landmarks[11].y - landmarks[12].y) > 0.08:
                feedback.append("Keep shoulders level")
    
    # === CABLE LAT PULLDOWN ===
    elif exercise_id == 'cable_lat_pulldown':
        if angles.get('left_elbow', 180) > 110:
            feedback.append("Pull down to upper chest")
        if angles.get('torso_inclination', 0) > 25:
            feedback.append("Keep torso upright")
    
    # === CABLE TRICEP PUSHDOWN ===
    elif exercise_id == 'cable_tricep_pushdown':
        if landmarks[13].visibility > 0.6 and landmarks[11].visibility > 0.6:
            elbow_drift = abs(landmarks[13].x - landmarks[11].x)
            if elbow_drift > 0.2:
                feedback.append("Keep elbows at sides")
    
    # === MACHINE LEG PRESS ===
    elif exercise_id == 'machine_leg_press':
        left_knee = angles.get('left_knee', 180)
        if left_knee < 60:
            feedback.append("Don't go too deep - protect back")
        elif left_knee > 110 and left_knee < 150:
            feedback.append("Lower weight further")
    
    # === SMITH MACHINE SQUAT ===
    elif exercise_id == 'smith_squat':
        if angles.get('left_knee', 180) > 110 and angles.get('left_knee', 180) < 140:
            feedback.append("Squat deeper - thighs parallel")
        if angles.get('torso_inclination', 0) > 40:
            feedback.append("Keep chest up")
    
    # === KETTLEBELL SNATCH ===
    elif exercise_id == 'kb_snatch':
        if angles.get('left_elbow', 180) < 160 and angles.get('left_shoulder', 0) > 140:
            feedback.append("Lock out elbow overhead")
        if angles.get('left_hip', 180) > 100 and angles.get('left_hip', 180) < 140:
            feedback.append("Full hip extension")
    
    # === JUMP ROPE ===
    elif exercise_id == 'jump-rope':
        left_knee = angles.get('left_knee', 180)
        if left_knee < 110:
            feedback.append("Jump higher - use ankles")
        if landmarks[15].visibility > 0.6 and landmarks[16].visibility > 0.6:
            wrist_range = abs(landmarks[15].y - landmarks[16].y)
            if wrist_range > 0.15:
                feedback.append("Keep wrists closer together")
    
    # === RUNNING IN PLACE ===
    elif exercise_id == 'running-in-place':
        min_knee = min(angles.get('left_knee', 180), angles.get('right_knee', 180))
        if min_knee > 130:
            feedback.append("Lift knees higher")
        if angles.get('torso_inclination', 0) > 30:
            feedback.append("Keep torso upright")
    
    # === CHILD'S POSE ===
    elif exercise_id == 'childs-pose':
        if angles.get('left_hip', 180) > 80:
            feedback.append("Sit back onto heels")
        if landmarks[11].visibility > 0.6 and landmarks[15].visibility > 0.6:
            if abs(landmarks[11].y - landmarks[15].y) < 0.1:
                feedback.append("Extend arms forward more")
    
    # === SHOULDER STRETCH ===
    elif exercise_id == 'shoulder-stretch':
        shoulder_diff = abs(angles.get('left_shoulder', 0) - angles.get('right_shoulder', 0))
        if shoulder_diff < 60:
            feedback.append("Pull arm across chest")
        if angles.get('torso_inclination', 0) > 25:
            feedback.append("Stand upright")
    
    # === RECOVERY/TIME-BASED EXERCISES (100% COVERAGE) ===
    elif exercise_id in ['walking', 'foam-rolling', 'deep-breathing', 
                         'gentle-yoga-flow', 'light-stretching-circuit', 'easy-cycling']:
        # Basic posture checks for recovery activities
        if angles.get('torso_inclination', 0) > 60:
            feedback.append("Maintain upright posture")
        
        # Specific checks per activity
        if exercise_id == 'walking':
            if landmarks[11].visibility > 0.6 and landmarks[23].visibility > 0.6:
                if abs(landmarks[11].y - landmarks[23].y) < 0.2:
                    feedback.append("Stand tall - extend spine")
        
        elif exercise_id == 'gentle-yoga-flow':
            if angles.get('left_hip', 180) < 40:
                feedback.append("Gentler movement - protect joints")
        
        elif exercise_id == 'easy-cycling':
            left_knee = angles.get('left_knee', 180)
            if left_knee < 50 or left_knee > 170:
                feedback.append("Adjust seat height")
    
    return feedback
