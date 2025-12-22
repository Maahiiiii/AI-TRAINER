import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { poseDetectionService } from '../services/PoseDetectionService';
import { gestureDetectionService } from '../services/GestureDetectionService';
import { Pose, GestureType, HandLandmark } from '../types';
import AppConfig from '../config/appConfig';

interface SmartCameraResult {
    poses: Pose[];
    gesture: GestureType | null;
    gestureConfidence: number;
    handLandmarks: HandLandmark[];
    isDetecting: boolean;
}

export const useSmartCamera = (
    isActive: boolean,
    cameraRef: React.RefObject<any>
): SmartCameraResult => {
    // State
    const [poses, setPoses] = useState<Pose[]>([]);
    const [gesture, setGesture] = useState<GestureType | null>(null);
    const [gestureConfidence, setGestureConfidence] = useState<number>(0);
    const [handLandmarks, setHandLandmarks] = useState<HandLandmark[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    // Refs for loop control (avoid state updates during capture)
    const isProcessingRef = useRef(false);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

    const runDetectionLoop = useCallback(async () => {
        // If conditions not met, reschedule and try again later
        if (!isActive || !cameraRef.current || isProcessingRef.current) {
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 500);
            }
            return;
        }

        isProcessingRef.current = true;
        try {
            // 1. Capture Frame (Single source of truth)
            // Use low quality for speed, just like Gesture-Sense
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.3,
                base64: true,
                shutterSound: false,
            });

            if (photo && photo.base64) {
                const base64 = photo.base64;

                // 2. Parallel Processing
                // Send frame to both backends simultaneously
                const posePromise = AppConfig.features.enablePoseDetection
                    ? poseDetectionService.detectPose(base64)
                    : Promise.resolve([]);

                const gesturePromise = AppConfig.features.enablePoseDetection // Recycle this flag or add a new one? Use gesture flag if exists, implied true for now.
                    ? gestureDetectionService.detectGesture(base64)
                    : Promise.resolve(null);

                const [detectedPoses, gestureResult] = await Promise.all([posePromise, gesturePromise]);

                // 3. Update State
                if (detectedPoses) {
                    setPoses(detectedPoses);
                }

                if (gestureResult) {
                    setGesture(gestureResult.gesture);
                    setGestureConfidence(gestureResult.confidence);
                    setHandLandmarks(gestureResult.landmarks || []);
                } else {
                    setGesture(null);
                    setGestureConfidence(0);
                    setHandLandmarks([]);
                }
            }
        } catch (err) {
            // console.warn('[SmartCamera] Loop Error:', err);
        } finally {
            isProcessingRef.current = false;
            // Schedule next frame
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 100); // Aim for ~10fps
            }
        }
    }, [isActive, cameraRef]);

    useEffect(() => {
        if (isActive) {
            setIsDetecting(true);
            // Initialize both services
            Promise.all([
                poseDetectionService.initialize(),
                // gesture service needs no init or reuse logic
            ]).then(() => {
                runDetectionLoop();
            });
        } else {
            setIsDetecting(false);
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
            setPoses([]);
            setGesture(null);
        }

        return () => {
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        };
    }, [isActive, runDetectionLoop]);

    return {
        poses,
        gesture,
        gestureConfidence,
        handLandmarks,
        isDetecting
    };
};
