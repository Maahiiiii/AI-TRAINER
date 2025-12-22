import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { poseDetectionService } from '../services/PoseDetectionService';
import { Pose } from '../types';

export const useBodyPoseDetection = (isActive: boolean, cameraRef: React.RefObject<any>) => {
    const [poses, setPoses] = useState<Pose[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    const isProcessingRef = useRef(false);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

    const runDetectionLoop = useCallback(async () => {
        if (!isActive || !cameraRef.current || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;
        try {
            // Capture a frame
            // We use the same capture method as gesture detection
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.3,
                base64: true,
                shutterSound: false,
                fastMode: true,
            });

            if (photo && photo.base64) {
                const detectedPoses = await poseDetectionService.detectPose(photo.base64);

                // IMPORTANT: The backend returns normalized coordinates [0,1].
                // But PoseOverlay expects absolute coordinates.
                // We assume the frontend needs to scale them or PoseOverlay needs updates.
                // Let's pass them as is for now, and handle scaling in the Component using this hook
                // OR map them here if we knew dimensions. 
                // We don't know dimensions inside this hook easily.
                setPoses(detectedPoses);
            }
        } catch (err) {
            // console.warn('[useBodyPoseDetection] Capture error:', err);
        } finally {
            isProcessingRef.current = false;
            // Schedule next detection - aiming for ~10-15 FPS if possible
            if (isActive) {
                // 100ms = 10 FPS roughly (network latency excluded)
                loopTimerRef.current = setTimeout(runDetectionLoop, 100);
            }
        }
    }, [isActive, cameraRef]);

    useEffect(() => {
        if (isActive) {
            setIsDetecting(true);
            poseDetectionService.initialize().then(() => {
                runDetectionLoop();
            });
        } else {
            setIsDetecting(false);
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
            setPoses([]);
        }

        return () => {
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        };
    }, [isActive, runDetectionLoop]);

    return {
        poses,
        isDetecting
    };
};
