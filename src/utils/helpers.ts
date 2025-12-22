import { Point } from '../types';

/**
 * Calculate angle between three points (in degrees)
 * @param a First point
 * @param b Middle point (vertex)
 * @param c Third point
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * (180 / Math.PI));

    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(a: Point, b: Point): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Check if three points are in a line (aligned)
 * @param tolerance Tolerance in degrees (default: 10)
 */
export function arePointsAligned(a: Point, b: Point, c: Point, tolerance: number = 10): boolean {
    const angle = calculateAngle(a, b, c);
    return angle >= (180 - tolerance) || angle <= tolerance;
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate calories burned based on exercise and duration
 * Rough estimates - can be improved with more sophisticated formulas
 */
export function calculateCalories(
    exercise: string,
    duration: number, // in seconds
    weight: number // in kg
): number {
    // MET (Metabolic Equivalent of Task) values for different exercises
    const metValues: { [key: string]: number } = {
        'push-ups': 8.0,
        'squats': 5.5,
        'plank': 4.0,
        'bicep-curls': 3.5,
        'jumping-jacks': 8.0,
        'default': 5.0
    };

    const met = metValues[exercise.toLowerCase()] || metValues['default'];
    const hours = duration / 3600;

    // Calories = MET × weight(kg) × time(hours)
    return Math.round(met * weight * hours);
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null;
    return function (this: any, ...args: Parameters<T>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
