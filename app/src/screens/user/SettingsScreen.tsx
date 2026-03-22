import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = ({ navigation }: any) => {
    const { logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [modalVisible, setModalVisible] = useState<{ visible: boolean; title: string; content: string } | null>(null);

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Delete account');
                        // Implement delete logic here
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const openModal = (title: string, content: string) => {
        setModalVisible({ visible: true, title, content });
    };

    const closeModal = () => {
        setModalVisible(null);
    };

    const SettingItem = ({ icon, label, value, type = 'arrow', onPress, color }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                    <Ionicons name={icon} size={20} color={color || colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: color || colors.text }]}>{label}</Text>
            </View>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#D1D5DB', true: colors.primary }}
                    thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
                />
            ) : (
                <View style={styles.settingRight}>
                    {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </View>
            )}
        </TouchableOpacity>
    );

    const SectionTitle = ({ title }: { title: string }) => (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Preferences Section */}
                <View style={styles.section}>
                    <SectionTitle title="Preferences" />
                    <SettingItem
                        icon="moon-outline"
                        label="Dark Mode"
                        type="switch"
                        value={isDark}
                        onPress={toggleTheme}
                    />
                    <SettingItem
                        icon="notifications-outline"
                        label="Push Notifications"
                        type="switch"
                        value={notifications}
                        onPress={() => setNotifications(!notifications)}
                    />
                    <SettingItem
                        icon="mail-outline"
                        label="Email Notifications"
                        type="switch"
                        value={emailNotifications}
                        onPress={() => setEmailNotifications(!emailNotifications)}
                    />
                    <SettingItem
                        icon="language-outline"
                        label="Language"
                        value="English"
                        onPress={() => { }}
                    />
                </View>

                <View style={styles.section}>
                    <SectionTitle title="Legal" />
                    <SettingItem
                        icon="document-text-outline"
                        label="Terms & Conditions"
                        onPress={() => navigation.navigate('Terms')}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    />
                    <SettingItem
                        icon="help-circle-outline"
                        label="FAQ"
                        onPress={() => navigation.navigate('FAQ')}
                    />
                    <SettingItem
                        icon="chatbubble-ellipses-outline"
                        label="Help & Support"
                        onPress={() => navigation.navigate('SupportChat')}
                    />
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <SectionTitle title="Account" />
                    <SettingItem
                        icon="log-out-outline"
                        label="Logout"
                        onPress={handleLogout}
                        color={colors.error}
                    />
                    <SettingItem
                        icon="trash-outline"
                        label="Delete Account"
                        onPress={handleDeleteAccount}
                        color={colors.error}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: colors.textLight }]}>Version 1.0.0</Text>
                </View>
            </ScrollView>


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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
    },
    footer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    versionText: {
        fontSize: 12,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
    },
    modalText: {
        fontSize: 16,
        lineHeight: 24,
    },
});

export default SettingsScreen;
