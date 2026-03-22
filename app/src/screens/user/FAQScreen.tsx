import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = () => {
    const navigation = useNavigation();
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSection(openSection === id ? null : id);
    };

    const faqs = [
        {
            category: "1. Booking & Scheduling",
            items: [
                {
                    q: "How do I book a service?",
                    a: "You can book easily through our website www.ranx24.com, by calling us at 9546806196, or via our RanX24 mobile app."
                },
                {
                    q: "How soon can a technician arrive?",
                    a: "For emergency services (like active leaks or electrical failures), we aim for a response time of [e.g., 2 hours] depending on your location. For non-urgent maintenance, you can schedule the next available slot, typically within 24-48 hours."
                },
                {
                    q: "What happens if I need to cancel or reschedule?",
                    a: "You can cancel or reschedule by contacting us at least [24 hours] prior to the scheduled appointment time. Cancellations made after this window may be subject to a late cancellation fee as outlined in our Terms and Conditions."
                },
                {
                    q: "Do I need to be home during the service?",
                    a: "Yes, we require an adult (18 years or older) to be present at the service location when the technician arrives and throughout the entire duration of the service."
                }
            ]
        },
        {
            category: "2. Pricing and Payment",
            items: [
                {
                    q: "Is the price quoted online the final price?",
                    a: "The initial quote is an estimate based on the information you provide. Once the technician assesses the issue on-site, they will provide a final, fixed price before starting any work. No work will begin without your approval of the final price."
                },
                {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit/debit cards, bank transfers, cash, and popular mobile payment platforms. Payment is due immediately upon the completion of the service."
                },
                {
                    q: "Are there any hidden costs or call-out fees?",
                    a: "We pride ourselves on transparent pricing. Our pricing includes the labour fee. If we charge a nominal inspection/call-out fee to diagnose the issue, it will always be communicated upfront and is often waived if you proceed with the repair."
                },
                {
                    q: "Who supplies the materials/parts needed for the repair?",
                    a: "Our technicians typically source standard, high-quality replacement parts, and the cost will be added to your final invoice. Alternatively, you may supply the parts, but our service warranty will only cover the labor in that instance."
                }
            ]
        },
        {
            category: "3. Technicians and Safety",
            items: [
                {
                    q: "Are your technicians certified and background-checked?",
                    a: "Absolutely. Every RanX24 professional is thoroughly vetted, undergoes a strict background check, and holds the necessary certifications and licenses for their respective trade."
                },
                {
                    q: "Do I need to provide tools or equipment?",
                    a: "No. Our technicians arrive with all the necessary professional tools and basic equipment to complete the job."
                },
                {
                    q: "What precautions do your technicians take?",
                    a: "Our technicians are trained to maintain a clean and safe workspace. They use protective coverings, clean up after the job is complete, and adhere to strict safety standards."
                }
            ]
        },
        {
            category: "4. Service Guarantee and Liability",
            items: [
                {
                    q: "What if the problem returns after the repair?",
                    a: "We offer a 15-day labour warranty on all repairs. If the exact same issue reoccurs due to poor workmanship within this period, contact us, and we will send a technician back free of charge to resolve it."
                },
                {
                    q: "What if a part fails?",
                    a: "Parts supplied by RanX24 are covered by the manufacturer's warranty. We will assist you in processing the claim, but the warranty duration is determined by the manufacturer, not RanX24."
                },
                {
                    q: "What if something is damaged during the service?",
                    a: "While our professionals take extreme care, in the unlikely event that property damage occurs due to the technician’s negligence, RanX24 maintains comprehensive insurance coverage. Please refer to the Limitation of Liability section in our Terms and Conditions for full details."
                }
            ]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {faqs.map((section, sIndex) => (
                    <View key={sIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.category}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, iIndex) => {
                                const id = `${sIndex}-${iIndex}`;
                                const isOpen = openSection === id;
                                return (
                                    <View key={iIndex} style={styles.accordionContainer}>
                                        <TouchableOpacity
                                            style={styles.accordionHeader}
                                            onPress={() => toggleSection(id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.questionText}>{item.q}</Text>
                                            <Ionicons
                                                name={isOpen ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={COLORS.textSecondary}
                                            />
                                        </TouchableOpacity>
                                        {isOpen && (
                                            <View style={styles.accordionBody}>
                                                <Text style={styles.answerText}>{item.a}</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: COLORS.white,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 12,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionContent: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    accordionContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
    },
    questionText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
        flex: 1,
        paddingRight: 8,
    },
    accordionBody: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: COLORS.white,
    },
    answerText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.textSecondary,
    }
});

export default FAQScreen;
