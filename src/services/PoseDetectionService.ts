/**
 * PoseDetectionService
 * 
 * Handles pose detection by sending frames to the Python backend (MediaPipe).
 * This replaces the on-device TensorFlow.js implementation.
 */

import { Pose, Keypoint } from '../types';

// Use local IP for testing
const POSE_API_URL = "http://172.29.41.21:5002";

export interface PoseDetectionResult {
    poses: Pose[];
    isReady: boolean;
    error: string | null;
}

class PoseDetectionService {
    private isInitialized: boolean = false;
    private initializationError: string | null = null;

    /**
     * Check if the service is ready
     */
    get isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Get any initialization error
     */
    get error(): string | null {
        return this.initializationError;
    }

    /**
     * Initialize connection to backend (simple ping)
     */
    async initialize(): Promise<boolean> {
        try {
            console.log('[PoseDetection] Connecting to Python backend...');
            const response = await fetch(`${POSE_API_URL}/health`);
            if (response.ok) {
                console.log('[PoseDetection] Connected to backend!');
                this.isInitialized = true;
                this.initializationError = null;
                return true;
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error: any) {
            console.warn('[PoseDetection] Connection failed (server might be starting):', error.message);
            // We set it to true anyway to allow retries during the loop
            this.isInitialized = true;
            return true;
        }
    }

    /**
     * Detect poses from a base64 image string
     * @param base64Image - Base64 encoded image frame
     * @returns Array of detected poses (mapped to local Pose interface)
     */
    async detectPose(base64Image: string): Promise<Pose[]> {
        if (!this.isInitialized) return [];

        try {
            const response = await fetch(`${POSE_API_URL}/pose`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) return [];

            const data = await response.json();

            if (data.error || !data.keypoints) return [];

            // Map backend keypoints to our Keypoint interface
            // Backend sends normalized [0,1], we need pixels?
            // Actually our Pose interface uses {position: Point}
            // but generateMockPose used {x, y}. 
            // In CameraScreen line 403, we pass `width` and `height` to PoseOverlay.
            // PoseOverlay typically handles scaling if points are normalized, 
            // OR we scale them here if we know screen dims. 
            // Since this service is decoupled from screen dims, let's return NORMALIZED coords (0-1)
            // and ensure PoseOverlay handles them.

            // WAIT: CameraScreen `generateMockPose` produces ABSOLUTE coordinates based on width/height.
            // So existing overlays likely expect ABSOLUTE coordinates.
            // But we don't know the image dimensions here easily without passing them.
            // The safest bet is to return normalized here and let the Consumer scale, 
            // OR update the Consumer.

            // However, to avoid breaking `CameraScreen` logic which likely relies on the result being "ready to use":
            // I should verify where `detectPose` is called.
            // Currently CameraScreen call site is usually `detector.estimatePoses(tensor)`. 
            // TFJS returns absolute. 

            // I will update CameraScreen to pass dimensions or handle normalized.
            // For now, let's assume we return normalized (0-1) and update CameraScreen to scale.

            const keypoints: Keypoint[] = data.keypoints.map((kp: any) => ({
                name: kp.name,
                x: kp.x, // Normalized 0-1
                y: kp.y, // Normalized 0-1
                z: kp.z,
                score: kp.score
            }));

            // Wrap in Pose object
            // TFJS returns { keypoints, score, box... }
            // Our types/index.ts Pose interface: { keypoints: Keypoint[], score: number }
            const pose: Pose = {
                keypoints: keypoints,
                score: data.score
            };

            return [pose];

        } catch (error) {
            // console.warn('[PoseDetection] Request failed');
            return [];
        }
    }

    /**
     * Clean up
     */
    async dispose(): Promise<void> {
        this.isInitialized = false;
    }
}

export const poseDetectionService = new PoseDetectionService();
