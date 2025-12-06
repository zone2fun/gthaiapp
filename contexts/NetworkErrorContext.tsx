import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NetworkErrorContextType {
    showError: (message?: string, onRetry?: () => void) => void;
    hideError: () => void;
    isVisible: boolean;
    errorMessage: string;
    retryAction?: () => void;
}

const NetworkErrorContext = createContext<NetworkErrorContextType | undefined>(undefined);

export const useNetworkError = () => {
    const context = useContext(NetworkErrorContext);
    if (!context) {
        throw new Error('useNetworkError must be used within NetworkErrorProvider');
    }
    return context;
};

interface NetworkErrorProviderProps {
    children: ReactNode;
}

export const NetworkErrorProvider: React.FC<NetworkErrorProviderProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryAction, setRetryAction] = useState<(() => void) | undefined>(undefined);

    const showError = (message?: string, onRetry?: () => void) => {
        setErrorMessage(message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้\nกรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        setRetryAction(() => onRetry);
        setIsVisible(true);
    };

    const hideError = () => {
        setIsVisible(false);
        setErrorMessage('');
        setRetryAction(undefined);
    };

    return (
        <NetworkErrorContext.Provider
            value={{
                showError,
                hideError,
                isVisible,
                errorMessage,
                retryAction,
            }}
        >
            {children}
        </NetworkErrorContext.Provider>
    );
};
