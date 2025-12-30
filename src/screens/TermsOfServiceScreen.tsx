import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Gradients, Spacing, Layout } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TermsOfServiceScreenProps {
    navigation: any;
}

export default function TermsOfServiceScreen({ navigation }: TermsOfServiceScreenProps) {
    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <BlurView intensity={20} tint="dark" style={styles.card}>
                    <Text style={styles.lastUpdated}>Last Updated: December 30, 2025</Text>

                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.text}>
                        By accessing or using the FIZI app, you agree to be bound by these Terms of Service.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Medical Disclaimer</Text>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>Consult a Physician</Text>: FIZI is a fitness application. The workouts and feedback provided are for informational purposes only. You should consult with a physician before starting any new fitness program.
                    </Text>
                    <Text style={[styles.text, { marginTop: 10 }]}>
                        <Text style={styles.bold}>Assumption of Risk</Text>: You understand that physical exercise involves a risk of injury. You agree to use FIZI at your own risk and hold us harmless from any liability for injuries sustained while using the App.
                    </Text>

                    <Text style={styles.sectionTitle}>3. User Accounts</Text>
                    <Text style={styles.text}>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Prohibited Conduct</Text>
                    <Text style={styles.text}>
                        You agree not to:
                        {'\n'}
                        • Use the App for any illegal purpose.
                        {'\n'}
                        • Attempt to reverse engineer the App's code.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Termination</Text>
                    <Text style={styles.text}>
                        We reserve the right to terminate or suspend your access to the App at our sole discretion, without notice, for conduct that we believe violates these Terms.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
                    <Text style={styles.text}>
                        We may modify these Terms at any time. Your continued use of the App constitutes agreement to the revised Terms.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Contact</Text>
                    <Text style={styles.text}>
                        For questions regarding these Terms, contact: fizi.fitnessgenie@gmail.com
                    </Text>
                </BlurView>
                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
        paddingBottom: Spacing.m,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: Colors.glassSurface,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: Spacing.m,
    },
    card: {
        borderRadius: Layout.borderRadius.l,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    lastUpdated: {
        color: Colors.textTertiary,
        fontStyle: 'italic',
        marginBottom: Spacing.m,
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.accentCyan,
        marginTop: Spacing.l,
        marginBottom: Spacing.s,
    },
    text: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
        color: Colors.textPrimary,
    }
});
