import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { HandLandmark } from '../types';

interface HandOverlayProps {
    landmarks: HandLandmark[];
    width: number;
    height: number;
}

// Hand connection pairs (MediaPipe indices)
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17]                             // Palm base
];

export default function HandOverlay({ landmarks, width, height }: HandOverlayProps) {
    if (!landmarks || landmarks.length === 0) return null;

    return (
        <View style={[styles.container, { width, height }]} pointerEvents="none">
            <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`}>
                {/* Connections */}
                {HAND_CONNECTIONS.map(([i, j], idx) => {
                    const p1 = landmarks[i];
                    const p2 = landmarks[j];
                    if (!p1 || !p2) return null;

                    return (
                        <Line
                            key={`h-line-${idx}`}
                            x1={p1.x * width}
                            y1={p1.y * height}
                            x2={p2.x * width}
                            y2={p2.y * height}
                            stroke="#00EAFF"
                            strokeWidth={2}
                            opacity={0.8}
                        />
                    );
                })}

                {/* Landmarks */}
                {landmarks.map((lm, idx) => (
                    <G key={`h-joint-${idx}`}>
                        <Circle
                            cx={lm.x * width}
                            cy={lm.y * height}
                            r={4}
                            fill="#00EAFF"
                        />
                        <Circle
                            cx={lm.x * width}
                            cy={lm.y * height}
                            r={2}
                            fill="#FFFFFF"
                        />
                    </G>
                ))}
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
