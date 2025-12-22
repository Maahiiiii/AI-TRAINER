import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { gestureDetectionService } from '../services/GestureDetectionService';
import { GestureType, HandLandmark } from '../types';

export const useGestureDetection = (isActive: boolean, cameraRef: React.RefObject<any>) => {
    const [gesture, setGesture] = useState<GestureType | null>(null);
    const [confidence, setConfidence] = useState<number>(0);
    const [landmarks, setLandmarks] = useState<HandLandmark[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    const isProcessingRef = useRef(false);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

    const runDetectionLoop = useCallback(async () => {
        if (!isActive || !cameraRef.current || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;
        try {
            // Capture a frame as a small base64 image
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.2, // Low quality for speed
                base64: true,
                shutterSound: false,
                fastMode: true, // Only if available in expo-camera versions
            });

            if (photo && photo.base64) {
                const result = await gestureDetectionService.detectGesture(photo.base64);
                if (result) {
                    setGesture(result.gesture);
                    setConfidence(result.confidence);
                    setLandmarks(result.landmarks || []);
                }
            }
        } catch (err) {
            // console.warn('[useGestureDetection] Capture error:', err);
        } finally {
            isProcessingRef.current = false;
            // Schedule next detection
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 500); // Poll every 500ms
            }
        }
    }, [isActive, cameraRef]);

    useEffect(() => {
        if (isActive) {
            setIsDetecting(true);
            runDetectionLoop();
        } else {
            setIsDetecting(false);
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
            setGesture(null);
            setConfidence(0);
            setLandmarks([]);
        }

        return () => {
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        };
    }, [isActive, runDetectionLoop]);

    return {
        gesture,
        confidence,
        landmarks,
        isDetecting
    };
};
