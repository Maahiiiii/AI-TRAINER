import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Gradients, Spacing, Layout } from '../theme/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PrivacyPolicyScreenProps {
    navigation: any;
}

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
    return (
        <LinearGradient colors={Gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <BlurView intensity={20} tint="dark" style={styles.card}>
                    <Text style={styles.lastUpdated}>Last Updated: December 30, 2025</Text>

                    <Text style={styles.sectionTitle}>1. Introduction</Text>
                    <Text style={styles.text}>
                        Welcome to FIZI ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application (the "App").
                    </Text>

                    <Text style={styles.sectionTitle}>2. Information We Collect</Text>

                    <Text style={styles.subTitle}>2.1 Camera Data (ephemeral)</Text>
                    <Text style={styles.text}>
                        Our App uses your device's camera to analyze your movements during workouts ("Pose Detection").
                        {'\n\n'}
                        • <Text style={styles.bold}>How it works</Text>: Video frames are processed in real-time to detect key body points.
                        {'\n'}
                        • <Text style={styles.bold}>Data Handling</Text>: These video frames are processed ephemerally. We do NOT record, store, or transmit video footage of you to our servers for permanent storage.
                        {'\n'}
                        • <Text style={styles.bold}>Purpose</Text>: To provide real-time form feedback and rep counting.
                    </Text>

                    <Text style={styles.subTitle}>2.2 Microphone Data</Text>
                    <Text style={styles.text}>
                        Our App may use your microphone to enable voice commands.
                        {'\n\n'}
                        • <Text style={styles.bold}>Data Handling</Text>: Audio data is processed locally or ephemerally and is not stored.
                    </Text>

                    <Text style={styles.subTitle}>2.3 User Account Data</Text>
                    <Text style={styles.text}>
                        If you create an account, we collect:
                        {'\n'}
                        • Name
                        {'\n'}
                        • Email address
                        {'\n'}
                        • Fitness goals and physical attributes (e.g., height, weight) to personalize your plan.
                    </Text>

                    <Text style={styles.subTitle}>2.4 Workout Data</Text>
                    <Text style={styles.text}>
                        We store data about your completed workouts, including:
                        {'\n'}
                        • Exercises performed
                        {'\n'}
                        • Repetitions and sets
                        {'\n'}
                        • Dates and times of workouts
                    </Text>

                    <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                    <Text style={styles.text}>
                        We use the collected information to:
                        {'\n'}
                        • Provide personalized workout plans.
                        {'\n'}
                        • Analyze your workout form and provide safety feedback.
                        {'\n'}
                        • Track your fitness progress over time.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Sharing</Text>
                    <Text style={styles.text}>
                        We do not sell your personal data to third parties. We may share data with service providers (like our cloud hosting provider) solely for the purpose of operating the App.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Data Security</Text>
                    <Text style={styles.text}>
                        We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
                    <Text style={styles.text}>
                        Our App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                    </Text>

                    <Text style={styles.sectionTitle}>7. Contact Us</Text>
                    <Text style={styles.text}>
                        If you have any questions about this Privacy Policy, please contact us at: fizi.fitnessgenie@gmail.com
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
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: Spacing.m,
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
