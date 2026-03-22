import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';

const AboutScreen = () => {
    const navigation = useNavigation();

    const services = [
        "🔧 Plumbing: From dripping taps to complex pipe installations.",
        "⚡ Electrical: Safety inspections, wiring repairs, and appliance installation.",
        "🧹 Cleaning: Deep home cleaning, sofa cleaning, and tank cleaning.",
        "🔨 Carpentry & Repairs: Furniture assembly and general home fixes.",
        "❄️ AC, RO & Appliance Repair: Maintenance and repair for all major brands.",
        "💇‍♀️ Salon at Home",
        "💄 Beautician at Home",
        "🪑 Carpenter",
        "🏠 Home repair, renovation and home decor"
    ];

    const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
        <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
                <Ionicons name={icon as any} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.heroTitle}>RanX24 Home Service</Text>
                    <Text style={styles.tagline}>Making Home Maintenance Simple, Safe, and Reliable.</Text>
                </View>

                {/* Introduction */}
                <View style={styles.section}>
                    <Text style={styles.paragraph}>
                        At RanX24 Home Service, we understand that your home is your sanctuary. But we also know that maintaining a home can be stressful—leaky faucets, faulty wiring, and dusty corners always seem to pop up at the worst times.
                    </Text>
                    <Text style={styles.paragraph}>
                        That is why we started RanX24: to bridge the gap between skilled professionals and homeowners who need help fast. We are not just a service provider; we are your reliable partner in keeping your home running smoothly.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* Mission */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="heart" size={24} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Our Mission</Text>
                    </View>
                    <Text style={styles.missionText}>
                        To deliver high-quality home services with speed, transparency, and trust.
                    </Text>
                    <Text style={styles.paragraph}>
                        We aim to take the hassle out of home repairs. No more chasing down contractors, waiting for callbacks, or worrying about hidden costs. With RanX24, you get professional service at the click of a button.
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* Why Choose Us */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why Choose RanX24?</Text>
                    <Text style={styles.paragraph}>We know you have choices when it comes to home services. Here is why thousands of customers trust us with their homes:</Text>

                    <View style={styles.featuresGrid}>
                        <FeatureCard
                            icon="shield-checkmark"
                            title="Verified Professionals"
                            description="Every technician undergoes a background check and rigorous skills assessment."
                        />
                        <FeatureCard
                            icon="pricetag"
                            title="Transparent Pricing"
                            description="Clear, upfront estimates. No hidden fees."
                        />
                        <FeatureCard
                            icon="time"
                            title="On-Time Service"
                            description="We respect your time. When we say we will be there, we will be there."
                        />
                        <FeatureCard
                            icon="medal"
                            title="Quality Guarantee"
                            description="We stand by our work. If something isn't right, we come back and fix it."
                        />
                        <FeatureCard
                            icon="timer"
                            title="24/7 Availability"
                            description="Emergencies don't look at the clock, and neither do we."
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Services */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What We Do</Text>
                    <Text style={styles.paragraph}>We are your one-stop solution for all household needs:</Text>
                    <View style={styles.servicesList}>
                        {services.map((service, index) => (
                            <View key={index} style={styles.serviceItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.serviceText}>{service}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Promise & CTA */}
                <View style={[styles.section, styles.promiseSection]}>
                    <Text style={styles.sectionTitle}>Our Promise to You</Text>
                    <Text style={styles.paragraph}>
                        When you book a service with RanX24, you aren't just hiring a worker; you are hiring a team dedicated to excellence. We treat your home with the same care and respect as we would our own.
                    </Text>

                    <Text style={styles.ctaTitle}>Ready to experience the RanX24 difference?</Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => Linking.openURL('https://www.ranx24.com')}
                    >
                        <Text style={styles.primaryButtonText}>Book a Service Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => Linking.openURL('tel:9546806196')}
                    >
                        <Ionicons name="call" size={20} color={COLORS.text} style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryButtonText}>Contact Us: 9546806196</Text>
                    </TouchableOpacity>
                </View>

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
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F8FAFC',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
        borderRadius: 12,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
    },
    missionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: COLORS.textSecondary,
        marginBottom: 12,
        textAlign: 'justify',
    },
    divider: {
        height: 8,
        backgroundColor: '#F1F5F9',
    },
    featuresGrid: {
        gap: 16,
        marginTop: 12,
    },
    featureCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    featureIconContainer: {
        marginBottom: 12,
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        padding: 8,
        borderRadius: 8,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    servicesList: {
        gap: 12,
        marginTop: 8,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginTop: 8,
        marginRight: 10,
    },
    serviceText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        fontWeight: '500',
    },
    promiseSection: {
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    }
});

export default AboutScreen;
