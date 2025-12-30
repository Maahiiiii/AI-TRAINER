/**
 * ExerciseSelector
 * 
 * Modal component for selecting an exercise before starting a workout.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView
} from 'react-native';
import { exercises } from '../models/exercises';

interface ExerciseSelectorProps {
    visible: boolean;
    selectedExerciseId: string;
    onSelect: (exerciseId: string) => void;
    onClose: () => void;
}

// Exercise icons and colors
const EXERCISE_DATA: Record<string, { icon: string; color: string }> = {
    'push-ups': { icon: '💪', color: '#FF6B6B' },
    'squats': { icon: '🦵', color: '#4ECDC4' },
    'plank': { icon: '🧘', color: '#45B7D1' },
    'bicep-curls': { icon: '🏋️', color: '#96CEB4' },
};

export default function ExerciseSelector({
    visible,
    selectedExerciseId,
    onSelect,
    onClose
}: ExerciseSelectorProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Choose Exercise</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {exercises.map((exercise, index) => {
                            const data = EXERCISE_DATA[exercise.id] || { icon: '🎯', color: '#6C63FF' };
                            const isSelected = exercise.id === selectedExerciseId;

                            return (
                                <TouchableOpacity
                                    key={`selector-${exercise.id}-${index}`}
                                    style={[
                                        styles.exerciseCard,
                                        isSelected && styles.selectedCard,
                                        { borderLeftColor: data.color }
                                    ]}
                                    onPress={() => onSelect(exercise.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: data.color + '20' }]}>
                                        <Text style={styles.icon}>{data.icon}</Text>
                                    </View>

                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text style={styles.muscleGroups}>
                                            {exercise.muscleGroups.slice(0, 3).join(' • ')}
                                        </Text>
                                    </View>

                                    {isSelected && (
                                        <View style={styles.checkmark}>
                                            <Text style={styles.checkmarkIcon}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={onClose}
                    >
                        <Text style={styles.startButtonText}>Ready to Start</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#0A0E27',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    list: {
        paddingHorizontal: 24,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    selectedCard: {
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        borderColor: '#6C63FF',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
    },
    exerciseInfo: {
        flex: 1,
        marginLeft: 16,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    muscleGroups: {
        fontSize: 13,
        color: '#B0B3C1',
        marginTop: 4,
    },
    checkmark: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    startButton: {
        backgroundColor: '#6C63FF',
        marginHorizontal: 24,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
