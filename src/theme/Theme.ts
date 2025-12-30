/**
 * Premium Design System
 */

export const Colors = {
    // Backgrounds
    backgroundDark: '#000000', // Pitch Black
    backgroundDarker: '#050510',
    backgroundLight: '#12122A',

    // Primary Brand Gradients
    primaryStart: '#4F46E5', // Indigo
    primaryEnd: '#7C3AED', // Violet

    // Accents
    accentCyan: '#22D3EE', // Cyan Neone
    accentPink: '#F472B6', // Pink Neon
    accentYellow: '#FACC15',
    accentSuccess: '#4ADE80',
    accentError: '#F87171',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textTertiary: 'rgba(255, 255, 255, 0.45)',

    // Glassmorphism
    glassSurface: 'rgba(255, 255, 255, 0.12)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassHighlight: 'rgba(255, 255, 255, 0.20)',
};

export const Gradients = {
    background: [Colors.backgroundDark, '#0F172A'] as const,
    primary: [Colors.primaryStart, Colors.primaryEnd] as const,
    gold: ['#FDE047', '#EAB308'] as const,
    purple: ['#C084FC', '#7E22CE'] as const,
    ocean: ['#22D3EE', '#0EA5E9'] as const,
    fire: ['#F87171', '#EF4444'] as const,
    darkOverlay: ['transparent', 'rgba(0,0,0,0.8)'] as const,
};

export const Spacing = {
    xs: 6,
    s: 12,
    m: 20,
    l: 32,
    xl: 48,
    xxl: 64,
};

export const Shadows = {
    glow: {
        shadowColor: Colors.primaryStart,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    }
};

export const Layout = {
    borderRadius: {
        s: 12,
        m: 24,
        l: 32,
        xl: 48,
        round: 9999,
    }
};
