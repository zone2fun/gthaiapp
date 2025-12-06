import { useCallback } from 'react';
import { useNetworkError } from '@/contexts/NetworkErrorContext';
import { isNetworkError } from '@/services/api';

/**
 * Custom hook for handling API calls with automatic network error detection
 * 
 * Usage:
 * const handleApiCall = useApiErrorHandler();
 * 
 * // In your async function:
 * await handleApiCall(
 *   async () => {
 *     const result = await someApiCall();
 *     return result;
 *   },
 *   () => {
 *     // Optional: retry callback
 *     // This function will be called when user clicks "Try Again"
 *   }
 * );
 */
export const useApiErrorHandler = () => {
    const { showError } = useNetworkError();

    const handleApiCall = useCallback(
        async <T,>(
            apiCall: () => Promise<T>,
            onRetry?: () => void,
            customErrorMessage?: string
        ): Promise<T | null> => {
            try {
                return await apiCall();
            } catch (error: any) {
                console.error('API call failed:', error);

                // Check if it's a network error
                if (isNetworkError(error)) {
                    showError(
                        customErrorMessage || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
                        onRetry
                    );
                } else {
                    // Re-throw non-network errors so they can be handled by the caller
                    throw error;
                }

                return null;
            }
        },
        [showError]
    );

    return handleApiCall;
};
