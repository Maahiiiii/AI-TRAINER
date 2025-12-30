import { RecoveryMetrics, RecoveryRecommendation, RestDayGuidance } from '../types';

/**
 * Service for calculating recovery scores and providing recovery recommendations
 */
export class RecoveryService {
    /**
     * Calculate overall recovery score (0-100) based on multiple factors
     */
    static calculateRecoveryScore(metrics: Partial<RecoveryMetrics>): number {
        let score = 70; // Base score (neutral recovery)

        // Time since last workout contribution (if available)
        // Note: This would need workout history, simplified for now

        // Sleep quality contribution (30%)
        if (metrics.sleepQuality) {
            const sleepScore = (metrics.sleepQuality / 5) * 30;
            score += sleepScore - 15; // Adjust from base
        }

        // Sleep hours contribution (bonus/penalty)
        if (metrics.sleepHours) {
            if (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) {
                score += 10; // Optimal sleep bonus
            } else if (metrics.sleepHours < 6) {
                score -= 15; // Severe sleep deficit
            } else if (metrics.sleepHours < 7) {
                score -= 5; // Mild sleep deficit
            }
        }

        // Muscle soreness contribution (20%)
        if (metrics.muscleSoreness) {
            const sorenessScore = ((6 - metrics.muscleSoreness.level) / 5) * 20;
            score += sorenessScore - 10; // Adjust from base
        }

        // Energy level contribution (20%)
        if (metrics.energyLevel) {
            const energyScore = (metrics.energyLevel / 5) * 20;
            score += energyScore - 10; // Adjust from base
        }

        // Stress level contribution (15%)
        if (metrics.stressLevel) {
            const stressScore = ((6 - metrics.stressLevel) / 5) * 15;
            score += stressScore - 7.5; // Adjust from base
        }

        // Hydration contribution (10%)
        if (metrics.hydrationLevel) {
            const hydrationScore = (metrics.hydrationLevel / 5) * 10;
            score += hydrationScore - 5; // Adjust from base
        }

        // Nutrition quality contribution (10%)
        if (metrics.nutritionQuality) {
            const nutritionScore = (metrics.nutritionQuality / 5) * 10;
            score += nutritionScore - 5; // Adjust from base
        }

        // Ensure score is within 0-100
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Get recovery recommendation based on recovery score
     */
    static getRecoveryRecommendation(recoveryScore: number, metrics?: Partial<RecoveryMetrics>): RecoveryRecommendation {
        if (recoveryScore >= 85) {
            return {
                type: 'high_intensity',
                confidence: 0.9,
                reasoning: 'Excellent recovery state. Ready for challenging workouts.',
                suggestions: [
                    'Perfect time for personal records or high-intensity training',
                    'Consider progressive overload today',
                    'Your body is well-recovered and ready for peak performance'
                ],
                nutritionTips: [
                    'Pre-workout: Complex carbs + protein 1-2 hours before',
                    'Post-workout: Protein shake within 30 minutes',
                    'Stay hydrated throughout the day'
                ],
                sleepRecommendations: [
                    'Maintain 7-9 hours tonight to sustain recovery',
                    'Consistent sleep schedule supports continued progress'
                ]
            };
        } else if (recoveryScore >= 70) {
            return {
                type: 'normal_workout',
                confidence: 0.85,
                reasoning: 'Good recovery state. Ready for regular training.',
                suggestions: [
                    'Proceed with planned workout as scheduled',
                    'Warm up thoroughly before starting',
                    'Listen to your body during the session'
                ],
                nutritionTips: [
                    'Ensure adequate protein intake (1.6-2.2g/kg bodyweight)',
                    'Stay hydrated: 3-4 liters of water today',
                    'Include anti-inflammatory foods: berries, fatty fish, greens'
                ],
                sleepRecommendations: [
                    'Aim for 7-9 hours of sleep tonight',
                    'Avoid screens 1 hour before bed for better sleep quality'
                ]
            };
        } else if (recoveryScore >= 50) {
            return {
                type: 'light_workout',
                confidence: 0.75,
                reasoning: 'Moderate recovery state. Light training recommended.',
                suggestions: [
                    'Reduce workout intensity by 20-30%',
                    'Decrease weight or reps from usual',
                    'Focus on form and technique',
                    'Consider shorter workout duration (30-40 min)'
                ],
                nutritionTips: [
                    'Increase protein intake for muscle repair',
                    'Consider magnesium-rich foods for muscle recovery',
                    'Hydrate well throughout the day'
                ],
                sleepRecommendations: [
                    'Prioritize 8-9 hours of sleep tonight',
                    'Consider earlier bedtime to catch up on rest'
                ]
            };
        } else if (recoveryScore >= 30) {
            return {
                type: 'active_recovery',
                confidence: 0.8,
                reasoning: 'Low recovery state. Active recovery recommended.',
                suggestions: [
                    'Skip intense training today',
                    'Light walking: 15-20 minutes',
                    'Gentle stretching or yoga',
                    'Foam rolling session',
                    'Focus on mobility work'
                ],
                nutritionTips: [
                    'Increase carbohydrate intake for energy restoration',
                    'Ensure adequate protein for muscle repair',
                    'Consider anti-inflammatory supplements (omega-3)',
                    'Hydrate consistently'
                ],
                sleepRecommendations: [
                    'Critical: Get 8-9 hours of sleep tonight',
                    'Consider a short nap (20-30 min) if possible',
                    'Create optimal sleep environment (dark, cool, quiet)'
                ]
            };
        } else {
            return {
                type: 'complete_rest',
                confidence: 0.9,
                reasoning: 'Poor recovery state. Complete rest required.',
                suggestions: [
                    'Take a complete rest day - no exercise',
                    'Focus entirely on recovery',
                    'Consider ice bath or contrast showers',
                    'Gentle walking only if feeling up to it (10 min max)',
                    'Seek medical advice if severe fatigue persists'
                ],
                nutritionTips: [
                    'Focus on nutrient-dense whole foods',
                    'Increase protein intake significantly',
                    'Consider vitamin C and zinc for immune support',
                    'Avoid alcohol and processed foods',
                    'Hydrate aggressively: 4+ liters today'
                ],
                sleepRecommendations: [
                    'CRITICAL: Prioritize 9-10 hours of sleep',
                    'Go to bed earlier than usual',
                    'Avoid all screens 2 hours before bed',
                    'Consider sleep aids like magnesium or melatonin (consult doctor)'
                ]
            };
        }
    }

    /**
     * Get personalized rest day guidance
     */
    static getRestDayGuidance(userWeight: number = 70): RestDayGuidance {
        const proteinGoal = Math.round(userWeight * 1.8);
        return {
            nutritionFocus: [
                `Protein intake: ${proteinGoal}g today for muscle repair`,
                'Complex carbohydrates: sweet potatoes, quinoa, brown rice',
                'Healthy fats: avocado, nuts, olive oil',
                'Anti-inflammatory foods: berries, fatty fish (salmon), leafy greens',
                'Micronutrients: colorful vegetables for vitamins and minerals'
            ],
            sleepRecommendations: [
                'Target: 7-9 hours of quality sleep',
                'Maintain consistent sleep schedule (same bedtime and wake time)',
                'Avoid screens 1-2 hours before bed',
                'Keep bedroom cool (60-67°F / 15-19°C)',
                'Consider relaxation techniques: meditation, reading, gentle music'
            ],
            recoveryActivities: [
                'Light walking: 15-30 minutes at easy pace',
                'Foam rolling: 10-15 minutes focusing on tight areas',
                'Gentle stretching: Hold each stretch 30-60 seconds',
                'Yoga or mobility work: 20-30 minutes',
                'Contrast showers: Alternate hot (2 min) and cold (30 sec), 3-4 cycles',
                'Massage or self-massage: Use tennis ball or foam roller'
            ],
            mentalRecovery: [
                'Meditation: 10-20 minutes of mindfulness',
                'Deep breathing exercises: 5-10 minutes',
                'Journaling: Reflect on this week\'s progress and goals',
                'Visualization: Mentally rehearse upcoming workouts',
                'Nature time: Spend time outdoors for stress relief',
                'Disconnect: Limit social media and digital stimulation'
            ],
            hydrationGoal: `${Math.round(userWeight * 0.035)} liters (based on bodyweight)`
        };
    }

    /**
     * Determine if user should do active recovery vs complete rest
     */
    static shouldDoActiveRecovery(
        metrics: Partial<RecoveryMetrics>,
        consecutiveWorkoutDays: number,
        lastWorkoutIntensity: 'low' | 'moderate' | 'high'
    ): boolean {
        const recoveryScore = this.calculateRecoveryScore(metrics);

        // Complete rest if recovery score is very low
        if (recoveryScore < 30) return false;

        // Complete rest if severe muscle soreness
        if (metrics.muscleSoreness && metrics.muscleSoreness.level >= 4) return false;

        // Active recovery beneficial after 3+ consecutive workouts
        if (consecutiveWorkoutDays >= 3) return true;

        // Active recovery after high-intensity workout if recovery score is decent
        if (lastWorkoutIntensity === 'high' && recoveryScore >= 40) return true;

        // Active recovery if energy is low but not too low
        if (metrics.energyLevel && metrics.energyLevel >= 2 && metrics.energyLevel <= 3) return true;

        // Default to active recovery for moderate scores
        return recoveryScore >= 40 && recoveryScore < 70;
    }
}

export default RecoveryService;
