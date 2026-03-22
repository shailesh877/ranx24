import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SPACING, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const SupportChatScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [activeTicket, setActiveTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState(''); // For new ticket
    const [isCreating, setIsCreating] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        fetchActiveTicket();
        const interval = setInterval(() => {
            if (activeTicket) fetchMessages(activeTicket._id);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeTicket?._id]);

    const fetchActiveTicket = async () => {
        try {
            const response = await api.get('/support/my');
            // Find the first open or in-progress ticket
            const currentTicket = response.data.find(t => t.status !== 'resolved');
            if (currentTicket) {
                setActiveTicket(currentTicket);
                setMessages(currentTicket.messages || []);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (ticketId) => {
        try {
            // Re-fetch user tickets to get updated messages
            // Ideally we should have a specific endpoint for ticket details, but /my works
            const response = await api.get('/support/my');
            const ticket = response.data.find(t => t._id === ticketId);
            if (ticket) {
                setMessages(ticket.messages || []);
            }
        } catch (error) {
            console.log('Error fetching messages:', error);
        }
    };

    const createTicket = async () => {
        if (!subject.trim() || !inputText.trim()) {
            Alert.alert('Error', 'Please provide a subject and a message');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/support', {
                subject,
                message: inputText,
                userType: user.role === 'worker' ? 'worker' : 'user'
            });
            setActiveTicket(response.data);
            setMessages(response.data.messages);
            setInputText('');
            setSubject('');
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating ticket:', error);
            Alert.alert('Error', 'Failed to create support ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        if (!activeTicket) {
            // Should be in creation mode
            return;
        }

        const tempMessage = {
            _id: Date.now().toString(),
            message: inputText,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, tempMessage]);
        const msgToSend = inputText;
        setInputText('');

        try {
            await api.post(`/support/${activeTicket._id}/message`, {
                message: msgToSend,
                sender: 'user'
            });
            fetchMessages(activeTicket._id);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.sender === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isMyMessage ? { backgroundColor: colors.primary, borderBottomRightRadius: 4, alignSelf: 'flex-end' } : { backgroundColor: colors.card, borderBottomLeftRadius: 4, alignSelf: 'flex-start' }
            ]}>
                <Text style={[
                    styles.messageText,
                    isMyMessage ? { color: '#FFFFFF' } : { color: colors.text }
                ]}>
                    {item.message}
                </Text>
                <Text style={[
                    styles.timeText,
                    isMyMessage ? { color: 'rgba(255,255,255,0.8)' } : { color: colors.textLight }
                ]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Support Chat</Text>
                    {activeTicket && (
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Ticket #{activeTicket._id.slice(-6)}</Text>
                    )}
                </View>
            </View>

            {!activeTicket ? (
                <View style={styles.createContainer}>
                    <Text style={[styles.createTitle, { color: colors.text }]}>How can we help you?</Text>
                    <TextInput
                        style={[styles.subjectInput, { backgroundColor: colors.card, color: colors.text }]}
                        placeholder="Subject (e.g., Payment Issue)"
                        placeholderTextColor={colors.textLight}
                        value={subject}
                        onChangeText={setSubject}
                    />
                    <TextInput
                        style={[styles.subjectInput, styles.messageInput, { backgroundColor: colors.card, color: colors.text }]}
                        placeholder="Describe your issue..."
                        placeholderTextColor={colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={createTicket}>
                        <Text style={[styles.createButtonText, { color: '#FFFFFF' }]}>Start Chat</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    >
                        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text }]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type a message..."
                                placeholderTextColor={colors.textLight}
                                multiline
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, { backgroundColor: colors.secondary }, !inputText.trim() && { backgroundColor: colors.textLight }]}
                                onPress={handleSend}
                                disabled={!inputText.trim()}
                            >
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        ...SHADOWS.light,
    },
    headerInfo: {
        flex: 1,
        marginLeft: SPACING.m,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    createContainer: {
        padding: SPACING.l,
        flex: 1,
    },
    createTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.l,
    },
    subjectInput: {
        padding: SPACING.m,
        borderRadius: 8,
        marginBottom: SPACING.m,
        fontSize: 16,
        ...SHADOWS.light,
    },
    messageInput: {
        height: 150,
        textAlignVertical: 'top',
    },
    createButton: {
        padding: SPACING.m,
        borderRadius: 8,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    createButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    messageList: {
        padding: SPACING.m,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    messageText: {
        fontSize: 16,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.m,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: SPACING.s,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SupportChatScreen;
