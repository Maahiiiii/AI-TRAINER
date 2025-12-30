import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signUp, clearError } from '../store/slices/authSlice';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface SignupScreenProps {
    navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    React.useEffect(() => {
        if (error) {
            Alert.alert('Signup Error', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            await dispatch(signUp({ email, password, displayName: name })).unwrap();
            // Navigation to profile setup will be handled automatically
        } catch (err: any) {
            // Show detailed error for debugging
            const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
            Alert.alert('Signup Error - Details', errorMessage);
            console.error('Signup error details:', err);
        }
    };

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start your fitness transformation today</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={name}
                                    onChangeText={setName}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={true}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={Colors.textTertiary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={true}
                                    editable={!loading}
                                />
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSignup}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={Gradients.primary}
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Create Account</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.linkText}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
        paddingVertical: 48,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
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
        color: Colors.textPrimary,
    },
    input: {
        backgroundColor: Colors.glassSurface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    button: {
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: 12,
        ...Shadows.glow,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.l,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    linkText: {
        color: Colors.primaryStart,
        fontSize: 14,
        fontWeight: '600',
    },
});
