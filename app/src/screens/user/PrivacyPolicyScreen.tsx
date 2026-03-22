import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.lastUpdatedContainer}>
                    <Text style={styles.lastUpdatedText}>Last Updated: {new Date().toLocaleDateString()}</Text>
                </View>

                <Text style={styles.paragraph}>
                    At RanX24 Home Service ("we," "us," or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website www.ranx24.com and use our home services (plumbing, cleaning, electrical, repairs, salon at home , beautician at home etc.).
                </Text>
                <Text style={styles.paragraph}>
                    By accessing or using our Service, you signify that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal information as described in this Privacy Policy.
                </Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.paragraph}>We collect information to provide better services to all our users. The types of information we collect include:</Text>

                <Text style={styles.subSectionTitle}>A. Personal Data</Text>
                <Text style={styles.paragraph}>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you, such as:</Text>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• Identity Data: Name, username, or similar identifier.</Text>
                </View>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• Contact Data: Billing address, service delivery address, email address, and telephone numbers.</Text>
                </View>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• Transaction Data: Details about payments to and from you and details of services you have purchased from us.</Text>
                </View>

                <Text style={styles.subSectionTitle}>B. Service-Specific Data</Text>
                <Text style={styles.paragraph}>To provide accurate home services, we may collect:</Text>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• Location Information: We may collect the precise location of your home to dispatch technicians.</Text>
                </View>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletText}>• Property Details: Information regarding the specific problem (e.g., photos of a leak, type of appliance, size of the room) to prepare our technicians.</Text>
                </View>

                <Text style={styles.subSectionTitle}>C. Usage Data</Text>
                <Text style={styles.paragraph}>We may automatically collect information on how the Service is accessed and used. This may include your computer's Internet Protocol address (IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, and other diagnostic data.</Text>

                <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                <Text style={styles.paragraph}>RanX24 Home Service uses the collected data for various purposes:</Text>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• To Provide and Maintain our Service: Including scheduling appointments and dispatching service professionals to your location.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• To Manage Your Account: To manage your registration as a user of the Service.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• To Process Payments: To verify and complete financial transactions for services rendered.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• To Communicate with You: To contact you by email, telephone calls, SMS, or mobile notifications regarding updates, service completion, or security alerts.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• Customer Support: To provide customer support and troubleshoot issues.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• Marketing (Optional): To provide you with news, special offers, and general information about other goods, services, and events which we offer.</Text></View>

                <Text style={styles.sectionTitle}>3. Sharing Your Information</Text>
                <Text style={styles.paragraph}>We do not sell your personal information. However, we may share your information in the following situations:</Text>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• With Service Providers: We may share your information with our contractors, technicians, or third-party service providers.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• For Business Transfers: If we are involved in a merger, acquisition, or asset sale.</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• With Law Enforcement: We may disclose your Personal Data if required to do so by law.</Text></View>

                <Text style={styles.sectionTitle}>4. Security of Your Data</Text>
                <Text style={styles.paragraph}>The security of your data is important to us. We use commercially acceptable means (such as SSL encryption for payments and secure servers) to protect your Personal Data. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</Text>

                <Text style={styles.sectionTitle}>5. Cookies and Tracking Technologies</Text>
                <Text style={styles.paragraph}>We use Cookies and similar tracking technologies to track the activity on our Service and hold certain information (Session Cookies, Preference Cookies, Security Cookies).</Text>

                <Text style={styles.sectionTitle}>6. Your Data Rights</Text>
                <Text style={styles.paragraph}>Depending on your location, you may have the following rights regarding your data:</Text>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• The right to access</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• The right to rectification</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• The right to erasure</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• The right to withdraw consent</Text></View>
                <Text style={styles.paragraph}>To exercise these rights, please contact us at support@ranx24.com</Text>

                <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
                <Text style={styles.paragraph}>Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18.</Text>

                <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
                <Text style={styles.paragraph}>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</Text>

                <Text style={styles.sectionTitle}>9. Contact Us</Text>
                <Text style={styles.paragraph}>If you have any questions about this Privacy Policy, please contact us:</Text>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• By email: support@ranx24.com</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• By phone: 9546806196</Text></View>
                <View style={styles.bulletPoint}><Text style={styles.bulletText}>• By mail: info@ranx24.com</Text></View>

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
        padding: 20,
    },
    lastUpdatedContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    lastUpdatedText: {
        color: '#666',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 20,
        marginBottom: 10,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 15,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444',
        marginBottom: 10,
        textAlign: 'justify',
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingLeft: 10,
    },
    bulletText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#444',
    }
});

export default PrivacyPolicyScreen;
