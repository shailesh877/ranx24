import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Chat, NavigationParams } from '../../types';
import { SPACING, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

type ChatListScreenNavigationProp = StackNavigationProp<NavigationParams, 'ChatList'>;

const ChatListScreen: React.FC = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<ChatListScreenNavigationProp>();
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChats = async () => {
        try {
            const response = await api.get('/chat');
            setChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchChats();
    };

    const renderItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={[styles.chatItem, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Chat', {
                bookingId: item.bookingId,
                workerName: item.otherPerson.name,
                workerId: item.otherPerson._id
            })}
        >
            <View style={styles.avatarContainer}>
                {item.otherPerson.profileImage ? (
                    <Image source={{ uri: item.otherPerson.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.avatarInitials, { color: '#FFFFFF' }]}>
                            {item.otherPerson.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {item.otherPerson.name}
                    </Text>
                    <Text style={[styles.time, { color: colors.textSecondary }]}>
                        {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text style={[styles.serviceName, { color: colors.primary }]}>{item.serviceName}</Text>
                <View style={styles.messageContainer}>
                    <Text style={[
                        styles.lastMessage,
                        { color: colors.textSecondary },
                        item.unreadCount > 0 && { color: colors.text, fontWeight: '600' }
                    ]} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
                            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Chats</Text>
            </View>
            <FlatList
                data={chats}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No chats yet</Text>
                        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Book a service to start chatting</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: SPACING.m,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.m,
    },
    chatItem: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    avatarContainer: {
        marginRight: SPACING.m,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    time: {
        fontSize: 12,
    },
    serviceName: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: SPACING.m,
    },
    emptySubText: {
        fontSize: 14,
        marginTop: SPACING.s,
    },
});

export default ChatListScreen;
