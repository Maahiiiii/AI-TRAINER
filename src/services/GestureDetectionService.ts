import { DetectionResult } from '../types';

// Use the IP address of the machine running the Python backend
// For local testing on emulator, you can use http://10.0.2.2:5001
// For physical devices, use the LAN IP
const VISION_API_URL = "http://172.29.41.21:5002";

export class GestureDetectionService {
    async detectGesture(base64Image: string): Promise<DetectionResult | null> {
        try {
            const response = await fetch(`${VISION_API_URL}/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                console.warn('[GestureService] Failed to connect to vision backend');
                return null;
            }

            const data = await response.json();

            if (data.error) {
                console.error('[GestureService] Backend Error:', data.error);
                return null;
            }

            return {
                gesture: data.gesture,
                confidence: data.confidence,
                landmarks: data.landmarks
            };
        } catch (err) {
            // Silently handle connection errors (might be offline or server down)
            return null;
        }
    }
}

export const gestureDetectionService = new GestureDetectionService();
export default gestureDetectionService;
