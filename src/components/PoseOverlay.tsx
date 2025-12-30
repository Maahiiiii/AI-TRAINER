/**
 * PoseOverlay
 * 
 * SVG-based overlay component that renders detected pose keypoints
 * and skeleton connections on top of the camera feed.
 * Now with color-coding based on form quality.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { Pose, Keypoint } from '../types';

interface PoseOverlayProps {
    poses: Pose[];
    width: number;
    height: number;
    formScore?: number; // 0-100, affects skeleton color
}

// Complete MediaPipe Pose skeleton connection pairs (33 landmarks)
const SKELETON_PAIRS = [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7],     // Nose to left face to left ear
    [0, 4], [4, 5], [5, 6], [6, 8],     // Nose to right face to right ear
    [9, 10],                             // Mouth

    // Upper Body
    [11, 12],                            // Shoulders
    [11, 13], [13, 15],                  // Left arm (shoulder -> elbow -> wrist)
    [12, 14], [14, 16],                  // Right arm (shoulder -> elbow -> wrist)

    // Hands
    [15, 17], [15, 19], [15, 21],        // Left hand (wrist -> pinky, index, thumb)
    [16, 18], [16, 20], [16, 22],        // Right hand (wrist -> pinky, index, thumb)
    [17, 19],                             // Left pinky to index
    [18, 20],                             // Right pinky to index

    // Torso
    [11, 23], [12, 24],                  // Shoulders to hips
    [23, 24],                             // Hip line

    // Legs
    [23, 25], [25, 27],                  // Left leg (hip -> knee -> ankle)
    [24, 26], [26, 28],                  // Right leg (hip -> knee -> ankle)

    // Feet  
    [27, 29], [27, 31], [29, 31],        // Left foot (ankle -> heel -> toe)
    [28, 30], [28, 32], [30, 32],        // Right foot (ankle -> heel -> toe)
];

// Keypoint minimum confidence score
const MIN_SCORE = 0.3;

// Get color based on form score
function getFormColor(score: number = 100): string {
    if (score >= 80) return '#00FF88'; // Green - good form
    if (score >= 60) return '#FFB800'; // Yellow/Orange - needs work
    return '#FF4444';                   // Red - poor form
}

// Get secondary color (for joints)
function getJointColor(score: number = 100): string {
    if (score >= 80) return '#00CC66';
    if (score >= 60) return '#FF9900';
    return '#CC0000';
}

// Body part colors for visual distinction
const BODY_PART_COLORS = {
    face: '#FF6B9D',      // Pink
    arms: '#00D4FF',      // Cyan
    hands: '#B388FF',     // Purple
    torso: '#FFD93D',     // Yellow
    legs: '#6BCB77',      // Green
    feet: '#4ECDC4',      // Teal
};

// Get body part for a connection pair based on landmark indices
function getBodyPartForConnection(i: number, j: number): keyof typeof BODY_PART_COLORS {
    // Face landmarks: 0-10
    if (i <= 10 && j <= 10) return 'face';
    // Arms: shoulders to wrists (11-16)
    if ((i >= 11 && i <= 16) && (j >= 11 && j <= 16)) return 'arms';
    // Hands: wrists to fingers (15-22 connections)
    if ((i >= 15 && i <= 22) || (j >= 15 && j <= 22)) {
        if (i >= 17 || j >= 17) return 'hands';
    }
    // Torso: shoulder-hip connections
    if ((i === 11 || i === 12 || i === 23 || i === 24) &&
        (j === 11 || j === 12 || j === 23 || j === 24)) return 'torso';
    // Legs: hips to ankles (23-28)
    if ((i >= 23 && i <= 28) && (j >= 23 && j <= 28) && !(i >= 29) && !(j >= 29)) return 'legs';
    // Feet: ankles to toes (27-32)
    if (i >= 27 || j >= 27) return 'feet';

    return 'torso'; // Default
}

export default function PoseOverlay({
    poses,
    width,
    height,
    formScore = 100
}: PoseOverlayProps) {
    if (!poses || poses.length === 0) return null;

    const skeletonColor = getFormColor(formScore);
    const jointColor = getJointColor(formScore);

    const renderSkeleton = (pose: Pose, poseIndex: number) => {
        const keypoints = pose.keypoints;
        const validKeypoints = keypoints.filter((k: Keypoint) => (k.score || 0) > MIN_SCORE);

        // Helper to get color for a keypoint based on its index
        const getKeypointColor = (index: number): string => {
            if (index <= 10) return BODY_PART_COLORS.face;
            if (index >= 11 && index <= 14) return BODY_PART_COLORS.arms;
            if (index >= 15 && index <= 22) return BODY_PART_COLORS.hands;
            if (index >= 23 && index <= 24) return BODY_PART_COLORS.torso;
            if (index >= 25 && index <= 28) return BODY_PART_COLORS.legs;
            if (index >= 29) return BODY_PART_COLORS.feet;
            return BODY_PART_COLORS.torso;
        };

        return (
            <G key={poseIndex}>
                {/* Skeleton Lines - with body part coloring */}
                {SKELETON_PAIRS.map(([i, j], lineIndex) => {
                    const kp1 = keypoints[i];
                    const kp2 = keypoints[j];

                    // Only draw if both keypoints are confident
                    if ((kp1?.score || 0) > MIN_SCORE && (kp2?.score || 0) > MIN_SCORE) {
                        const lineColor = BODY_PART_COLORS[getBodyPartForConnection(i, j)];
                        return (
                            <G key={`line-group-${poseIndex}-${lineIndex}`}>
                                {/* Glow effect for line */}
                                <Line
                                    x1={kp1.x}
                                    y1={kp1.y}
                                    x2={kp2.x}
                                    y2={kp2.y}
                                    stroke={lineColor}
                                    strokeWidth={8}
                                    strokeLinecap="round"
                                    opacity={0.3}
                                />
                                {/* Main line */}
                                <Line
                                    x1={kp1.x}
                                    y1={kp1.y}
                                    x2={kp2.x}
                                    y2={kp2.y}
                                    stroke={lineColor}
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                    opacity={0.95}
                                />
                            </G>
                        );
                    }
                    return null;
                })}

                {/* Keypoint Circles - with body part coloring */}
                {validKeypoints.map((kp: Keypoint, kpIndex: number) => {
                    // Find original index to determine color
                    const originalIndex = keypoints.findIndex((k: Keypoint) => k === kp);
                    const pointColor = getKeypointColor(originalIndex);

                    return (
                        <G key={`joint-${poseIndex}-${kpIndex}`}>
                            {/* Outer glow */}
                            <Circle
                                cx={kp.x}
                                cy={kp.y}
                                r={12}
                                fill={pointColor}
                                opacity={0.35}
                            />
                            {/* Middle ring */}
                            <Circle
                                cx={kp.x}
                                cy={kp.y}
                                r={8}
                                fill={pointColor}
                                opacity={0.6}
                            />
                            {/* Inner circle */}
                            <Circle
                                cx={kp.x}
                                cy={kp.y}
                                r={5}
                                fill="#FFFFFF"
                                stroke={pointColor}
                                strokeWidth={2}
                            />
                        </G>
                    );
                })}
            </G>
        );
    };

    return (
        <View style={[styles.container, { width, height }]} pointerEvents="none">
            <Svg
                height="100%"
                width="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {poses.map(renderSkeleton)}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
    },
});
