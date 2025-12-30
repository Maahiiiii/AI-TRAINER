/**
 * OnboardingScreen
 * 
 * Welcome screen for new users with app introduction slides.
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Spacing, Layout } from '../theme/Theme';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
    {
        id: '1',
        icon: '👁️',
        title: 'AI Vision Coach',
        description: 'Real-time form correction and automatic rep counting using your camera.',
        color: '#6C63FF',
    },
    {
        id: '2',
        icon: '📅',
        title: 'Smart Plans',
        description: 'Custom weekly schedules that adapt to your recovery and goals.',
        color: '#00C853',
    },
    {
        id: '3',
        icon: '🧬',
        title: 'Evolve Your Avatar',
        description: 'Your digital self physically transforms as you gain strength and XP.',
        color: '#FFB800',
    },
    {
        id: '4',
        icon: '🚀',
        title: 'Ready to Start?',
        description: 'Begin your journey with FIZI and unlock your potential.',
        color: '#FF6B6B',
    },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const renderSlide = ({ item, index }: { item: typeof ONBOARDING_SLIDES[0]; index: number }) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1, 0.8],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
        });

        return (
            <View style={[styles.slide, { width }]}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: item.color + '20', // Glassy background
                            borderColor: item.color + '40',
                            transform: [{ scale }],
                            opacity,
                        }
                    ]}
                >
                    <Text style={styles.icon}>{item.icon}</Text>
                </Animated.View>
                <Animated.Text style={[styles.title, { opacity }]}>
                    {item.title}
                </Animated.Text>
                <Animated.Text style={[styles.description, { opacity }]}>
                    {item.description}
                </Animated.Text>
            </View>
        );
    };

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {ONBOARDING_SLIDES.map((_, index) => {
                    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });

                    const dotOpacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    opacity: dotOpacity,
                                    backgroundColor: ONBOARDING_SLIDES[currentIndex].color,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            {/* Skip Button */}
            {!isLastSlide && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <Animated.FlatList
                ref={flatListRef}
                data={ONBOARDING_SLIDES}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                scrollEventThrottle={16}
            />

            {/* Dots */}
            {renderDots()}

            {/* Next/Get Started Button */}
            <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[ONBOARDING_SLIDES[currentIndex].color, ONBOARDING_SLIDES[currentIndex].color + 'AA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.nextButton}
                >
                    <Text style={styles.nextButtonText}>
                        {isLastSlide ? 'Get Started' : 'Next'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        borderWidth: 1,
    },
    icon: {
        fontSize: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.m,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: Spacing.l,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    nextButton: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xxl,
        paddingVertical: 18,
        borderRadius: Layout.borderRadius.l,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    nextButtonText: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
