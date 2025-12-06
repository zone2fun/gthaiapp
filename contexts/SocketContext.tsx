import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL, getConversations, getUser } from '@/services/api';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    unreadCount: 0,
    refreshUnreadCount: async () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, updateUser, token } = useAuth();
    const userRef = React.useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const refreshUnreadCount = useCallback(async () => {
        if (token) {
            try {
                const conversations = await getConversations(token);
                const totalUnread = conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
                setUnreadCount(totalUnread);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        }
    }, [token]);

    useEffect(() => {
        if (user?._id && token) {
            // Initial fetch
            refreshUnreadCount();

            // Create socket connection
            const newSocket = io(BASE_URL, {
                transports: ['websocket', 'polling'], // Allow both transports
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
                console.log('Emitting setup for user:', user._id);
                newSocket.emit('setup', user);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
            });

            // Listen for photo approved event
            newSocket.on('photo approved', (data: any) => {
                console.log('SOCKET EVENT: photo approved received', data);
                const currentUser = userRef.current;

                if (!currentUser) {
                    console.log('SOCKET DEBUG: No currentUser found in ref');
                    return;
                }

                console.log('SOCKET DEBUG: Comparing IDs:', {
                    eventUserId: data.userId,
                    currentUserId: currentUser._id,
                    match: data.userId === currentUser._id,
                    photoType: data.photoType
                });

                // Update user avatar if it's the current user's photo
                if (String(data.userId) === String(currentUser._id) && data.photoType === 'Avatar') {
                    console.log('SOCKET DEBUG: Updating avatar to', data.photoUrl);
                    const updatedUser = { ...currentUser, img: data.photoUrl };
                    updateUser(updatedUser);
                }
                // Update cover photo if needed
                if (String(data.userId) === String(currentUser._id) && data.photoType === 'Cover Photo') {
                    console.log('SOCKET DEBUG: Updating cover to', data.photoUrl);
                    const updatedUser = { ...currentUser, cover: data.photoUrl };
                    updateUser(updatedUser);
                }
            });

            // Listen for new messages to update unread count
            newSocket.on('message received', (newMessage: any) => {
                // If we are not the sender, increment unread count
                const currentUser = userRef.current;
                if (currentUser && newMessage.sender._id !== currentUser._id) {
                    setUnreadCount(prev => prev + 1);
                }
            });

            setSocket(newSocket);

            // Polling fallback for user updates (every 5 seconds)
            const intervalId = setInterval(async () => {
                const currentUser = userRef.current;
                if (currentUser?._id && token) {
                    try {
                        const userData = await getUser(currentUser._id, token);
                        // Check if avatar or cover changed
                        if (userData.img !== currentUser.img || userData.cover !== currentUser.cover) {
                            console.log('POLLING: User data changed, updating context');
                            updateUser(userData);
                        }
                    } catch (err) {
                        console.error('POLLING ERROR:', err);
                    }
                }
            }, 5000);

            return () => {
                newSocket.disconnect();
                clearInterval(intervalId);
            };
        } else {
            // Cleanup if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
                setUnreadCount(0);
            }
        }
    }, [user?._id, token, refreshUnreadCount]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, unreadCount, refreshUnreadCount }}>
            {children}
        </SocketContext.Provider>
    );
};
