import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme/Theme';

interface EquipmentBadgeProps {
    location: string;
    equipment?: string[];
}

export default function EquipmentBadge({ location, equipment }: EquipmentBadgeProps) {
    const isHome = location?.toLowerCase().includes('home') || location?.toLowerCase().includes('bodyweight');
    const isGym = location?.toLowerCase() === 'gym';

    const getEquipmentIcons = () => {
        if (!equipment || equipment.length === 0) return [];

        const iconMap: Record<string, string> = {
            dumbbells: 'dumbbell',
            'resistance_bands': 'elastic',
            'pull_up_bar': 'gymnastics',
            kettlebells: 'weight-lifter',
            bench: 'table-chair',
        };

        return equipment.map(eq => iconMap[eq] || 'tools').slice(0, 3);
    };

    const equipmentIcons = getEquipmentIcons();

    return (
        <View style={styles.container}>
            {/* Location Icon & Label */}
            <View style={[styles.badge, isGym ? styles.badgeGym : styles.badgeHome]}>
                <MaterialCommunityIcons
                    name={isGym ? 'office-building' : 'home'}
                    size={16}
                    color={Colors.textPrimary}
                />
                <Text style={styles.locationText}>
                    {isGym ? 'GYM' : 'HOME'}
                </Text>
            </View>

            {/* Equipment Icons */}
            {equipmentIcons.length > 0 && (
                <View style={styles.equipmentRow}>
                    {equipmentIcons.map((icon, index) => (
                        <View key={index} style={styles.equipmentIcon}>
                            <MaterialCommunityIcons
                                name={icon as any}
                                size={14}
                                color={Colors.textSecondary}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: 12,
    },
    badgeHome: {
        backgroundColor: 'rgba(74, 144, 226, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(74, 144, 226, 0.3)',
    },
    badgeGym: {
        backgroundColor: 'rgba(245, 166, 35, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.3)',
    },
    locationText: {
        color: Colors.textPrimary,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    equipmentRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    equipmentIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.glassSurface,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
