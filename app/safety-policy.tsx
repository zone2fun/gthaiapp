import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

export default function SafetyPolicyScreen() {
    const router = useRouter();

    const Section = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <LinearGradient
                    colors={['#A607D6', '#7B2CBF']}
                    style={styles.numberBadge}
                >
                    <Text style={styles.numberText}>{number}</Text>
                </LinearGradient>
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    const SubSection = ({ number, title, items }: { number: string; title: string; items?: string[] }) => (
        <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>{number} {title}</Text>
            {items && items.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{item}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Safety Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Introduction */}
                <LinearGradient
                    colors={['#A607D6', '#7B2CBF', '#5A189A']}
                    style={styles.introCard}
                >
                    <MaterialIcons name="shield" size={48} color="#fff" style={styles.introIcon} />
                    <Text style={styles.introTitle}>Community Safety First</Text>
                    <Text style={styles.introText}>
                        To keep GThaiLover a safe and enjoyable place for everyone, all users must follow these rules.
                    </Text>
                    <Text style={styles.introSubText}>
                        By using this platform, you agree to all policies.
                    </Text>
                </LinearGradient>

                {/* Section 1: Prohibited Content & Behavior */}
                <Section number="1" title="Prohibited Content & Behavior">
                    <SubSection
                        number="1.1"
                        title="Sexual or Explicit Content"
                        items={[
                            "Posting pornographic, explicit, or obscene content is prohibited.",
                            "Do not share, request, or discuss sexual activities explicitly."
                        ]}
                    />

                    <SubSection
                        number="1.2"
                        title="Drugs and Illegal Substances"
                        items={[
                            "Do not post or encourage the buying, selling, or use of illegal drugs."
                        ]}
                    />

                    <SubSection
                        number="1.3"
                        title="Strictly No Minors (Under 18)"
                        items={[
                            "No images, profiles, or content involving minors.",
                            "Do not claim to be under 18."
                        ]}
                    />

                    <SubSection
                        number="1.4"
                        title="Sensitive Personal Information"
                    />
                    <Text style={styles.normalText}>Do not share or request the following:</Text>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Credit card information</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Bank account details</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Passwords or login credentials</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Identification numbers</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Other sensitive personal data</Text>
                    </View>

                    <SubSection
                        number="1.5"
                        title="Impersonation & Using Others' Photos"
                        items={[
                            "Do not use someone else's photo.",
                            "Do not impersonate or claim to be another real person.",
                            "Do not use AI-generated images of real people without permission."
                        ]}
                    />

                    <SubSection
                        number="1.6"
                        title="Financial Scams / Investment / Gambling"
                        items={[
                            "No promotions of investments, money transfers, or financial requests.",
                            "No gambling or inviting others to gamble.",
                            "Do not request money, investments, or donations."
                        ]}
                    />

                    <SubSection
                        number="1.7"
                        title="Illegal Activities"
                        items={[
                            "All illegal activities are strictly prohibited."
                        ]}
                    />
                </Section>

                {/* Section 2: Warning & Ban System */}
                <Section number="2" title="Warning & Ban System">
                    <Text style={styles.normalText}>To maintain community safety:</Text>

                    <SubSection
                        number="2.1"
                        title="General Violations"
                        items={[
                            "If a user receives 3 warnings and continues violating rules, the account will be automatically banned."
                        ]}
                    />

                    <SubSection
                        number="2.2"
                        title="Inappropriate / Forbidden Photos"
                        items={[
                            "If a user receives 10 image warnings (from feed or profile), the account will be automatically banned."
                        ]}
                    />
                </Section>

                {/* Section 3: Legal Responsibility */}
                <Section number="3" title="Legal Responsibility">
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>
                            GThaiLover does not support or engage in any illegal activities by users.
                        </Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>
                            Any illegal action is solely the user's responsibility.
                        </Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>
                            Using this website means you accept this responsibility.
                        </Text>
                    </View>
                </Section>

                {/* Section 4: Consent */}
                <Section number="4" title="Consent">
                    <Text style={styles.normalText}>
                        By signing up or using GThaiLover, you agree to all rules. Violations may result in warnings, content removal, or permanent ban.
                    </Text>
                </Section>

                {/* Footer */}
                <View style={styles.footer}>
                    <MaterialIcons name="verified-user" size={24} color={Colors.dark.tint} />
                    <Text style={styles.footerText}>
                        Thank you for helping us maintain a safe community
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    introCard: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    introIcon: {
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    introText: {
        fontSize: 15,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    introSubText: {
        fontSize: 14,
        color: '#FFD700',
        textAlign: 'center',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    numberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    numberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    sectionContent: {
        padding: 16,
    },
    subSection: {
        marginBottom: 16,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.tint,
        marginBottom: 8,
    },
    normalText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        marginBottom: 8,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.dark.tint,
        marginTop: 7,
        marginRight: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        gap: 12,
    },
    footerText: {
        fontSize: 14,
        color: '#ccc',
        fontStyle: 'italic',
    },
});
