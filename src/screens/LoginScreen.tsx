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
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { signIn, clearError } from '../store/slices/authSlice';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

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

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '1057242418550-3bohkrf1l81n9uv72ghr46soshm2qn9c.apps.googleusercontent.com',
        // iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: '1057242418550-875sbrq1frmgq9jk451vsoga2eng4g9u.apps.googleusercontent.com',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential)
                .catch((error) => {
                    Alert.alert('Google Sign-In Error', error.message);
                });
        }
    }, [response]);

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
        <View style={styles.container}>
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
                            placeholderTextColor="#6B6E82"
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
                            placeholderTextColor="#6B6E82"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.googleButton, (!request || loading) && styles.buttonDisabled]}
                        onPress={() => {
                            if (request) {
                                promptAsync();
                            } else {
                                Alert.alert('Error', 'Google Sign-In not initialized. Check Client IDs.');
                            }
                        }}
                        disabled={!request || loading}
                    >
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.linkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
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
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    googleButtonText: {
        color: '#0A0E27',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#B0B3C1',
        fontSize: 14,
    },
    linkText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
    },
});
