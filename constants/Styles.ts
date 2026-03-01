import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
    primary: "#070B14",
    accent: "#F5C451",
    accentLight: "#FFD88D",
    accentSecondary: "#67D6FF",
    background: "#0B1322",
    card: "rgba(17, 28, 46, 0.78)",
    togglecard: "rgba(44, 49, 58, 0.78)",
    cardLight: "rgba(28, 41, 66, 0.92)",
    border: "rgba(255, 255, 255, 0.08)",
    text: "#F6F8FF",
    textGray: "#C2CCDE",
    textMuted: "#8A97B4",
    error: "#FF6F61",
    success: "#57CC99",
    gradientStart: "#070B14",
    gradientMid: "#111C2E",
    gradientEnd: "#1A2B47",
};

export const TYPOGRAPHY = {
    title: "SpaceMono",
};

export const COMMON_STYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    flexCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: TYPOGRAPHY.title,
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textGray,
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    }
});
