import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getUser, updateUser } from '@/services/api';
import { uploadImageToCloudinary } from '@/services/cloudinary';

const COUNTRIES = ['Thailand', 'USA', 'UK', 'Japan', 'Korea', 'China', 'Singapore', 'Vietnam', 'Laos', 'Myanmar', 'Cambodia', 'Malaysia', 'Indonesia', 'Philippines'];
const LOOKING_FOR_OPTIONS = ['Friends', 'Chat', 'Dating', 'Lover'];

export default function EditProfileScreen() {
    const { user: authUser, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        age: '',
        height: '',
        weight: '',
        country: '',
        lookingFor: [] as string[],
        img: '',
        cover: '',
    });

    const [gallery, setGallery] = useState<string[]>([]);
    const [newGallery, setNewGallery] = useState<string[]>([]);
    const [privateAlbum, setPrivateAlbum] = useState<string[]>([]);
    const [newPrivateAlbum, setNewPrivateAlbum] = useState<string[]>([]);

    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [lookingForModalVisible, setLookingForModalVisible] = useState(false);

    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (authUser && token) {
            fetchProfile();
        }
    }, [authUser, token]);

    const fetchProfile = async () => {
        try {
            const userData = await getUser(authUser._id, token!);
            const data = {
                name: userData.name || '',
                bio: userData.bio || '',
                age: userData.age ? userData.age.toString() : '',
                height: userData.height ? userData.height.toString() : '',
                weight: userData.weight ? userData.weight.toString() : '',
                country: userData.country || '',
                lookingFor: Array.isArray(userData.lookingFor) ? userData.lookingFor : [],
                img: userData.img || '',
                cover: userData.cover || '',
            };
            setFormData(data);
            setInitialData(data);
            setGallery(userData.gallery || []);
            setPrivateAlbum(userData.privateAlbum || []);
        } catch (error) {
            console.error("Error fetching profile:", error);
            Alert.alert("Error", "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (type: 'avatar' | 'cover' | 'gallery' | 'privateAlbum') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: type === 'avatar' || type === 'cover',
            aspect: type === 'avatar' ? [1, 1] : type === 'cover' ? [16, 9] : undefined,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;

            if (type === 'avatar') {
                uploadAndSet(uri, 'img');
            } else if (type === 'cover') {
                uploadAndSet(uri, 'cover');
            } else if (type === 'gallery') {
                uploadAndAddToGallery(uri, false);
            } else if (type === 'privateAlbum') {
                if (privateAlbum.length + newPrivateAlbum.length >= 3) {
                    Alert.alert("Limit Reached", "You can only have 3 photos in your private album.");
                    return;
                }
                uploadAndAddToGallery(uri, true);
            }
        }
    };

    const uploadAndSet = async (uri: string, field: 'img' | 'cover') => {
        try {
            const uploadedUrl = await uploadImageToCloudinary(uri, token!);
            if (uploadedUrl) {
                setFormData(prev => ({ ...prev, [field]: uploadedUrl }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload image");
        }
    };

    const uploadAndAddToGallery = async (uri: string, isPrivate: boolean) => {
        try {
            const uploadedUrl = await uploadImageToCloudinary(uri, token!);
            if (uploadedUrl) {
                if (isPrivate) {
                    setNewPrivateAlbum(prev => [...prev, uploadedUrl]);
                } else {
                    setNewGallery(prev => [...prev, uploadedUrl]);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload image");
        }
    };

    const removeImage = (type: 'gallery' | 'privateAlbum', index: number, isNew: boolean) => {
        if (type === 'gallery') {
            if (isNew) {
                setNewGallery(prev => prev.filter((_, i) => i !== index));
            } else {
                setGallery(prev => prev.filter((_, i) => i !== index));
            }
        } else {
            if (isNew) {
                setNewPrivateAlbum(prev => prev.filter((_, i) => i !== index));
            } else {
                setPrivateAlbum(prev => prev.filter((_, i) => i !== index));
            }
        }
    };

    const toggleLookingFor = (option: string) => {
        setFormData(prev => {
            const current = prev.lookingFor;
            if (current.includes(option)) {
                return { ...prev, lookingFor: current.filter(item => item !== option) };
            } else {
                return { ...prev, lookingFor: [...current, option] };
            }
        });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "Name is required");
            return;
        }

        setSaving(true);
        try {
            const updateData: any = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : null,
                height: formData.height ? parseInt(formData.height) : null,
                weight: formData.weight ? parseInt(formData.weight) : null,
                // Send gallery updates
                existingGallery: gallery,
                newGallery: newGallery,
                // Send private album updates
                existingPrivateAlbum: privateAlbum,
                newPrivateAlbum: newPrivateAlbum,
            };

            // Only send img if changed
            if (initialData && formData.img === initialData.img) {
                delete updateData.img;
            }

            // Only send cover if changed
            if (initialData && formData.cover === initialData.cover) {
                delete updateData.cover;
            }

            await updateUser(authUser._id, updateData, token!);

            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.tint} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Cover Image */}
                <TouchableOpacity style={styles.coverContainer} onPress={() => pickImage('cover')}>
                    <Image
                        source={{ uri: formData.cover || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800' }}
                        style={styles.coverImage}
                        contentFit="cover"
                    />
                    <View style={styles.editIconOverlay}>
                        <MaterialIcons name="edit" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => pickImage('avatar')}>
                        <Image
                            source={{ uri: formData.img || 'https://via.placeholder.com/150' }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <View style={styles.editAvatarOverlay}>
                            <MaterialIcons name="camera-alt" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.bio}
                            onChangeText={(text) => setFormData({ ...formData, bio: text })}
                            placeholder="Tell something about yourself..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.age}
                                onChangeText={(text) => setFormData({ ...formData, age: text })}
                                placeholder="Age"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.height}
                                onChangeText={(text) => setFormData({ ...formData, height: text })}
                                placeholder="Height"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.weight}
                                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                                placeholder="Weight"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Country</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setCountryModalVisible(true)}
                        >
                            <Text style={[styles.dropdownText, !formData.country && { color: '#666' }]}>
                                {formData.country || 'Select Country'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Looking For</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setLookingForModalVisible(true)}
                        >
                            <Text style={[styles.dropdownText, formData.lookingFor.length === 0 && { color: '#666' }]}>
                                {formData.lookingFor.length > 0 ? formData.lookingFor.join(', ') : 'Select Options'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* Photos Gallery */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Public Photos</Text>
                            <TouchableOpacity onPress={() => pickImage('gallery')}>
                                <MaterialIcons name="add-a-photo" size={24} color={Colors.dark.tint} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.photoGrid}>
                            {/* Existing Gallery */}
                            {gallery.map((img, index) => (
                                <View key={`existing-${index}`} style={styles.photoItem}>
                                    <Image source={{ uri: img }} style={styles.photo} contentFit="cover" />
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => removeImage('gallery', index, false)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {/* New Gallery */}
                            {newGallery.map((img, index) => (
                                <View key={`new-${index}`} style={styles.photoItem}>
                                    <Image source={{ uri: img }} style={styles.photo} contentFit="cover" />
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>New</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => removeImage('gallery', index, true)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Private Album */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Private Album (Max 3)</Text>
                            <TouchableOpacity onPress={() => pickImage('privateAlbum')}>
                                <MaterialIcons name="add-a-photo" size={24} color={Colors.dark.tint} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.photoGrid}>
                            {/* Existing Private Album */}
                            {privateAlbum.map((img, index) => (
                                <View key={`existing-private-${index}`} style={styles.photoItem}>
                                    <Image source={{ uri: img }} style={styles.photo} contentFit="cover" />
                                    <View style={styles.privateBadge}>
                                        <MaterialIcons name="lock" size={12} color="#fff" />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => removeImage('privateAlbum', index, false)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {/* New Private Album */}
                            {newPrivateAlbum.map((img, index) => (
                                <View key={`new-private-${index}`} style={styles.photoItem}>
                                    <Image source={{ uri: img }} style={styles.photo} contentFit="cover" />
                                    <View style={styles.newBadge}>
                                        <Text style={styles.newBadgeText}>New</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removePhotoButton}
                                        onPress={() => removeImage('privateAlbum', index, true)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Country Selection Modal */}
            <Modal
                visible={countryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCountryModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setFormData({ ...formData, country: item });
                                        setCountryModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        formData.country === item && { color: Colors.dark.tint, fontWeight: 'bold' }
                                    ]}>{item}</Text>
                                    {formData.country === item && (
                                        <MaterialIcons name="check" size={20} color={Colors.dark.tint} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Looking For Selection Modal */}
            <Modal
                visible={lookingForModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLookingForModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Looking For</Text>
                            <TouchableOpacity onPress={() => setLookingForModalVisible(false)}>
                                <Text style={{ color: Colors.dark.tint, fontWeight: 'bold' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={LOOKING_FOR_OPTIONS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => toggleLookingFor(item)}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        formData.lookingFor.includes(item) && { color: Colors.dark.tint, fontWeight: 'bold' }
                                    ]}>{item}</Text>
                                    {formData.lookingFor.includes(item) && (
                                        <MaterialIcons name="check" size={20} color={Colors.dark.tint} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.dark.tint,
        borderRadius: 16,
        minWidth: 60,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    coverContainer: {
        height: 160,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    editIconOverlay: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: Colors.dark.background,
    },
    editAvatarOverlay: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: Colors.dark.tint,
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Colors.dark.background,
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#333',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdownButton: {
        backgroundColor: '#333',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        color: '#fff',
        fontSize: 16,
    },
    section: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoItem: {
        width: '31%', // 3 columns with gap
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#333',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
        padding: 4,
    },
    newBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: Colors.dark.tint,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    newBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    privateBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
        borderRadius: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1e1e1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalItemText: {
        color: '#ccc',
        fontSize: 16,
    },
});
