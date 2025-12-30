import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Image,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, Layout } from '../theme/Theme';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchExerciseInstructions } from '../store/slices/exerciseSlice';
import { useEffect, useState } from 'react';

// Static assets removed in favor of imageMap
// import PushUpsImg from '../assets/exercises/push-ups.png';
// import SquatsImg from '../assets/exercises/squats.png';
// import PlankImg from '../assets/exercises/plank.png';
// import BicepCurlsImg from '../assets/exercises/bicep-curls.png';

interface ExerciseInstructionsModalProps {
    visible: boolean;
    exerciseName: string;
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    onStart: () => void;
    onClose: () => void;
}

import { getExerciseImage } from '../config/imageMap';

// Map database URIs to local assets (Deprecated, using imageMap now)
// const ASSET_MAP: Record<string, any> = { ... };

/**
 * Optimized Image Component to handle Local/Remote assets with diagnostics
 */
function InstructionImage({ uri, exerciseId }: { uri: string, exerciseId: string }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const cleanUri = uri.trim().toLowerCase();

    // Use centralized image map
    const foundAsset = getExerciseImage(exerciseId);

    return (
        <View style={styles.imageContainer}>
            {!imageLoaded && !imageError && (
                <View style={styles.imagePlaceholder}>
                    <ActivityIndicator color={Colors.primaryStart} />
                    <Text style={styles.loadingText}>Loading Illustration...</Text>
                </View>
            )}

            {imageError && (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.errorText}>❌ Render Error</Text>
                    <Text style={styles.debugText} numberOfLines={2}>{imageError}</Text>
                </View>
            )}

            {foundAsset ? (
                <Image
                    source={foundAsset}
                    style={styles.guideImage}
                    resizeMode="contain"
                    onLoad={() => {
                        console.log('[DEBUG] Image Loaded Successfuly');
                        setImageLoaded(true);
                    }}
                    onError={(e) => {
                        const err = 'Local Error: ' + (e.nativeEvent as any).error;
                        console.error('[DEBUG]', err);
                        setImageError(err);
                    }}
                />
            ) : (
                <View style={styles.fallbackWrapper}>
                    <Image
                        source={{ uri: uri.trim() || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop' }}
                        style={styles.guideImage}
                        resizeMode="contain"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError('Remote load failed')}
                    />
                    {!uri.trim() && <Text style={styles.fallbackLabel}>Missing Image Data</Text>}
                </View>
            )}

            {__DEV__ && (
                <View style={[styles.debugBadge, { height: 'auto', backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <Text style={styles.debugText}>Match: {foundAsset ? 'YES ✅' : 'NO ❌'}</Text>
                    <Text style={styles.debugText}>State: {imageLoaded ? 'LOADED' : (imageError ? 'ERROR' : 'WAITING')}</Text>
                    <Text style={styles.debugText} numberOfLines={1}>URI: {uri}</Text>
                    <Text style={styles.debugText} numberOfLines={1}>ExerciseId: {exerciseId}</Text>
                </View>
            )}
        </View>
    );
}

export default function ExerciseInstructionsModal({
    visible,
    exerciseName,
    exerciseId,
    targetSets,
    targetReps,
    onStart,
    onClose
}: ExerciseInstructionsModalProps) {
    const dispatch = useAppDispatch();
    const { instructions: instructionsMap, loading, error } = useAppSelector((state) => state.exercise);

    const instructions = instructionsMap[exerciseId];

    useEffect(() => {
        if (visible && exerciseId && !instructions) {
            dispatch(fetchExerciseInstructions(exerciseId));
        }
    }, [visible, exerciseId, instructions, dispatch]);

    const renderContent = () => {
        if (loading && !instructions) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryStart} />
                    <Text style={styles.loadingText}>Loading coaching guide...</Text>
                </View>
            );
        }

        if (!instructions && !loading) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>
                        {error || "We couldn't load the guide for this exercise."}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchExerciseInstructions(exerciseId))}
                    >
                        <Text style={styles.retryButtonText}>Retry Loading</Text>
                    </TouchableOpacity>

                    <View style={styles.fallbackNotice}>
                        <Text style={styles.fallbackText}>
                            Don't worry, you can still start the exercise. Our AI will guide you!
                        </Text>
                    </View>
                </View>
            );
        }

        if (!instructions) return null;

        return (
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Visual Guide */}
                {instructions.imageUri ? (
                    <InstructionImage
                        uri={instructions.imageUri}
                        exerciseId={exerciseId}
                    />
                ) : null}

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.description}>{instructions.description}</Text>
                </View>


                {/* How to Perform */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 How to Perform</Text>
                    {instructions.steps.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </View>

                {/* Form Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💡 Key Form Tips</Text>
                    {instructions.tips.map((tip, index) => (
                        <View key={index} style={styles.tipRow}>
                            <Text style={styles.bulletPoint}>•</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                {/* AI Notice */}
                <View style={styles.aiNotice}>
                    <Text style={styles.aiNoticeIcon}>🤖</Text>
                    <Text style={styles.aiNoticeText}>
                        Our AI will monitor your form in real-time and provide feedback!
                    </Text>
                </View>
            </ScrollView>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
                    <View style={styles.contentContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>{exerciseName}</Text>
                                <Text style={styles.subtitle}>
                                    {targetSets} sets × {targetReps} reps
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {renderContent()}

                        {/* Start Button */}
                        <TouchableOpacity style={styles.startButton} onPress={onStart}>
                            <Text style={styles.startButtonText}>Got it, Start Exercise 🚀</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    blurContainer: {
        width: '90%',
        maxHeight: '85%',
        borderRadius: Layout.borderRadius.l,
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        padding: Spacing.l,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.primaryStart,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: Colors.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    guideImage: {
        width: '100%',
        height: 200,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.l,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    section: {
        marginBottom: Spacing.xl,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: Spacing.m,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: Spacing.m,
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primaryStart,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    tipRow: {
        flexDirection: 'row',
        marginBottom: Spacing.s,
        alignItems: 'flex-start',
    },
    bulletPoint: {
        fontSize: 20,
        color: Colors.accentCyan,
        marginRight: Spacing.m,
        lineHeight: 20,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    aiNotice: {
        flexDirection: 'row',
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    aiNoticeIcon: {
        fontSize: 24,
        marginRight: Spacing.m,
    },
    aiNoticeText: {
        flex: 1,
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    startButton: {
        backgroundColor: Colors.primaryStart,
        borderRadius: Layout.borderRadius.m,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.m,
        color: Colors.textSecondary,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: Spacing.m,
    },
    errorText: {
        color: Colors.textPrimary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: Spacing.l,
    },
    retryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.xl,
    },
    retryButtonText: {
        color: Colors.primaryStart,
        fontWeight: 'bold',
    },
    fallbackNotice: {
        backgroundColor: 'rgba(108, 99, 255, 0.05)',
        padding: Spacing.m,
        borderRadius: Layout.borderRadius.s,
    },
    fallbackText: {
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    debugBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 5,
        borderRadius: 4,
    },
    debugText: {
        color: Colors.accentCyan,
        fontSize: 10,
        fontFamily: 'monospace',
    },
    imageContainer: {
        width: '100%',
        height: 220,
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.l,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 2,
        borderColor: 'rgba(108, 99, 255, 0.3)', // Subtle purple border to see the box
        overflow: 'hidden',
        position: 'relative',
    },
    fallbackWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackLabel: {
        position: 'absolute',
        bottom: 20,
        color: Colors.textSecondary,
        fontSize: 12,
    },
    imagePlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});
