import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const HelpScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();

    const faqs = [
        {
            question: 'How do I book a service?',
            answer: 'Browse categories, select a worker, choose date & time, and confirm booking.',
        },
        {
            question: 'How can I cancel a booking?',
            answer: 'Go to My Bookings, select the booking, and tap Cancel. Refund depends on cancellation policy.',
        },
        {
            question: 'What payment methods are accepted?',
            answer: 'We accept UPI, cards, net banking, and wallet payments.',
        },
        {
            question: 'How do I track my booking?',
            answer: 'Check My Bookings section for real-time status updates.',
        },
    ];

    const handleCall = () => {
        Linking.openURL('tel:+919546806196');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:support@ranx24.com');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.contactSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card }]} onPress={handleCall}>
                        <View style={styles.contactLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                                <Ionicons name="call" size={24} color="#1E40AF" />
                            </View>
                            <View>
                                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Call Us</Text>
                                <Text style={[styles.contactValue, { color: colors.text }]}>+91 9546806196</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('SupportChat')}>
                        <View style={styles.contactLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#16A34A" />
                            </View>
                            <View>
                                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Chat with Support</Text>
                                <Text style={[styles.contactValue, { color: colors.text }]}>In-App Chat</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card }]} onPress={handleEmail}>
                        <View style={styles.contactLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}>
                                <Ionicons name="mail" size={24} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email Us</Text>
                                <Text style={[styles.contactValue, { color: colors.text }]}>support@ranx24.com</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                    </TouchableOpacity>
                </View>

                <View style={styles.faqSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
                    {faqs.map((faq, index) => (
                        <View key={index} style={[styles.faqCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
                            <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.versionSection}>
                    <Text style={[styles.versionText, { color: colors.textLight }]}>App Version 1.0.0</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    contactSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    contactCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    faqSection: {
        padding: 16,
    },
    faqCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    question: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
    },
    versionSection: {
        padding: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
    },
});

export default HelpScreen;
