import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    Platform,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import api, { API_URL } from '../../services/api';
import { theme } from '../../theme/theme';
import { ImageSkeleton } from '../../components/SkeletonLoader';

const ProfileScreen = ({ navigation }: any) => {
    const { worker, logout, refreshWorker } = useAuth();
    const [imageLoading, setImageLoading] = useState(true);

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newEmail, setNewEmail] = useState(worker?.email || '');
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Initial email set effect
    React.useEffect(() => {
        if (worker?.email) setNewEmail(worker.email);
    }, [worker]);

    // Payout State
    const [isEditingPayout, setIsEditingPayout] = useState(false);
    const [savingPayout, setSavingPayout] = useState(false);
    const [payoutForm, setPayoutForm] = useState({
        bankDetails: {
            bankName: worker?.bankDetails?.bankName || '',
            accountNumber: worker?.bankDetails?.accountNumber || '',
            ifscCode: worker?.bankDetails?.ifscCode || '',
            accountHolderName: worker?.bankDetails?.accountHolderName || ''
        },
        upiId: worker?.upiId || ''
    });

    const updatePayoutForm = (field: string, value: string) => {
        setPayoutForm(prev => ({
            ...prev,
            bankDetails: { ...prev.bankDetails, [field]: value }
        }));
    };

    const handleSavePayout = async () => {
        try {
            if (!worker) return;
            setSavingPayout(true);
            await api.put(`/workers/${worker._id}`, {
                bankDetails: payoutForm.bankDetails,
                upiId: payoutForm.upiId
            });

            Alert.alert('Success', 'Payout details updated successfully');
            setIsEditingPayout(false);
            if (refreshWorker) refreshWorker();
        } catch (error) {
            console.error('Error updating payout details:', error);
            Alert.alert('Error', 'Failed to update details');
        } finally {
            setSavingPayout(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!worker) return;

        try {
            setUpdatingProfile(true);
            await api.put(`/workers/${worker._id}`, { email: newEmail });
            Alert.alert('Success', 'Profile updated successfully');
            setIsEditingProfile(false);
            if (refreshWorker) refreshWorker();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', onPress: logout, style: 'destructive' },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.headerTopRow}>
                        <View style={styles.imageContainer}>
                            {imageLoading && <ImageSkeleton size={100} />}
                            {worker?.livePhoto ? (
                                <Image
                                    source={{ uri: `${API_URL.replace(/\/api\/?$/, '')}/uploads/${worker.livePhoto}` }}
                                    style={[styles.profileImage, imageLoading && { display: 'none' }]}
                                    onLoadEnd={() => setImageLoading(false)}
                                    onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
                                />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={40} color={theme.colors.text.tertiary} />
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={styles.name}>
                                {worker?.firstName} {worker?.lastName}
                            </Text>
                            <Text style={styles.phone}>{worker?.mobileNumber}</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            worker?.status === 'approved' ? theme.colors.success + '20' : theme.colors.warning + '20',
                                        alignSelf: 'flex-start'
                                    },
                                ]}
                            >
                                <View style={[styles.statusDot, { backgroundColor: worker?.status === 'approved' ? theme.colors.success : theme.colors.warning }]} />
                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: worker?.status === 'approved' ? theme.colors.success : theme.colors.warning,
                                        },
                                    ]}
                                >
                                    {worker?.status?.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.miniEditButton} onPress={() => setIsEditingProfile(true)}>
                            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Edit Profile Modal (Inline for simplicity) */}
                {isEditingProfile && (
                    <View style={styles.editModalContainer}>
                        <View style={styles.editModalContent}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                placeholder="Enter specific email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setIsEditingProfile(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleUpdateProfile}
                                    disabled={updatingProfile}
                                >
                                    {updatingProfile ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Performance Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{worker?.averageRating?.toFixed(1) || '0.0'}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{worker?.totalReviews || '0'}</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {worker?.workerType?.toUpperCase() || 'STD'}
                            </Text>
                            <Text style={styles.statLabel}>Tier</Text>
                        </View>
                    </View>
                </View>

                {/* Info Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.card}>
                        <InfoRow icon="mail-outline" label="Email" value={worker?.email || 'N/A'} />
                        <InfoRow icon="location-outline" label="City" value={worker?.city || 'N/A'} />
                        <InfoRow
                            icon="map-outline"
                            label="District"
                            value={worker?.district || 'N/A'}
                        />
                        <InfoRow icon="globe-outline" label="State" value={worker?.state || 'N/A'} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Verification Documents</Text>
                    <View style={styles.card}>
                        <InfoRow
                            icon="card-outline"
                            label="Aadhaar Number"
                            value={worker?.aadhaarNumber || 'N/A'}
                        />
                        {/* Aadhaar Front Image */}
                        <View style={styles.documentRow}>
                            <Text style={styles.documentLabel}>Aadhaar Front</Text>
                            {worker?.aadhaarFront ? (
                                <TouchableOpacity style={styles.documentImageContainer}>
                                    <Image
                                        source={{ uri: `${API_URL.replace('/api', '')}/uploads/${worker.aadhaarFront}` }}
                                        style={styles.documentImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.notUploaded}>Not Uploaded</Text>
                            )}
                        </View>

                        {/* Aadhaar Back Image */}
                        <View style={styles.documentRow}>
                            <Text style={styles.documentLabel}>Aadhaar Back</Text>
                            {worker?.aadhaarBack ? (
                                <TouchableOpacity style={styles.documentImageContainer}>
                                    <Image
                                        source={{ uri: `${API_URL.replace('/api', '')}/uploads/${worker.aadhaarBack}` }}
                                        style={styles.documentImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.notUploaded}>Not Uploaded</Text>
                            )}
                        </View>

                        <InfoRow
                            icon="document-text-outline"
                            label="PAN Number"
                            value={worker?.panNumber || 'Not Provided'}
                        />
                        {/* PAN Card Image */}
                        <View style={[styles.documentRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.documentLabel}>PAN Card</Text>
                            {worker?.panCard ? (
                                <TouchableOpacity style={styles.documentImageContainer}>
                                    <Image
                                        source={{ uri: `${API_URL.replace('/api', '')}/uploads/${worker.panCard}` }}
                                        style={styles.documentImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.notUploaded}>Not Uploaded</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {(worker?.services && worker.services.length > 0) ? "Services Offered" : "Work Categories"}
                    </Text>
                    <View style={styles.card}>
                        {((worker?.services && worker.services.length > 0) ? worker.services : (worker?.categories || [])).length > 0 ? (
                            <View style={styles.servicesGrid}>
                                {((worker?.services && worker.services.length > 0) ? worker.services : (worker?.categories || [])).map((item: any, index: number) => (
                                    <View key={index} style={styles.serviceChip}>
                                        <Ionicons name="briefcase-outline" size={16} color={theme.colors.primary} />
                                        <Text style={styles.serviceText}>{item.name || item}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>No categories added</Text>
                        )}
                    </View>
                </View>

                {/* Payout Details Section */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m }}>
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Payout Details</Text>
                        <TouchableOpacity onPress={() => setIsEditingPayout(!isEditingPayout)}>
                            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                {isEditingPayout ? 'Cancel' : 'Edit'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        {isEditingPayout ? (
                            <View style={{ gap: 12 }}>
                                <View>
                                    <Text style={styles.label}>Bank Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={payoutForm.bankDetails?.bankName}
                                        onChangeText={t => updatePayoutForm('bankName', t)}
                                        placeholder="e.g. HDFC Bank"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.label}>Account Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={payoutForm.bankDetails?.accountNumber}
                                        onChangeText={t => updatePayoutForm('accountNumber', t)}
                                        keyboardType="numeric"
                                        placeholder="Enter Account Number"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.label}>IFSC Code</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={payoutForm.bankDetails?.ifscCode}
                                        onChangeText={t => updatePayoutForm('ifscCode', t)}
                                        autoCapitalize="characters"
                                        placeholder="e.g. HDFC0001234"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.label}>Account Holder Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={payoutForm.bankDetails?.accountHolderName}
                                        onChangeText={t => updatePayoutForm('accountHolderName', t)}
                                        placeholder="Name as per bank records"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.label}>UPI ID</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={payoutForm.upiId}
                                        onChangeText={t => setPayoutForm({ ...payoutForm, upiId: t })}
                                        placeholder="e.g. user@upi"
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.editButton, { marginTop: 8 }]}
                                    onPress={handleSavePayout}
                                    disabled={savingPayout}
                                >
                                    {savingPayout ? <ActivityIndicator color="white" /> : <Text style={styles.editButtonText}>Save Details</Text>}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <InfoRow
                                    icon="business-outline"
                                    label="Bank Name"
                                    value={worker?.bankDetails?.bankName || 'Not Added'}
                                />
                                <InfoRow
                                    icon="card-outline"
                                    label="Account Number"
                                    value={worker?.bankDetails?.accountNumber || 'Not Added'}
                                />
                                <InfoRow
                                    icon="code-slash-outline"
                                    label="IFSC Code"
                                    value={worker?.bankDetails?.ifscCode || 'Not Added'}
                                />
                                <InfoRow
                                    icon="person-outline"
                                    label="Account Holder"
                                    value={worker?.bankDetails?.accountHolderName || 'Not Added'}
                                />
                                <InfoRow
                                    icon="phone-portrait-outline"
                                    label="UPI ID"
                                    value={worker?.upiId || 'Not Added'}
                                />
                            </>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}


                <TouchableOpacity
                    style={styles.supportButton}
                    onPress={() => navigation.navigate('Support')}
                >
                    <Ionicons name="help-circle-outline" size={20} color={theme.colors.info} />
                    <Text style={styles.supportButtonText}>Help & Support</Text>
                </TouchableOpacity>

                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.0.1</Text>
                    <Text style={styles.versionSubtext}>Build {Platform.OS === 'android' ? 'Android' : 'iOS'}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.l,
        paddingVertical: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    logoutButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#FEF2F2',
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.l,
        marginBottom: theme.spacing.s,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    imageContainer: {
        position: 'relative',
        ...theme.shadows.medium,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    miniEditButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    name: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    phone: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.m,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsContainer: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.colors.border,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
        marginLeft: theme.spacing.xs,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: theme.colors.text.primary,
        fontWeight: '600',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.s,
    },
    serviceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    serviceText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.tertiary,
        fontSize: 14,
        paddingVertical: theme.spacing.m,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        marginHorizontal: theme.spacing.m,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.l,
        gap: 8,
        marginBottom: theme.spacing.m,
        ...theme.shadows.primary,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.m,
        paddingVertical: 16,
        borderRadius: theme.borderRadius.l,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.info,
        ...theme.shadows.small,
    },
    supportButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.info,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        paddingTop: theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        marginHorizontal: theme.spacing.m,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    versionSubtext: {
        fontSize: 12,
        color: theme.colors.text.tertiary,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        fontSize: 14,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.m,
    },
    label: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    documentRow: {
        marginBottom: theme.spacing.m,
        paddingBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    documentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 8,
    },
    documentImageContainer: {
        height: 180,
        width: '100%',
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    documentImage: {
        width: '100%',
        height: '100%',
    },
    editModalContainer: {
        marginBottom: theme.spacing.l,
        marginHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.medium,
    },
    editModalContent: {
        gap: 12,
    },
    modalTitle: {
        ...theme.typography.h3,
        marginBottom: 8,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    cancelButtonText: {
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    notUploaded: {
        fontSize: 14,
        color: theme.colors.text.tertiary,
        fontStyle: 'italic',
        paddingVertical: 8,
    },
});

export default ProfileScreen;
