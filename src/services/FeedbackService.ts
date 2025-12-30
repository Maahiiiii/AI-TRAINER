/**
 * FeedbackService
 * 
 * Centralized service for managing workout feedback including:
 * - Audio feedback (text-to-speech)
 * - Haptic feedback (vibration)
 * - Feedback throttling to avoid spam
 */

import * as Speech from 'expo-speech';
import { Vibration, Platform } from 'react-native';
import AppConfig from '../config/appConfig';
import { FormValidation } from '../types';

// Vibration patterns (milliseconds)
const VIBRATION_PATTERNS = {
    light: [0, 50],
    medium: [0, 100],
    heavy: [0, 200],
    error: [0, 100, 50, 100],
    success: [0, 50, 25, 50],
};

interface FeedbackQueueItem {
    type: 'audio' | 'haptic';
    message?: string;
    pattern?: keyof typeof VIBRATION_PATTERNS;
    priority: number;
}

class FeedbackService {
    private lastAudioTime: number = 0;
    private lastHapticTime: number = 0;
    private isSpeaking: boolean = false;
    private feedbackQueue: FeedbackQueueItem[] = [];
    private isProcessingQueue: boolean = false;

    // Throttle settings (milliseconds)
    private readonly AUDIO_THROTTLE = 3000; // 3 seconds between audio
    private readonly HAPTIC_THROTTLE = 500;  // 0.5 seconds between haptic

    /**
     * Speak a message using text-to-speech
     */
    async speak(message: string, priority: number = 1): Promise<void> {
        if (!AppConfig.features.enableAudioFeedback) return;
        if (Platform.OS === 'web') {
            console.log('[Feedback] Audio (web):', message);
            return;
        }

        const now = Date.now();
        if (now - this.lastAudioTime < this.AUDIO_THROTTLE) {
            return; // Throttled
        }

        if (this.isSpeaking) {
            // Queue the message
            this.feedbackQueue.push({ type: 'audio', message, priority });
            return;
        }

        this.isSpeaking = true;
        this.lastAudioTime = now;

        try {
            await Speech.speak(message, {
                language: 'en-US',
                pitch: 1.0,
                rate: 1.1, // Slightly faster
                onDone: () => {
                    this.isSpeaking = false;
                    this.processQueue();
                },
                onError: () => {
                    this.isSpeaking = false;
                    this.processQueue();
                },
            });
        } catch (error) {
            console.error('[Feedback] Speech error:', error);
            this.isSpeaking = false;
        }
    }

    /**
     * Trigger haptic/vibration feedback
     */
    vibrate(pattern: keyof typeof VIBRATION_PATTERNS = 'medium'): void {
        if (!AppConfig.features.enableHapticFeedback) return;
        if (Platform.OS === 'web') {
            console.log('[Feedback] Haptic (web):', pattern);
            return;
        }

        const now = Date.now();
        if (now - this.lastHapticTime < this.HAPTIC_THROTTLE) {
            return; // Throttled
        }

        this.lastHapticTime = now;

        try {
            const vibrationPattern = VIBRATION_PATTERNS[pattern];
            Vibration.vibrate(vibrationPattern);
        } catch (error) {
            console.error('[Feedback] Vibration error:', error);
        }
    }

    /**
     * Process form validation and trigger appropriate feedback
     */
    processFormValidation(validation: FormValidation): void {
        if (validation.isValid) {
            // Good form - occasional positive feedback (Reduced from 0.3)
            if (Math.random() < 0.1) {
                this.speak('Keep it up!', 1);
            }
            return;
        }

        // Process errors by severity
        const errors = validation.errors;

        // Find highest severity error
        const criticalError = errors.find(e => e.severity === 'error');
        const warningError = errors.find(e => e.severity === 'warning');

        if (criticalError) {
            // vibration removed as per user request
            this.speak(criticalError.audioCue, 3);
        } else if (warningError) {
            // vibration removed as per user request
            this.speak(warningError.audioCue, 2);
        }
    }

    /**
     * Announce rep completion
     */
    announceRep(repCount: number, formScore: number): void {
        // Announce every 5 reps or milestone
        if (repCount % 5 === 0 && repCount > 0) {
            this.speak(`${repCount} reps completed`, 2);
            // Vibrate only on major milestones
            this.vibrate('success');
        }

        // Form feedback based on score (vibration removed)
    }

    /**
     * Announce workout start
     */
    announceWorkoutStart(exerciseName: string): void {
        this.speak(`Starting ${exerciseName}. Get ready!`, 3);
        this.vibrate('success');
    }

    /**
     * Announce workout completion
     */
    announceWorkoutEnd(totalReps: number, avgFormScore: number): void {
        const formRating = avgFormScore >= 80 ? 'excellent' :
            avgFormScore >= 60 ? 'good' : 'needs improvement';
        this.speak(`Workout complete! ${totalReps} reps with ${formRating} form.`, 3);
        this.vibrate('success');
    }

    /**
     * Process queued feedback
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.feedbackQueue.length === 0) return;

        this.isProcessingQueue = true;

        // Sort by priority (higher first)
        this.feedbackQueue.sort((a, b) => b.priority - a.priority);

        const item = this.feedbackQueue.shift();
        if (item) {
            if (item.type === 'audio' && item.message) {
                await this.speak(item.message, item.priority);
            } else if (item.type === 'haptic' && item.pattern) {
                this.vibrate(item.pattern);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Stop all ongoing feedback
     */
    async stop(): Promise<void> {
        try {
            await Speech.stop();
            Vibration.cancel();
        } catch (error) {
            // Ignore errors on stop
        }
        this.isSpeaking = false;
        this.feedbackQueue = [];
    }

    /**
     * Check if speech is available
     */
    async isSpeechAvailable(): Promise<boolean> {
        if (Platform.OS === 'web') return false;
        try {
            const voices = await Speech.getAvailableVoicesAsync();
            return voices.length > 0;
        } catch {
            return false;
        }
    }
}

// Export singleton
export const feedbackService = new FeedbackService();
