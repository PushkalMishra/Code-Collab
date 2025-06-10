import React, { createContext, useContext, useState } from 'react';

type UserStatus = 'CONNECTED' | 'DISCONNECTED';

interface AppContextType {
    status: UserStatus;
    setStatus: (status: UserStatus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<UserStatus>('DISCONNECTED');

    return (
        <AppContext.Provider value={{ status, setStatus }}>
            {children}
        </AppContext.Provider>
    );
}; 