import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getBlockedUsers, unblockUser } from '@/services/api';

export default function BlockedUsersScreen() {
    const router = useRouter();
    const { token, user, updateUser } = useAuth();
    const [blockedList, setBlockedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, [token]);

    const fetchBlockedUsers = async () => {
        if (!token) return;
        try {
            const data = await getBlockedUsers(token);
            setBlockedList(data);
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            Alert.alert('Error', 'Failed to load blocked users');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: string, userName: string) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${userName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await unblockUser(userId, token!);
                            // Update local state
                            setBlockedList(prev => prev.filter(u => u._id !== userId));

                            // Update global user state to remove from blockedUsers array
                            if (user) {
                                const updatedBlockedUsers = user.blockedUsers.filter((id: string) => id !== userId);
                                const updatedUser = { ...user, blockedUsers: updatedBlockedUsers };
                                await updateUser(updatedUser);
                            }

                            Alert.alert('Success', 'User unblocked successfully');
                        } catch (error) {
                            console.error('Error unblocking user:', error);
                            Alert.alert('Error', 'Failed to unblock user');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    {item.img ? (
                        <Image
                            source={{ uri: item.img }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                            <MaterialIcons name="person" size={30} color="#666" />
                        </View>
                    )}
                    {item.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={16} color="#1DA1F2" />
                        </View>
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => handleUnblock(item._id, item.name)}
            >
                <Text style={styles.unblockButtonText}>Unblock</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Blocked Users</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.dark.tint} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blocked Users</Text>
                <View style={{ width: 24 }} />
            </View>

            {blockedList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="block" size={64} color="#444" />
                    <Text style={styles.emptyText}>No blocked users</Text>
                    <Text style={styles.emptySubText}>Users you block will appear here</Text>
                </View>
            ) : (
                <FlatList
                    data={blockedList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
        color: Colors.dark.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#333',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    unblockButton: {
        backgroundColor: '#333',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#555',
    },
    unblockButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.dark.text,
        marginBottom: 8,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 15,
        color: '#888',
    },
});
