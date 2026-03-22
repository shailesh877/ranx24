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
    Image,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { SPACING, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const ChatScreen = ({ navigation, route }) => {
    const { colors, isDark } = useTheme();
    const { bookingId, workerName, workerId } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [chatId, setChatId] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        initializeChat();
        socketService.connect();

        return () => {
            if (chatId) {
                socketService.leaveChat(chatId);
            }
            socketService.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (chatId) {
            socketService.joinChat(chatId);

            // Listen for new messages
            socketService.onNewMessage((data) => {
                console.log('📩 New message received:', data);
                if (data.chatId === chatId) {
                    setMessages(prev => {
                        // Check if message already exists
                        const exists = prev.some(m => m._id === data.message._id);
                        if (exists) return prev;
                        return [...prev, data.message];
                    });

                    // Mark as read if not my message
                    if (data.message.sender !== user._id && data.message.sender.toString() !== user._id.toString()) {
                        markAsRead();
                    }
                }
            });

            // Listen for typing
            socketService.onTyping((data) => {
                if (data.chatId === chatId && data.isTyping) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                }
            });

            // Listen for message read
            socketService.socket?.on('messages_read', (data) => {
                if (data.chatId === chatId) {
                    setMessages(prev => prev.map(msg => ({
                        ...msg,
                        read: msg.sender === user._id || msg.sender.toString() === user._id.toString() ? true : msg.read
                    })));
                }
            });
        }
    }, [chatId]);

    const initializeChat = async () => {
        try {
            const response = await api.post(`/chat/booking/${bookingId}`);
            setChatId(response.data._id);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        if (!chatId) return;
        try {
            await api.patch(`/chat/${chatId}/read`);
        } catch (error) {
            console.log('Error marking as read:', error);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant permission to access your photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', {
            uri,
            name: 'image.jpg',
            type: 'image/jpeg',
        } as any);

        try {
            const response = await api.post('/chat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            handleSend(null, 'image', response.data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSend = async (text = null, type = 'text', mediaUrl = '') => {
        const messageContent = text || inputText;
        if ((!messageContent.trim() && type === 'text') || !chatId) return;

        const tempMessage = {
            _id: Date.now().toString(),
            message: type === 'image' ? '📷 Image' : messageContent,
            sender: user._id,
            timestamp: new Date().toISOString(),
            delivered: false,
            read: false,
            pending: true,
            type,
            mediaUrl
        };

        setMessages(prev => [...prev, tempMessage]);
        if (type === 'text') setInputText('');

        try {
            const payload = {
                message: type === 'image' ? '📷 Image' : messageContent,
                type,
                mediaUrl
            };

            const response = await api.post(`/chat/${chatId}/message`, payload);

            // Update temp message with real data
            setMessages(prev => prev.map(msg =>
                msg._id === tempMessage._id
                    ? response.data.messages[response.data.messages.length - 1]
                    : msg
            ));
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (text) => {
        setInputText(text);

        if (chatId && text.length > 0) {
            socketService.sendTyping(chatId, true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketService.sendTyping(chatId, false);
            }, 2000);
        }
    };

    const renderMessageStatus = (item) => {
        const isMyMessage = item.sender === user._id || item.sender?.toString() === user._id?.toString();
        if (!isMyMessage) return null;

        if (item.pending) {
            return <Ionicons name="time-outline" size={12} color="rgba(0,0,0,0.4)" />;
        } else if (item.read) {
            return <Ionicons name="checkmark-done" size={14} color="#10B981" />;
        } else if (item.delivered) {
            return <Ionicons name="checkmark-done" size={14} color="rgba(0,0,0,0.4)" />;
        }
        return <Ionicons name="checkmark" size={14} color="rgba(0,0,0,0.4)" />;
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.sender === user._id || item.sender?.toString() === user._id?.toString();
        return (
            <View style={[
                styles.messageBubble,
                isMyMessage ? { backgroundColor: colors.primary, borderBottomRightRadius: 4, alignSelf: 'flex-end' } : { backgroundColor: colors.card, borderBottomLeftRadius: 4, alignSelf: 'flex-start' }
            ]}>
                {item.type === 'image' ? (
                    <TouchableOpacity onPress={() => {
                        // Handle image view (maybe open modal)
                    }}>
                        <Image
                            source={{ uri: item.mediaUrl }}
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ) : (
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? { color: '#FFFFFF' } : { color: colors.text }
                    ]}>
                        {item.message}
                    </Text>
                )}
                <View style={styles.messageFooter}>
                    <Text style={[
                        styles.timeText,
                        isMyMessage ? { color: 'rgba(255,255,255,0.8)' } : { color: colors.textLight }
                    ]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {renderMessageStatus(item)}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{workerName || 'Chat'}</Text>
                    <Text style={[styles.headerSubtitle, { color: '#10B981' }]}>
                        {isTyping ? '💬 typing...' : 'Online'}
                    </Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="call-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={pickImage}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator size="small" color={colors.textSecondary} />
                        ) : (
                            <Ionicons name="images-outline" size={24} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: colors.text }]}
                        value={inputText}
                        onChangeText={handleTyping}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textLight}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: colors.primary }, !inputText.trim() && { backgroundColor: colors.textLight, shadowOpacity: 0, elevation: 0 }]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        ...SHADOWS.light,
        borderBottomWidth: 1,
    },
    headerInfo: {
        flex: 1,
        marginLeft: SPACING.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    messageList: {
        padding: SPACING.m,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginBottom: 5,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 4,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.m,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    attachButton: {
        marginRight: SPACING.s,
        padding: 5,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        maxHeight: 100,
        marginRight: SPACING.s,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
