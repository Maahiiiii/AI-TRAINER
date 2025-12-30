
from exercise_configs import EXERCISE_CONFIGS
import time

import json
import os

class RepCounter:
    def __init__(self):
        self.state_file = "reps_state.json"
        self.state = self.load_state() or {
            'count': 0,
            'current_stage': None,
            'previous_stage': None,
            'last_transition_time': 0,
            'exercise_id': None,
            'active_hit': False,
            'total_frames': 0,
            'initialized': False
        }

    def load_state(self):
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r') as f:
                    print("📂 Loaded saved rep state")
                    return json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load state: {e}")
        return None

    def save_state(self):
        try:
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f)
        except Exception as e:
             print(f"⚠️ Failed to save state: {e}")

    def reset(self, exercise_id=None):
        """Explicitly reset rep counter - only called from /reset endpoint"""
        old_count = self.state.get('count', 0)
        old_id = self.state.get('exercise_id')
        print(f"🔄 EXPLICIT RESET: Count {old_count} -> 0 | Exercise: '{old_id}' -> '{exercise_id}'")
        self.state = {
            'count': 0,
            'current_stage': None,
            'active_hit': False, 
            'good_frames': 0, 
            'total_frames': 0, 
            'last_transition_time': 0,
            'exercise_id': exercise_id,
            'rejection_reason': None,
            'initialized': True
        }
        self.save_state()
        print(f"✅ Rep counter reset complete. Starting fresh for '{exercise_id}'")

    def update(self, exercise_id, angles, form_is_valid=True):
        # Handle exercise switching - reset stage tracking but KEEP rep count
        if exercise_id and self.state['exercise_id'] != exercise_id:
            old_count = self.state.get('count', 0)  # Preserve the count
            print(f"🔄 Exercise changed: '{self.state['exercise_id']}' -> '{exercise_id}' | Keeping count: {old_count}")
            
            # Only reset stage tracking, NOT the rep count
            self.state['current_stage'] = None
            self.state['active_hit'] = False
            self.state['last_transition_time'] = 0
            self.state['exercise_id'] = exercise_id
            self.state['initialized'] = True
            # Count is preserved!
            
        elif exercise_id and not self.state.get('initialized'):
            # First detection for this exercise
            self.state['exercise_id'] = exercise_id
            self.state['initialized'] = True
            print(f"🏋️ Initialized tracking for: {exercise_id} | Current count: {self.state.get('count', 0)}")
            
        config = EXERCISE_CONFIGS.get(exercise_id)
        if not config or not angles:
            return self.state

        # DEBUG: Log angles every 60 frames to verify input
        if self.state['total_frames'] % 60 == 0:
             print(f"📐 ANGLES: {angles}")

        stages = config['stages']
        if len(stages) < 2: return self.state # Needs at least 2 stages to count

        rest_stage = stages[0]['name']
        active_stage = stages[1]['name']
        
        best_stage = None
        max_score = -1.0

        # === 1. Permissive Joint Scoring ===
        for stage in stages:
            mandatory_scores = []
            limb_scores = [] # For left/right pairs
            
            for joint, (min_angle, max_angle) in stage['ranges'].items():
                if joint in angles:
                    angle = angles[joint]
                    if min_angle <= angle <= max_angle:
                        score = 100
                    else:
                        center = (min_angle + max_angle) / 2
                        span = (max_angle - min_angle)
                        diff = abs(angle - center) - span/2
                        score = max(0, 100 - (diff * 2))
                    
                    if 'left' in joint or 'right' in joint:
                        limb_scores.append(score)
                    else:
                        mandatory_scores.append(score)
            
            m_avg = sum(mandatory_scores)/len(mandatory_scores) if mandatory_scores else 100
            l_max = max(limb_scores) if limb_scores else 100
            
            final_score = (m_avg + l_max) / 2
            
            if self.state['total_frames'] % 30 == 0:
                 print(f"   ? Check {stage['name']}: {final_score:.1f}%")

            if final_score >= max_score and final_score > 10:  # OPTIMIZED: Very lenient threshold 
                max_score = final_score
                best_stage = stage['name']
        
        # DEBUG LOGGING for stage detection
        if best_stage and best_stage != self.state['current_stage']:
            print(f"👀 Stage Detected: {best_stage.upper()} (Score: {max_score:.1f}%)")
        elif best_stage and self.state['total_frames'] % 30 == 0:
            # Print occasionally to show it's tracking
            print(f"   ... holding {best_stage} ({max_score:.1f}%)")

        current_time = time.time()
        
        if best_stage:
            # Add minimum hold time to prevent false transitions (debounce)
            MIN_STAGE_HOLD_TIME = 0.1  # seconds - OPTIMIZED: faster response
            MIN_FORM_SCORE = 20  # Minimum 20% match - OPTIMIZED: more lenient
            
            stage_changed = best_stage != self.state['current_stage']
            time_since_transition = current_time - self.state.get('last_transition_time', 0)
            
            # Only accept stage changes if enough time has passed OR it's the first detection
            if stage_changed and time_since_transition < MIN_STAGE_HOLD_TIME and self.state['current_stage']:
                # Too quick, ignore this transition (likely noise)
                if self.state['total_frames'] % 30 == 0:
                    print(f"   ⏱️ Debouncing: {best_stage} (waiting {MIN_STAGE_HOLD_TIME - time_since_transition:.1f}s)")
            else:
                # Valid stage detection
                # State Machine for counting: Rest -> Active -> Rest = 1 Rep
                
                # If we are in Active stage (Down)
                if best_stage == active_stage:
                    if not self.state['active_hit']:
                        # Only count if form score is good enough
                        if max_score >= MIN_FORM_SCORE:
                            self.state['active_hit'] = True
                            self.state['last_transition_time'] = current_time
                            print(f"🔹 DOWN (Half Rep) - {exercise_id} (Score: {max_score:.1f}%)")
                        else:
                            print(f"   ⚠️ Form too poor to count (Score: {max_score:.1f}%)")
                
                # If we return to Rest stage (Up) AND we hit active previously
                elif best_stage == rest_stage:
                    if self.state['active_hit']:
                        # Complete the rep
                        self.state['count'] += 1
                        self.state['active_hit'] = False
                        self.state['last_transition_time'] = current_time
                        self.save_state()  # PERSIST STATE
                        print(f"✅ REP #{self.state['count']} COMPLETE (Score: {max_score:.1f}%)")
                
                # Update current stage
                if stage_changed:
                    self.state['current_stage'] = best_stage
                    self.state['last_transition_time'] = current_time
                
                self.state['score'] = max_score
                
                # Debugging
                if self.state['total_frames'] % 30 == 0:
                    print(f"   Status: {best_stage} | Active Hit: {self.state['active_hit']} | Score: {max_score:.1f}%")
        else:
             if self.state['total_frames'] % 30 == 0:
                 print("   (No pose matching config...)")

        self.state['total_frames'] += 1


        return self.state

# Global singleton for simplicity in local dev
rep_counter = RepCounter()
