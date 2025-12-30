import { useState, useCallback, useRef, useEffect } from 'react';
import { CameraView } from 'expo-camera';
import { poseDetectionService } from '../services/PoseDetectionService';
import { Pose } from '../types';
import AppConfig from '../config/appConfig';

interface SmartCameraResult {
    poses: Pose[];
    isDetecting: boolean;
    // Backend Stats
    repCount: number;
    stage: string | null;
    feedback: string[];
    formScore: number;
    resetStats: () => Promise<void>;
}

export const useSmartCamera = (
    isActive: boolean,
    cameraRef: React.RefObject<any>,
    exerciseId: string = 'push-ups'
): SmartCameraResult => {
    // State
    const [poses, setPoses] = useState<Pose[]>([]);
    const [isDetecting, setIsDetecting] = useState(false);

    // Backend Stats State
    const [repCount, setRepCount] = useState(0);
    const [stage, setStage] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string[]>([]);
    const [formScore, setFormScore] = useState(0);

    // Refs for loop control (avoid state updates during capture)
    const isProcessingRef = useRef(false);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
    const missedFramesRef = useRef(0);

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
                quality: 0.5, // Increase quality for better detection
                base64: true,
                shutterSound: false,
                skipProcessing: true, // skip orienting/cropping for speed (server handles rotation if needed)
            });

            if (photo && photo.base64) {
                const base64 = photo.base64;

                // 2. Process Pose & Stats via Backend
                if (AppConfig.features.enablePoseDetection) {
                    const result = await poseDetectionService.detectPose(base64, exerciseId);

                    if (result.poses && result.poses.length > 0) {
                        setPoses(result.poses);
                        setRepCount(result.rep_count);
                        setStage(result.stage);
                        setFeedback(result.feedback);
                        setFormScore(result.form_score);
                        missedFramesRef.current = 0;
                    } else {
                        missedFramesRef.current += 1;
                        if (missedFramesRef.current > 10) {
                            setPoses([]);
                            // Optional: Don't reset stats like reps, but maybe feedback?
                            setStage(null);
                            setFeedback([]);
                        }
                    }
                } else {
                    setPoses([]);
                }
            }
        } catch (err) {
            console.warn('[SmartCamera] Detection error:', err);
            // Don't clear poses on transient errors to prevent blinking
            // Just keep the last known good pose until next successful frame
        } finally {
            isProcessingRef.current = false;
            // Schedule next frame - faster loop for smoother tracking
            if (isActive) {
                loopTimerRef.current = setTimeout(runDetectionLoop, 50); // ~20fps target
            }
        }
    }, [isActive, cameraRef, exerciseId]);

    useEffect(() => {
        if (isActive) {
            setIsDetecting(true);
            // Initialize service
            poseDetectionService.initialize().then(() => {
                runDetectionLoop();
            });
        } else {
            setIsDetecting(false);
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
            setPoses([]);
            setStage(null);
            setFeedback([]);
        }

        return () => {
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
            }
        };
    }, [isActive, runDetectionLoop]);

    const resetStats = useCallback(async () => {
        setRepCount(0);
        setStage(null);
        setFeedback([]);
        setFormScore(0);
        await poseDetectionService.resetStats(exerciseId);
    }, [exerciseId]);

    return {
        poses,
        isDetecting,
        repCount,
        stage,
        feedback,
        formScore,
        resetStats
    };
};
