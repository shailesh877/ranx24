import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { handleApiError, showSuccessToast } from '../../utils/errorHandler';

interface Ticket {
    _id: string;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
}

const SupportScreen = ({ navigation }: any) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/workers/support');
            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            if (loading) handleApiError(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const createTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Required Fields', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/workers/support', {
                subject: subject.trim(),
                message: message.trim(),
            });
            showSuccessToast('Ticket created successfully');
            setModalVisible(false);
            setSubject('');
            setMessage('');
            fetchTickets();
        } catch (error) {
            handleApiError(error, 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return { bg: '#FEF3C7', text: '#F59E0B' };
            case 'in-progress':
                return { bg: '#DBEAFE', text: '#3B82F6' };
            case 'resolved':
                return { bg: '#D1FAE5', text: '#10B981' };
            case 'closed':
                return { bg: '#F1F5F9', text: '#64748B' };
            default:
                return { bg: '#F1F5F9', text: '#64748B' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading support tickets...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="#8B5CF6" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#8B5CF6']}
                    />
                }
            >
                {/* Quick Help */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Help</Text>
                    <View style={styles.quickHelpGrid}>
                        <TouchableOpacity
                            style={styles.quickHelpCard}
                            onPress={() => Linking.openURL('tel:+919876543210')}
                        >
                            <View style={[styles.quickHelpIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="call" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.quickHelpText}>Call Support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickHelpCard}
                            onPress={() => Linking.openURL('https://wa.me/919876543210')}
                        >
                            <View style={[styles.quickHelpIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="logo-whatsapp" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.quickHelpText}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickHelpCard}
                            onPress={() => Linking.openURL('mailto:support@ranx24.com')}
                        >
                            <View style={[styles.quickHelpIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="mail" size={24} color="#EF4444" />
                            </View>
                            <Text style={styles.quickHelpText}>Email Us</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Tickets */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Tickets</Text>

                    {tickets.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="ticket-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyTitle}>No tickets yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Create a ticket if you need help
                            </Text>
                        </View>
                    ) : (
                        tickets.map((ticket) => {
                            const statusColors = getStatusColor(ticket.status);
                            return (
                                <View key={ticket._id} style={styles.ticketCard}>
                                    <View style={styles.ticketHeader}>
                                        <Text style={styles.ticketSubject} numberOfLines={1}>
                                            {ticket.subject}
                                        </Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: statusColors.bg },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: statusColors.text },
                                                ]}
                                            >
                                                {ticket.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.ticketMessage} numberOfLines={2}>
                                        {ticket.message}
                                    </Text>

                                    <View style={styles.ticketFooter}>
                                        <View style={styles.ticketDate}>
                                            <Ionicons name="calendar-outline" size={14} color="#64748B" />
                                            <Text style={styles.ticketDateText}>
                                                {formatDate(ticket.createdAt)}
                                            </Text>
                                        </View>
                                        <Text style={styles.ticketId}>#{ticket._id.slice(-6)}</Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Create Ticket Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Support Ticket</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Subject"
                            placeholderTextColor="#94A3B8"
                            value={subject}
                            onChangeText={setSubject}
                            maxLength={100}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your issue..."
                            placeholderTextColor="#94A3B8"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={6}
                            maxLength={500}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={createTicket}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Submit Ticket</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    quickHelpGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickHelpCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    quickHelpIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickHelpText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        textAlign: 'center',
    },
    ticketCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    ticketSubject: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    ticketMessage: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 12,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ticketDateText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    ticketId: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: '#1E293B',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#CBD5E1',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default SupportScreen;
