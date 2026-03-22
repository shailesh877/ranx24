import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { SPACING, SHADOWS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'warning';
            case 'error': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'warning': return '#F59E0B';
            case 'error': return '#EF4444';
            default: return '#3B82F6';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.card },
                !item.read && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF' }
            ]}
            onPress={() => handleMarkAsRead(item._id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.message, { color: colors.textSecondary }]}>{item.message}</Text>
                <Text style={[styles.time, { color: colors.textLight }]}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </View>
            {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                    <Text style={[styles.readAllText, { color: colors.primary }]}>Read All</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchNotifications();
                            }}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="notifications-off-outline" size={60} color={colors.textLight} />
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
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
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderBottomWidth: 1,
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    readAllText: {
        fontWeight: '600',
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        alignItems: 'flex-start',
        ...SHADOWS.light,
    },
    iconContainer: {
        marginRight: SPACING.m,
        marginTop: 2,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 8,
    },
    time: {
        fontSize: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: SPACING.s,
        marginTop: 6,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.m,
        fontSize: 16,
    },
});

export default NotificationsScreen;
