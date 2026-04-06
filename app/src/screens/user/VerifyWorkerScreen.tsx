import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerifyWorkerScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { colors, isDark } = useTheme();
    const [worker, setWorker] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkerData();
    }, [id]);

    const fetchWorkerData = async () => {
        try {
            const { data } = await api.get(`/workers/${id}`);
            setWorker(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Could not verify this professional.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (error || !worker) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle" size={80} color="#EF4444" style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Verification Failed</Text>
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>{error || 'Worker not found'}</Text>
                <TouchableOpacity 
                    style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Return to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isVerified = worker.status === 'approved';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Strip */}
                <LinearGradient
                    colors={isVerified ? ['#34D399', '#059669'] : ['#FBBF24', '#D97706']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </LinearGradient>

                <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {/* Profile Avatar */}
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarBorder, { borderColor: colors.card }]}>
                            <Image 
                                source={{ uri: worker.livePhoto ? `${API_URL}/uploads/${worker.livePhoto}` : 'https://via.placeholder.com/150' }}
                                style={styles.avatar}
                            />
                        </View>
                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                            </View>
                        )}
                    </View>

                    <Text style={[styles.nameText, { color: colors.text }]}>
                        {worker.firstName} {worker.lastName}
                    </Text>

                    {isVerified ? (
                        <View style={styles.statusPillVerified}>
                            <Ionicons name="checkmark-circle" size={16} color="#047857" style={{ marginRight: 4 }} />
                            <Text style={styles.statusPillTextVerified}>Verified Professional</Text>
                        </View>
                    ) : (
                        <View style={styles.statusPillPending}>
                            <Ionicons name="alert-circle" size={16} color="#B45309" style={{ marginRight: 4 }} />
                            <Text style={styles.statusPillTextPending}>Status: {worker.status}</Text>
                        </View>
                    )}

                    <View style={styles.detailsContainer}>
                        {/* Services */}
                        <View style={[styles.detailRow, { backgroundColor: colors.background }]}>
                            <Ionicons name="briefcase" size={24} color={colors.primary} style={styles.detailIcon} />
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.text }]}>Services Provided</Text>
                                <View style={styles.tagsContainer}>
                                    {worker.services && worker.services.length > 0 ? (
                                        worker.services.map((service: string, index: number) => (
                                            <View key={index} style={[styles.tag, { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' }]}>
                                                <Text style={[styles.tagText, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>{service}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={{ color: colors.textSecondary }}>No services listed</Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Location */}
                        <View style={[styles.detailRow, { backgroundColor: colors.background }]}>
                            <Ionicons name="location" size={24} color={colors.primary} style={styles.detailIcon} />
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.text }]}>Location</Text>
                                <Text style={{ color: colors.textSecondary }}>
                                    {worker.city || 'Not specified'}, {worker.state || 'Not specified'}
                                </Text>
                            </View>
                        </View>

                        {/* Professional ID */}
                        <View style={[styles.detailRow, { backgroundColor: colors.background }]}>
                            <Ionicons name="person" size={24} color={colors.primary} style={styles.detailIcon} />
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: colors.text }]}>Professional ID</Text>
                                <Text style={{ color: colors.textSecondary, fontFamily: 'monospace' }}>
                                    #{worker._id?.slice(-6).toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <Text style={[styles.footerText, { color: colors.textLight }]}>
                            This is an official digital verification card from RanX24. 
                            Always verify the professional's face with the photo above.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.homeButton, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.homeButtonText}>Home</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        height: 140,
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        marginHorizontal: 20,
        marginTop: -60,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: -60,
        marginBottom: 16,
        position: 'relative'
    },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        overflow: 'hidden',
        backgroundColor: '#FFF'
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    statusPillVerified: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    statusPillTextVerified: {
        color: '#047857',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusPillPending: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    statusPillTextPending: {
        color: '#B45309',
        fontWeight: 'bold',
        fontSize: 14,
    },
    detailsContainer: {
        width: '100%',
        marginTop: 30,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
    },
    detailIcon: {
        marginRight: 16,
        marginTop: 2,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        width: '100%',
    },
    footerText: {
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },
    homeButton: {
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
