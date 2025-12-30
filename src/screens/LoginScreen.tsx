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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signIn, clearError } from '../store/slices/authSlice';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface LoginScreenProps {
    navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    React.useEffect(() => {
        if (error) {
            Alert.alert('Login Error', error);
            dispatch(clearError());
        }
    }, [error]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await dispatch(signIn({ email, password })).unwrap();
        } catch (err) {
            // Error is handled in useEffect
        }
    };

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
                </View>

                <View style={styles.form}>
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
                            placeholder="Enter your password"
                            placeholderTextColor={Colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={Gradients.primary}
                            style={[styles.button, loading && styles.buttonDisabled]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
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
