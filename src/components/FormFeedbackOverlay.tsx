/**
 * FormFeedbackOverlay
 * 
 * Visual overlay component that displays form correction feedback
 * including error messages, correction arrows, and status indicators.
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FormValidation } from '../types';

interface FormFeedbackOverlayProps {
    validation: FormValidation;
    currentStage: string;
    isVisible: boolean;
}

// Severity colors
const SEVERITY_COLORS = {
    error: '#FF4444',
    warning: '#FFB800',
    tip: '#00C853',
};

const SEVERITY_ICONS = {
    error: '⚠️',
    warning: '💡',
    tip: '✓',
};

export default function FormFeedbackOverlay({
    validation,
    currentStage,
    isVisible
}: FormFeedbackOverlayProps) {
    if (!isVisible) return null;

    const { isValid, score, errors } = validation;

    // Get the most important error to display
    const primaryError = errors.find(e => e.severity === 'error') ||
        errors.find(e => e.severity === 'warning') ||
        errors[0];

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Form Score Indicator */}
            <View style={styles.scoreContainer}>
                <View style={[
                    styles.scoreCircle,
                    score >= 80 ? styles.scoreGood :
                        score >= 60 ? styles.scoreWarning : styles.scoreBad
                ]}>
                    <Text style={styles.scoreText}>{score}</Text>
                    <Text style={styles.scoreLabel}>FORM</Text>
                </View>
            </View>

            {/* Stage Indicator */}
            <View style={styles.stageContainer}>
                <View style={[
                    styles.stageBadge,
                    currentStage === 'up' ? styles.stageUp :
                        currentStage === 'down' ? styles.stageDown : styles.stageHold
                ]}>
                    <Text style={styles.stageIcon}>
                        {currentStage === 'up' ? '⬆️' :
                            currentStage === 'down' ? '⬇️' :
                                currentStage === 'hold' ? '⏸️' : '🎯'}
                    </Text>
                    <Text style={styles.stageText}>{currentStage.toUpperCase()}</Text>
                </View>
            </View>

            {/* Error/Feedback Message */}
            {primaryError && !isValid && (
                <View style={styles.feedbackContainer}>
                    <View style={[
                        styles.feedbackBox,
                        { borderColor: SEVERITY_COLORS[primaryError.severity] }
                    ]}>
                        <Text style={styles.feedbackIcon}>
                            {SEVERITY_ICONS[primaryError.severity]}
                        </Text>
                        <View style={styles.feedbackTextContainer}>
                            <Text style={[
                                styles.feedbackMessage,
                                { color: SEVERITY_COLORS[primaryError.severity] }
                            ]}>
                                {primaryError.visualCue}
                            </Text>
                            <Text style={styles.feedbackDetail}>
                                {primaryError.message}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Good Form Indicator */}
            {isValid && score >= 80 && (
                <View style={styles.feedbackContainer}>
                    <View style={[styles.feedbackBox, styles.goodFormBox]}>
                        <Text style={styles.feedbackIcon}>✅</Text>
                        <Text style={styles.goodFormText}>Perfect Form!</Text>
                    </View>
                </View>
            )}

            {/* Visual Correction Arrows (placeholder for pose-based corrections) */}
            {!isValid && primaryError && (
                <View style={styles.correctionContainer}>
                    <CorrectionArrow
                        direction={getCorrectionDirection(primaryError.visualCue)}
                        severity={primaryError.severity}
                    />
                </View>
            )}
        </View>
    );
}

// Helper component for correction arrows
interface CorrectionArrowProps {
    direction: 'up' | 'down' | 'left' | 'right' | 'none';
    severity: 'error' | 'warning' | 'tip';
}

function CorrectionArrow({ direction, severity }: CorrectionArrowProps) {
    if (direction === 'none') return null;

    const arrows: Record<string, string> = {
        up: '⬆️',
        down: '⬇️',
        left: '⬅️',
        right: '➡️',
    };

    return (
        <View style={[
            styles.arrowContainer,
            { backgroundColor: SEVERITY_COLORS[severity] + '40' }
        ]}>
            <Text style={styles.arrowIcon}>{arrows[direction]}</Text>
        </View>
    );
}

// Helper function to determine correction direction from feedback
function getCorrectionDirection(visualCue: string): 'up' | 'down' | 'left' | 'right' | 'none' {
    const cue = visualCue.toLowerCase();
    if (cue.includes('lift') || cue.includes('raise') || cue.includes('higher')) return 'up';
    if (cue.includes('lower') || cue.includes('drop') || cue.includes('down')) return 'down';
    if (cue.includes('left')) return 'left';
    if (cue.includes('right')) return 'right';
    if (cue.includes('tuck') || cue.includes('closer')) return 'down';
    if (cue.includes('straight') || cue.includes('back')) return 'up';
    return 'none';
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },

    // Score Circle (top right)
    scoreContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
    },
    scoreCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    scoreGood: {
        backgroundColor: 'rgba(0, 200, 83, 0.2)',
        borderColor: '#00C853',
    },
    scoreWarning: {
        backgroundColor: 'rgba(255, 184, 0, 0.2)',
        borderColor: '#FFB800',
    },
    scoreBad: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)',
        borderColor: '#FF4444',
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scoreLabel: {
        fontSize: 10,
        color: '#FFFFFF',
        opacity: 0.8,
    },

    // Stage Indicator
    stageContainer: {
        position: 'absolute',
        top: 140,
        right: 20,
    },
    stageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    stageUp: {
        backgroundColor: 'rgba(0, 200, 83, 0.3)',
    },
    stageDown: {
        backgroundColor: 'rgba(255, 184, 0, 0.3)',
    },
    stageHold: {
        backgroundColor: 'rgba(108, 99, 255, 0.3)',
    },
    stageIcon: {
        fontSize: 16,
    },
    stageText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },

    // Feedback Box (bottom center)
    feedbackContainer: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    feedbackBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
        maxWidth: '90%',
    },
    feedbackIcon: {
        fontSize: 24,
    },
    feedbackTextContainer: {
        flex: 1,
    },
    feedbackMessage: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedbackDetail: {
        fontSize: 12,
        color: '#B0B3C1',
        marginTop: 2,
    },
    goodFormBox: {
        borderColor: '#00C853',
    },
    goodFormText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00C853',
    },

    // Correction Arrows
    correctionContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    arrowContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        fontSize: 32,
    },
});
