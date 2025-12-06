import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link, Stack } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { login as apiLogin } from '@/services/api';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const { user, token } = await apiLogin(email, password);
            await login(user, token);
            // Alert.alert('Success', `Welcome back, ${user.name}!`);
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Login failed:', error);
            Alert.alert('Login Failed', error.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);

            // Import Expo auth modules
            const { makeRedirectUri } = await import('expo-auth-session');
            const WebBrowser = await import('expo-web-browser');

            WebBrowser.maybeCompleteAuthSession();

            const redirectUri = makeRedirectUri();
            console.log('Redirect URI:', redirectUri);

            const discovery = {
                authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenEndpoint: 'https://oauth2.googleapis.com/token',
            };

            // Replace with your actual Client ID
            const clientId = '851927648086-bmmmbb21cpaqr9k20dm4dd3umr86mlgq.apps.googleusercontent.com';

            const authUrl = `${discovery.authorizationEndpoint}?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `scope=${encodeURIComponent('openid profile email')}&` +
                `access_type=offline&` +
                `prompt=consent`;

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                const url = new URL(result.url);
                const code = url.searchParams.get('code');

                if (!code) throw new Error('No authorization code received');

                // Exchange code for token
                const tokenResponse = await fetch(discovery.tokenEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `code=${code}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`,
                });

                const tokens = await tokenResponse.json();
                if (!tokens.access_token) throw new Error('Failed to get access token');

                // Get location
                let lat = null, lng = null;
                try {
                    const Location = await import('expo-location');
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const location = await Location.getCurrentPositionAsync({});
                        lat = location.coords.latitude;
                        lng = location.coords.longitude;
                    }
                } catch (e) { console.warn('Location error:', e); }

                // Call backend directly (inline to avoid modifying api.ts)
                const API_URL = 'https://gthai-backend.onrender.com/api';
                const backendRes = await fetch(`${API_URL}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokens.access_token, lat, lng }),
                });

                if (!backendRes.ok) {
                    const errorData = await backendRes.json();
                    throw new Error(errorData.message || 'Google login failed');
                }

                const data = await backendRes.json();
                await login(data.user || data, data.token);
                router.replace('/(tabs)');
            } else if (result.type === 'cancel') {
                console.log('User cancelled');
            }
        } catch (error: any) {
            console.error('Google login failed:', error);
            Alert.alert('Google Login Failed', error.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email or Username"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#888', '#666'] : ['#a607d6', '#d607a6']}
                            style={styles.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or login with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                        <Image
                            source={require('@/assets/images/google_logo.jpg')}
                            style={styles.googleLogo}
                        />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <Link href="/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.registerLink}>Register</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <TouchableOpacity
                        style={styles.backToHomeButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.backToHomeText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    logo: {
        width: '100%',
        height: 120,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors.dark.tint,
        fontSize: 14,
    },
    loginButton: {
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    gradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    dividerText: {
        color: '#888',
        paddingHorizontal: 10,
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 24,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    googleLogo: {
        width: 20,
        height: 20,
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: '#888',
        fontSize: 14,
    },
    registerLink: {
        color: Colors.dark.tint,
        fontSize: 14,
        fontWeight: '600',
    },
    backToHomeButton: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: Colors.dark.tint,
        alignItems: 'center',
    },
    backToHomeText: {
        color: Colors.dark.tint,
        fontSize: 16,
        fontWeight: '600',
    },
});
