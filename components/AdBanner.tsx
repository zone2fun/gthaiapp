import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AdBannerProps {
    onClose?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onClose }) => {
    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <LinearGradient
                    colors={['#A607D6', '#7B2CBF', '#5A189A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <MaterialIcons name="star" size={20} color="#FFD700" />
                        <Text style={styles.text}>🎉 Premium Member - Unlock All Features!</Text>
                        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                    </View>
                </LinearGradient>
            </View>

            {onClose && (
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="close" size={16} color="#999" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#000',
    },
    banner: {
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#A607D6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    gradient: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
        zIndex: 10,
    },
});
