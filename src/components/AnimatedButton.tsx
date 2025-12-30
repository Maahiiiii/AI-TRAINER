/**
 * AnimatedButton
 * 
 * A pressable button with scale animation and pulse effect.
 */

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    ViewStyle,
    TextStyle,
} from 'react-native';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

const VARIANT_COLORS = {
    primary: '#6C63FF',
    secondary: 'rgba(255, 255, 255, 0.1)',
    danger: '#FF4444',
    success: '#00C853',
};

export default function AnimatedButton({
    title,
    onPress,
    style,
    textStyle,
    icon,
    variant = 'primary',
    disabled = false,
    size = 'medium',
}: AnimatedButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const sizeStyles = {
        small: { paddingVertical: 10, paddingHorizontal: 16 },
        medium: { paddingVertical: 16, paddingHorizontal: 24 },
        large: { paddingVertical: 20, paddingHorizontal: 32 },
    };

    const textSizes = {
        small: 14,
        medium: 16,
        large: 18,
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                style={[
                    styles.button,
                    sizeStyles[size],
                    { backgroundColor: VARIANT_COLORS[variant] },
                    disabled && styles.disabled,
                    style,
                ]}
                activeOpacity={0.9}
            >
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text
                    style={[
                        styles.text,
                        { fontSize: textSizes[size] },
                        variant === 'secondary' && styles.secondaryText,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        gap: 8,
    },
    disabled: {
        opacity: 0.5,
    },
    icon: {
        fontSize: 20,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    secondaryText: {
        color: '#B0B3C1',
    },
});
