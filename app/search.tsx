import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getUsers } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function SearchScreen() {
    const router = useRouter();
    const { token, blockedUsers } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers([]);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = allUsers.filter(user => {
                // Search in name
                const nameMatch = user.name?.toLowerCase().includes(query);
                // Search in bio
                const bioMatch = user.bio?.toLowerCase().includes(query);
                // Search in country
                const countryMatch = user.country?.toLowerCase().includes(query);
                // Search in lookingFor
                const lookingForMatch = Array.isArray(user.lookingFor)
                    ? user.lookingFor.some((item: string) => item.toLowerCase().includes(query))
                    : user.lookingFor?.toLowerCase().includes(query);

                return nameMatch || bioMatch || countryMatch || lookingForMatch;
            });
            setFilteredUsers(filtered);
        }
    }, [searchQuery, allUsers]);

    const fetchUsers = async () => {
        try {
            const authToken = token || 'mock-token';
            const users = await getUsers(authToken);
            // Filter out blocked users
            const filteredUsers = (users as any[]).filter(u => !blockedUsers.includes(u._id));
            setAllUsers(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderUser = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => router.push(`/user/${item._id}`)}
        >
            <Image
                source={{ uri: item.img }}
                style={styles.userAvatar}
                contentFit="cover"
            />
            <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.isVerified && (
                        <MaterialIcons name="verified" size={16} color="#1DA1F2" style={{ marginLeft: 4 }} />
                    )}
                    {item.isOnline && (
                        <View style={styles.onlineDot} />
                    )}
                </View>
                {item.bio && (
                    <Text style={styles.userBio} numberOfLines={2}>
                        {item.bio}
                    </Text>
                )}
                <View style={styles.userMeta}>
                    {item.age && <Text style={styles.userMetaText}>{item.age} years</Text>}
                    {item.country && (
                        <>
                            <Text style={styles.userMetaText}> • </Text>
                            <Text style={styles.userMetaText}>{item.country}</Text>
                        </>
                    )}
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.searchBarContainer}>
                        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, bio, country..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialIcons name="close" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.dark.tint} />
                    </View>
                ) : searchQuery.trim() === '' ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search" size={64} color="#333" />
                        <Text style={styles.emptyText}>Start typing to search</Text>
                        <Text style={styles.emptySubText}>
                            Search by name, bio, country, or interests
                        </Text>
                    </View>
                ) : filteredUsers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={64} color="#333" />
                        <Text style={styles.emptyText}>No results found</Text>
                        <Text style={styles.emptySubText}>
                            Try different keywords
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUser}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </SafeAreaView>
        </>
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
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubText: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    listContent: {
        padding: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    userAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#333',
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ecc71',
        marginLeft: 6,
    },
    userBio: {
        color: '#aaa',
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 18,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userMetaText: {
        color: '#666',
        fontSize: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#2a2a2a',
        marginVertical: 8,
    },
});
