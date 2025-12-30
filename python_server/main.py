import cv2
import mediapipe as mp
import numpy as np
import base64
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# --- ML Models ---
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=0,  # OPTIMIZED: 0=fastest, 1=balanced, 2=accurate (using fastest for low latency)
    enable_segmentation=False,
    min_detection_confidence=0.35,  # BALANCED: Works from close and long distance
    min_tracking_confidence=0.35    # BALANCED: Smooth tracking even from far
)

# Exercise Modules
from angle_calculator import get_exercise_angles
from rep_counter import rep_counter
from form_validator import validate_form

def decode_image(base64_string):
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

# --- Endpoints ---

@app.before_request
def log_request_info():
    print(f"📡 Incoming {request.method} {request.path} from {request.remote_addr}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "opencv-enhanced-backend"})

@app.route('/detect', methods=['POST'])
def detect():
    print(f"Received request at {time.strftime('%H:%M:%S')}")
    t_start = time.time()
    try:
        data = request.json
        if not data or 'image' not in data:
            print("❌ No image in request")
            return jsonify({"error": "No image data"}), 400

        exercise_id = data.get('exerciseId')
        
        img = decode_image(data['image'])
        if img is None:
            print("❌ Failed to decode image")
            return jsonify({"error": "Invalid image data"}), 400

        h, w = img.shape[:2]
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # # DEBUG: Save image to verify what we are receiving
        # debug_filename = f"debug_frame_{int(time.time())}.jpg"
        # cv2.imwrite(debug_filename, img)
        # print(f"📸 Saved debug frame to {debug_filename} ({w}x{h})")

        results = pose.process(img_rgb)
        
        if not results.pose_landmarks:
             print("⚠️ MediaPipe found NO landmarks in this image.")
        else:
             print(f"✅ MediaPipe found {len(results.pose_landmarks.landmark)} landmarks.")
        detection_result = {
            "landmarks": [],
            "angles": {},
            "confidence": 0,
            "stage": None,
            "rep_count": 0,
            "feedback": [],
            "processed_dims": {"w": w, "h": h}
        }

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            processed_landmarks = []
            
            mp_names = {
                0: "nose", 18: "right_pinky", 19: "left_index", 20: "right_index", 
                15: "left_wrist", 16: "right_wrist", 11: "left_shoulder", 12: "right_shoulder",
                23: "left_hip", 24: "right_hip", 25: "left_knee", 26: "right_knee",
                27: "left_ankle", 28: "right_ankle"
                # Simplified list as reference doesn't define all
            }

            for idx, lm in enumerate(landmarks):
                # Using same key names as reference: x, y, z
                processed_landmarks.append({
                    "x": lm.x, "y": lm.y, "z": lm.z,
                    "score": lm.visibility, 
                    "name": mp_names.get(idx, f"point_{idx}")
                })
            
            detection_result["landmarks"] = processed_landmarks
            detection_result["confidence"] = 0.9

            # 1. Dynamic Angle Calculation
            angles = get_exercise_angles(landmarks, exercise_id)
            detection_result["angles"] = angles

            # 2. Form Validation (Do this before rep counting to use result)
            feedback = validate_form(exercise_id, landmarks, angles)
            detection_result["feedback"] = feedback
            form_is_valid = len(feedback) == 0

            # 3. Stateful Rep Counting (Now form-aware)
            rep_stats = rep_counter.update(exercise_id, angles, form_is_valid)
            detection_result["stage"] = rep_stats['current_stage']
            detection_result["rep_count"] = rep_stats['count']
            detection_result["form_score"] = int(rep_stats.get('score', 0))
            
            # If a rep was just rejected, notify the user via feedback
            if rep_stats.get('rejection_reason'):
                detection_result["feedback"].append(rep_stats['rejection_reason'])
            
            # High-visibility logging with feedback
            status_char = "✅" if form_is_valid else "⚠️"
            stage_info = f"Stage: {rep_stats['current_stage'] or 'detecting'}"
            score_info = f"Score: {detection_result['form_score']}%"
            
            # Log feedback if present
            if feedback:
                feedback_str = " | 🗣️ " + ", ".join(feedback[:2])  # Show first 2 feedback items
            else:
                feedback_str = ""
            
            print(f"{status_char} Reps: {rep_stats['count']} | {stage_info} | {score_info}{feedback_str}")
        else:
            print("⚠️ No pose detected")

        return jsonify(detection_result)


    except Exception as e:
        print(f"Error in pose: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset_exercise():
    data = request.json
    exercise_id = data.get('exerciseId', 'push-ups')
    print(f"🔄 Resetting rep counter for: {exercise_id}")
    rep_counter.reset(exercise_id)
    return jsonify({"status": "reset", "exerciseId": exercise_id})

if __name__ == '__main__':
    print("\n\n" + "="*50)
    print("🚀 PYTHON SERVER STARTED/RESTARTED")
    print("="*50 + "\n")
    print("Starting OpenCV Enhanced Vision Backend on port 5001...")
    # Using 0.0.0.0 to be accessible from mobile device
    # debug=False is important for threading/camera stability
    app.run(host='0.0.0.0', port=5001, debug=False)
