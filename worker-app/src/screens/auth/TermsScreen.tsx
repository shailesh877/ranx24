import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';

const TermsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms and Conditions</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.lastUpdated}>Welcome to RanX24 Home Service</Text>

                <View style={styles.section}>
                    <Text style={styles.paragraph}>
                        By accessing our website, booking an appointment, or using our services (plumbing, cleaning, electrical, repairs, salon at home , beautician at home etc.)., you agree to be bound by these Terms and Conditions ("Terms").
                    </Text>
                    <Text style={[styles.paragraph, styles.bold]}>
                        Please read these Terms carefully before booking a service. If you do not agree with any part of these terms, you may not use our services.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Scope of Services</Text>
                    <Text style={styles.paragraph}>
                        RanX24 Home Service ("we," "us," or "our") connects customers with skilled technicians/professionals to perform home maintenance and repair services.
                    </Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Service Quality:</Text> We strive to provide high-quality service. However, we reserve the right to refuse service to anyone for any reason at any time (e.g., unsafe working conditions).
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Estimates:</Text> Any price quotes provided over the phone or online are estimates based on the information provided. The final price may change once the technician inspects the issue in person. We will always seek your approval for the revised price before starting work.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Booking and Scheduling</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Appointments:</Text> You agree to provide accurate and complete information when booking a service, including your address, contact details, and a description of the problem.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Access to Property:</Text> You must ensure that a person at least 18 years of age is present at the property for the duration of the service. You agree to provide our technicians with access to the necessary areas, water, and electricity required to complete the job.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Safety:</Text> You are responsible for securing any pets and removing any hazards from the workspace before the technician arrives.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Cancellations and Rescheduling</Text>
                    <Text style={styles.paragraph}>We understand that plans change. However, late cancellations affect our technicians' schedules.</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Cancellation Notice:</Text> You may cancel or reschedule your appointment free of charge up to 24 hours before the scheduled time.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Late Cancellation Fee:</Text> If you cancel within 24 hours of the appointment, or if you are not home when the technician arrives, we reserve the right to charge a visiting fee.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Payments and Billing</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Payment Terms:</Text> Payment is due immediately upon completion of the service unless otherwise agreed in writing.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Accepted Methods:</Text> We accept Cash, Credit Cards, Debit Cards, UPI, Bank Transfers.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Materials and Parts:</Text> The cost of spare parts or materials required for the repair is not included in the service charge unless explicitly stated. You may purchase the parts yourself, or we can source them for you at an additional cost.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Late Payments:</Text> Invoices not paid within 3 days may be subject to a late fee of 12% per month.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Limited Warranty</Text>
                    <Text style={styles.paragraph}>We stand by the quality of our workmanship.</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Service Warranty:</Text> We offer a 15-day service warranty on labour. If the same issue reoccurs within this period due to our workmanship, we will fix it free of charge.
                        </Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>
                            <Text style={styles.bold}>Exclusions:</Text> This warranty does not cover:
                        </Text>
                    </View>
                    <View style={[styles.bulletPoint, { paddingLeft: 16 }]}>
                        <Text style={styles.bullet}>o</Text>
                        <Text style={styles.bulletText}>Issues caused by misuse or negligence after the service.</Text>
                    </View>
                    <View style={[styles.bulletPoint, { paddingLeft: 16 }]}>
                        <Text style={styles.bullet}>o</Text>
                        <Text style={styles.bulletText}>Pre-existing damage to the property.</Text>
                    </View>
                    <View style={[styles.bulletPoint, { paddingLeft: 16 }]}>
                        <Text style={styles.bullet}>o</Text>
                        <Text style={styles.bulletText}>Defects in parts or materials (parts carry the manufacturer's warranty, not ours).</Text>
                    </View>
                    <View style={[styles.bulletPoint, { paddingLeft: 16 }]}>
                        <Text style={styles.bullet}>o</Text>
                        <Text style={styles.bulletText}>Blockages in drainage that reoccur due to foreign objects (wipes, grease, etc.) being flushed after our service.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                    <View style={styles.warningBox}>
                        <Text style={[styles.paragraph, styles.bold, { color: '#854D0E' }]}>This is a critical section. Please read carefully.</Text>
                        <Text style={styles.paragraph}>To the fullest extent permitted by law, RanX24 Home Service shall not be liable for:</Text>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                <Text style={styles.bold}>Indirect Damages:</Text> Any indirect, incidental, or consequential damages (e.g., loss of income, water damage to flooring caused by a pre-existing burst pipe before we arrived).
                            </Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                <Text style={styles.bold}>Pre-existing Conditions:</Text> Damages resulting from old, fragile, or deteriorating plumbing, wiring, or fixtures that break during standard repair attempts.
                            </Text>
                        </View>
                        <View style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>
                                <Text style={styles.bold}>Third-Party Parts:</Text> Failure of parts or materials purchased by the customer or supplied by third-party manufacturers.
                            </Text>
                        </View>
                        <Text style={[styles.paragraph, { fontStyle: 'italic', marginTop: 8 }]}>
                            Our total liability to you for any claim arising out of the service shall not exceed the total amount paid by you for that specific service.
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Independent Contractors</Text>
                    <Text style={styles.paragraph}>
                        Some technicians operating under RanX24 Home Service may be independent contractors. While we vet our professionals, RanX24 is not liable for the independent acts or omissions of these contractors beyond the scope of the service warranty.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. User Conduct</Text>
                    <Text style={styles.paragraph}>
                        You agree to treat our technicians with respect. We have a zero-tolerance policy for harassment, abuse, or threatening behavior. We reserve the right to terminate the service immediately and vacate the premises if our staff feels unsafe.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to modify these Terms at any time. Your continued use of the Service following any changes indicates your acceptance of the new Terms.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Governing Law</Text>
                    <Text style={styles.paragraph}>
                        These Terms shall be governed by and construed in accordance with the laws of Bihar, India. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts in Muzaffarpur, Bihar.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <Text style={styles.paragraph}>If you have any questions about these Terms and Conditions, please contact us:</Text>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}><Text style={styles.bold}>Email:</Text> support@ranx24.com</Text>
                    </View>
                    <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}><Text style={styles.bold}>Phone:</Text> 9546806196</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginLeft: 12,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    lastUpdated: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.text.secondary,
        marginBottom: 8,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 8,
    },
    bullet: {
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.text.primary,
        marginRight: 8,
        width: 12,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.text.secondary,
        textAlign: 'justify',
    },
    warningBox: {
        backgroundColor: '#FEFCE8',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FEF9C3',
    }
});

export default TermsScreen;
