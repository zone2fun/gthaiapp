import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkError } from '../contexts/NetworkErrorContext';

const { width } = Dimensions.get('window');

export const NetworkErrorModal: React.FC = () => {
    const { isVisible, errorMessage, hideError, retryAction } = useNetworkError();

    const handleRetry = () => {
        hideError();
        if (retryAction) {
            retryAction();
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={hideError}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Error Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="cloud-offline" size={64} color="#FF6B6B" />
                    </View>

                    {/* Error Message */}
                    <Text style={styles.title}>เกิดข้อผิดพลาด</Text>
                    <Text style={styles.message}>{errorMessage}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.retryButton]}
                            onPress={handleRetry}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color="#FFF" style={styles.buttonIcon} />
                            <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={hideError}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelButtonText}>ปิด</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        width: width - 60,
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFF5F5',
        borderRadius: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
    },
    retryButton: {
        backgroundColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    cancelButtonText: {
        color: '#6C757D',
        fontSize: 16,
        fontWeight: '600',
    },
});
