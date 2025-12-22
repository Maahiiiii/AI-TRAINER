/**
 * Premium Design System
 */

export const Colors = {
    // Backgrounds
    backgroundDark: '#0A0E27', // Deep Midnight
    backgroundDarker: '#050714',
    backgroundLight: '#1A1F3D',

    // Primary Brand Gradients
    primaryStart: '#6C63FF',
    primaryEnd: '#4834D4',

    // Accents
    accentCyan: '#00D2D3',
    accentPink: '#FF9FF3',
    accentYellow: '#FECA57',
    accentSuccess: '#00C853',
    accentError: '#FF4444',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',

    // Glassmorphism
    glassSurface: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassHighlight: 'rgba(255, 255, 255, 0.15)',
};

export const Gradients = {
    background: [Colors.backgroundDark, Colors.backgroundDarker] as const,
    primary: [Colors.primaryStart, Colors.primaryEnd] as const,
    gold: ['#FFD700', '#FDB931'] as const,
    purple: ['#a18cd1', '#fbc2eb'] as const,
    ocean: ['#2193b0', '#6dd5ed'] as const,
    fire: ['#f12711', '#f5af19'] as const,
};

export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const Shadows = {
    glow: {
        shadowColor: Colors.primaryStart,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
};

export const Layout = {
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        round: 9999,
    }
};
