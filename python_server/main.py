import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import time
import math

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_draw = mp.solutions.drawing_utils
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1, 
    smooth_landmarks=True,
    enable_segmentation=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def decode_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# --- Utility: Angle Calculation (OpenCV/Numpy style) ---
def calculate_angle(p1, p2, p3):
    """Calculate the angle between three points (p1, p2, p3) where p2 is the vertex."""
    # Convert MediaPipe landmarks to numpy arrays
    a = np.array([p1.x, p1.y])
    b = np.array([p2.x, p2.y]) # Vertex
    c = np.array([p3.x, p3.y])

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

# --- Hand Gesture Helpers ---
def get_distance(p1, p2):
    return ((p1.x - p2.x)**2 + (p1.y - p2.y)**2)**0.5

def get_finger_states(landmarks):
    fingers = []
    wrist = landmarks[mp_hands.HandLandmark.WRIST]
    thumb_tip = landmarks[mp_hands.HandLandmark.THUMB_TIP]
    thumb_ip = landmarks[mp_hands.HandLandmark.THUMB_IP]
    index_mcp = landmarks[mp_hands.HandLandmark.INDEX_FINGER_MCP]
    
    if get_distance(thumb_tip, index_mcp) > get_distance(thumb_ip, index_mcp):
        fingers.append(True)
    else:
        fingers.append(False)
            
    finger_tips = [mp_hands.HandLandmark.INDEX_FINGER_TIP, mp_hands.HandLandmark.MIDDLE_FINGER_TIP, 
                   mp_hands.HandLandmark.RING_FINGER_TIP, mp_hands.HandLandmark.PINKY_TIP]
    finger_pips = [mp_hands.HandLandmark.INDEX_FINGER_PIP, mp_hands.HandLandmark.MIDDLE_FINGER_PIP, 
                   mp_hands.HandLandmark.RING_FINGER_PIP, mp_hands.HandLandmark.PINKY_PIP]
    
    for tip, pip in zip(finger_tips, finger_pips):
        if get_distance(landmarks[tip], wrist) > get_distance(landmarks[pip], wrist):
            fingers.append(True)
        else:
            fingers.append(False)
    return fingers

def get_gesture(landmarks):
    fingers = get_finger_states(landmarks)
    if not any(fingers): return {"name": "Fist", "emoji": "✊", "score": 0.9}
    if all(fingers): return {"name": "Open Palm", "emoji": "🖐️", "score": 0.95}
    if fingers[0] and not any(fingers[1:]): return {"name": "Thumbs Up", "emoji": "👍", "score": 0.9}
    if fingers[1] and fingers[2] and not fingers[3] and not fingers[4]: return {"name": "Victory", "emoji": "✌️", "score": 0.9}
    if fingers[1] and not any(fingers[2:]): return {"name": "Pointing", "emoji": "☝️", "score": 0.9}
    if fingers[1] and fingers[4] and not fingers[2] and not fingers[3]: return {"name": "Rock On", "emoji": "🤘", "score": 0.85}
    if sum(fingers) == 3: return {"name": "Three Fingers", "emoji": "🤟", "score": 0.7}
    return {"name": "Hand Detected", "emoji": "🖐️", "score": 0.6}

# --- Endpoints ---

@app.route('/pose', methods=['POST'])
def detect_pose():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data"}), 400

        img = decode_image(data['image'])
        # --- OpenCV Optimizations ---
        img = cv2.flip(img, 1) # Mirror for front camera
        img = cv2.resize(img, (640, 480)) # Consistent resolution
        
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        results = pose.process(img_rgb)
        
        response_data = {
            "keypoints": [],
            "angles": {},
            "score": 0
        }

        if results.pose_landmarks:
            # 1. Landmarks
            landmarks = results.pose_landmarks.landmark
            keypoints = []
            
            # Complete MediaPipe Pose landmark names (all 33 landmarks)
            mp_names = {
                0: "nose",
                1: "left_eye_inner", 2: "left_eye", 3: "left_eye_outer",
                4: "right_eye_inner", 5: "right_eye", 6: "right_eye_outer",
                7: "left_ear", 8: "right_ear",
                9: "mouth_left", 10: "mouth_right",
                11: "left_shoulder", 12: "right_shoulder",
                13: "left_elbow", 14: "right_elbow",
                15: "left_wrist", 16: "right_wrist",
                17: "left_pinky", 18: "right_pinky",
                19: "left_index", 20: "right_index",
                21: "left_thumb", 22: "right_thumb",
                23: "left_hip", 24: "right_hip",
                25: "left_knee", 26: "right_knee",
                27: "left_ankle", 28: "right_ankle",
                29: "left_heel", 30: "right_heel",
                31: "left_foot_index", 32: "right_foot_index"
            }

            for idx, lm in enumerate(landmarks):
                name = mp_names.get(idx, f"point_{idx}")
                keypoints.append({
                    "x": lm.x, "y": lm.y, "z": lm.z,
                    "score": lm.visibility, "name": name
                })
            
            response_data["keypoints"] = keypoints
            response_data["score"] = 1.0

            # 2. Angle Detections (Calculated using OpenCV/Numpy logic)
            # Left Elbow Angle (Shoulder -> Elbow -> Wrist)
            response_data["angles"]["left_elbow"] = calculate_angle(landmarks[11], landmarks[13], landmarks[15])
            # Right Elbow Angle
            response_data["angles"]["right_elbow"] = calculate_angle(landmarks[12], landmarks[14], landmarks[16])
            # Left Knee Angle (Hip -> Knee -> Ankle)
            response_data["angles"]["left_knee"] = calculate_angle(landmarks[23], landmarks[25], landmarks[27])
            # Right Knee Angle
            response_data["angles"]["right_knee"] = calculate_angle(landmarks[24], landmarks[26], landmarks[28])

            # 3. Optional: DRAW using OpenCV on the server (useful for server-side debugging logs if saved)
            # For now, we just ensure mp_draw is used correctly. 
            # In a local dev environment, you could call cv2.imshow here.

        return jsonify(response_data)

    except Exception as e:
        print(f"Error in pose: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/detect', methods=['POST'])
def detect_gesture():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data"}), 400

        img = decode_image(data['image'])
        # --- OpenCV Optimizations ---
        img = cv2.flip(img, 1)
        img = cv2.resize(img, (640, 480))
        
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        detection_result = {
            "gesture": {"name": "None", "emoji": "❓"},
            "confidence": 0,
            "landmarks": []
        }

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            processed_landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark]
            gesture = get_gesture(hand_landmarks.landmark)
            detection_result = {
                "gesture": {"name": gesture["name"], "emoji": gesture["emoji"]},
                "confidence": gesture["score"],
                "landmarks": processed_landmarks
            }
        return jsonify(detection_result)
    except Exception as e:
        print(f"Error in gesture: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "opencv-enhanced-backend"})

if __name__ == '__main__':
    print("Starting OpenCV Enhanced Vision Backend on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=False)
