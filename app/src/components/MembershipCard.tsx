import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MembershipCardProps {
    userName?: string;
    cardNumber?: string;
    expiryDate?: string;
    planName?: string;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ userName, cardNumber, expiryDate, planName }) => {
    const isGold = planName?.toLowerCase().includes('gold');
    const isSilver = planName?.toLowerCase().includes('silver');

    const colors = isGold 
        ? (['#F59E0B', '#D97706', '#92400E'] as const)
        : isSilver
        ? (['#94A3B8', '#64748B', '#334155'] as const)
        : (['#3B82F6', '#2563EB', '#1E40AF'] as const);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Glossy Overlay Effect */}
                <View style={styles.glossyOverlay} />

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.brandTitle}>RANX24 MEMBERSHIP</Text>
                            <Text style={styles.planTitle}>
                                {isGold ? 'GOLD CLASS' : isSilver ? 'SILVER CLASS' : planName?.toUpperCase() || 'PREMIUM'}
                            </Text>
                        </View>
                        <View style={styles.iconBox}>
                            <Ionicons 
                                name={isGold ? "ribbon" : "shield-checkmark"} 
                                size={28} 
                                color="#FFF" 
                            />
                        </View>
                    </View>

                    {/* Number */}
                    <View style={styles.numberRow}>
                        <Text style={styles.numberLabel}>MEMBERSHIP NUMBER</Text>
                        <Text style={styles.numberText}>
                            {cardNumber?.replace(/(\d{4})(\d{4})(\d{3})/, '$1 $2 $3') || '0000 0000 000'}
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.footerLabel}>CARD HOLDER</Text>
                            <Text style={styles.footerValue}>{userName?.toUpperCase() || 'VALUED CUSTOMER'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.footerLabel}>VALID THRU</Text>
                            <Text style={styles.footerValue}>{expiryDate || 'MM/YYYY'}</Text>
                        </View>
                    </View>
                </View>

                {/* Big decorative icon */}
                <View style={styles.bgIcon}>
                   <Ionicons 
                        name={isGold ? "ribbon" : "shield"} 
                        size={150} 
                        color="rgba(255,255,255,0.08)" 
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        aspectRatio: 1.6,
        overflow: 'hidden',
    },
    glossyOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    brandTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    planTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -1,
        marginTop: 2,
    },
    iconBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    numberRow: {
        marginTop: 8,
    },
    numberLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 4,
    },
    numberText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    footerValue: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    bgIcon: {
        position: 'absolute',
        bottom: -30,
        right: -30,
        zIndex: 1,
    }
});

export default MembershipCard;
