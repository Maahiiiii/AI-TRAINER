import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { RootState } from '../store';
import { exercises } from '../models/exercises';
import { Colors, Gradients, Spacing, Layout, Shadows } from '../theme/Theme';

interface ExerciseLibraryScreenProps {
    navigation: any;
}

export default function ExerciseLibraryScreen({ navigation }: ExerciseLibraryScreenProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'chest' | 'legs' | 'back' | 'abs' | 'arms'>('all');

    const userLevel = user?.progressSystem?.currentLevel || 1;

    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ex.muscleGroups[0].toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || ex.muscleGroups[0].toLowerCase().includes(selectedCategory);
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.unlockLevel - b.unlockLevel);
    }, [searchQuery, selectedCategory]);

    const categories = [
        { id: 'all', label: 'All', icon: '🔍' },
        { id: 'chest', label: 'Chest', icon: '💪' },
        { id: 'legs', label: 'Legs', icon: '🦵' },
        { id: 'back', label: 'Back', icon: '🧗' },
        { id: 'abs', label: 'Core', icon: '🧱' },
    ];

    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Exercise Library</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <BlurView intensity={20} tint="light" style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </BlurView>
            </View>

            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.id as any)}
                        style={[
                            styles.categoryItem,
                            selectedCategory === cat.id && styles.categoryItemActive
                        ]}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[
                            styles.categoryLabel,
                            selectedCategory === cat.id && styles.categoryLabelActive
                        ]}>{cat.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {filteredExercises.map(ex => {
                        const isUnlocked = ex.unlockLevel <= userLevel;
                        return (
                            <TouchableOpacity
                                key={ex.id}
                                style={[styles.exerciseCard, !isUnlocked && styles.exerciseCardLocked]}
                                disabled={!isUnlocked}
                                onPress={() => navigation.navigate('ExerciseInstructions', { exerciseId: ex.id, fromLibrary: true })}
                            >
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.exerciseEmoji}>{ex.name.includes('Push') ? '💪' : ex.name.includes('Squat') ? '🦵' : '🏋️'}</Text>
                                    {!isUnlocked && (
                                        <BlurView intensity={40} style={styles.lockOverlay}>
                                            <Text style={styles.lockIcon}>🔒</Text>
                                            <Text style={styles.unlockLevel}>Level {ex.unlockLevel}</Text>
                                        </BlurView>
                                    )}
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                                    <Text style={styles.exerciseMuscle}>{ex.muscleGroups[0]}</Text>
                                    <View style={styles.tagRow}>
                                        <View style={[styles.tag, styles.difficultyTag]}>
                                            <Text style={styles.tagText}>{ex.difficulty}</Text>
                                        </View>
                                        <View style={[styles.tag, styles.equipmentTag]}>
                                            <Text style={styles.tagText}>{ex.equipmentRequired}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: Spacing.m,
    },
    backButtonText: {
        color: Colors.primaryStart,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    searchContainer: {
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.m,
    },
    searchBar: {
        borderRadius: Layout.borderRadius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    searchInput: {
        padding: 12,
        color: Colors.textPrimary,
        fontSize: 16,
    },
    categoryScroll: {
        paddingLeft: Spacing.l,
        marginBottom: Spacing.m,
        flexGrow: 0,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryItemActive: {
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        borderColor: Colors.primaryStart,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryLabel: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    categoryLabelActive: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.l,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    exerciseCard: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: Layout.borderRadius.m,
        marginBottom: Spacing.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.card,
    },
    exerciseCardLocked: {
        opacity: 0.8,
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseEmoji: {
        fontSize: 40,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    unlockLevel: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: Colors.primaryStart,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    cardInfo: {
        padding: 12,
    },
    exerciseName: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    exerciseMuscle: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    difficultyTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    equipmentTag: {
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
    },
    tagText: {
        fontSize: 10,
        color: Colors.textTertiary,
        textTransform: 'capitalize',
    },
});
