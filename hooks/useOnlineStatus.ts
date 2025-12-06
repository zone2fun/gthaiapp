import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface OnlineStatusMap {
    [userId: string]: boolean;
}

/**
 * Custom hook for tracking online status of users in real-time
 * 
 * Usage:
 * const { onlineStatus, updateOnlineStatus } = useOnlineStatus();
 * 
 * // Check if user is online
 * const isUserOnline = onlineStatus[userId] ?? user.isOnline;
 */
export const useOnlineStatus = () => {
    const { socket } = useSocket();
    const [onlineStatus, setOnlineStatus] = useState<OnlineStatusMap>({});

    useEffect(() => {
        if (!socket) return;

        // Listen for user status updates
        const handleUserStatus = (data: { userId: string; isOnline: boolean }) => {
            console.log('User status update:', data);
            setOnlineStatus(prev => ({
                ...prev,
                [data.userId]: data.isOnline
            }));
        };

        socket.on('user status', handleUserStatus);

        return () => {
            socket.off('user status', handleUserStatus);
        };
    }, [socket]);

    // Helper function to manually update status (useful for initial data)
    const updateOnlineStatus = (userId: string, isOnline: boolean) => {
        setOnlineStatus(prev => ({
            ...prev,
            [userId]: isOnline
        }));
    };

    // Helper function to get online status with fallback
    const getOnlineStatus = (userId: string, fallback: boolean = false): boolean => {
        return onlineStatus[userId] ?? fallback;
    };

    return {
        onlineStatus,
        updateOnlineStatus,
        getOnlineStatus
    };
};
