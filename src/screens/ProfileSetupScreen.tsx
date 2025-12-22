import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { updateProfile } from '../store/slices/authSlice';
import { UserProfile } from '../types';

interface ProfileSetupScreenProps {
    navigation: any;
}

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);

    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [fitnessGoal, setFitnessGoal] = useState<UserProfile['fitnessGoal']>('weight_loss');

    const handleComplete = async () => {
        if (!age || !weight || !height) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const ageNum = parseInt(age);
        const weightNum = parseFloat(weight);
        const heightNum = parseFloat(height);

        if (ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
            Alert.alert('Error', 'Please enter valid numbers');
            return;
        }

        try {
            await dispatch(
                updateProfile({
                    age: ageNum,
                    weight: weightNum,
                    height: heightNum,
                    fitnessGoal,
                })
            ).unwrap();

            Alert.alert('Success', 'Profile setup complete!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Navigation will be handled by auth state
                    },
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleSkip = () => {
        Alert.alert(
            'Skip Setup',
            'You can complete your profile later in settings',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Skip', onPress: () => { } }, // Navigate to home
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Help us personalize your fitness experience
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your age"
                                placeholderTextColor="#6B6E82"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="number-pad"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your weight"
                                placeholderTextColor="#6B6E82"
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your height"
                                placeholderTextColor="#6B6E82"
                                value={height}
                                onChangeText={setHeight}
                                keyboardType="decimal-pad"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Fitness Goal</Text>
                            <View style={styles.pickerContainer}>
                                <View style={styles.goalButtons}>
                                    {[
                                        { value: 'weight_loss', label: 'Weight Loss' },
                                        { value: 'muscle_gain', label: 'Muscle Gain' },
                                        { value: 'endurance', label: 'Endurance' },
                                        { value: 'flexibility', label: 'Flexibility' },
                                    ].map((goal) => (
                                        <TouchableOpacity
                                            key={goal.value}
                                            style={[
                                                styles.goalButton,
                                                fitnessGoal === goal.value && styles.goalButtonActive,
                                            ]}
                                            onPress={() => setFitnessGoal(goal.value as UserProfile['fitnessGoal'])}
                                            disabled={loading}
                                        >
                                            <Text
                                                style={[
                                                    styles.goalButtonText,
                                                    fitnessGoal === goal.value && styles.goalButtonTextActive,
                                                ]}
                                            >
                                                {goal.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleComplete}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Complete Profile</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkip}
                            disabled={loading}
                        >
                            <Text style={styles.skipButtonText}>Skip for Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#B0B3C1',
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#FFFFFF',
    },
    pickerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 8,
    },
    goalButtons: {
        gap: 8,
    },
    goalButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    goalButtonActive: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    goalButtonText: {
        color: '#B0B3C1',
        fontSize: 14,
        fontWeight: '600',
    },
    goalButtonTextActive: {
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 16,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
    },
});
