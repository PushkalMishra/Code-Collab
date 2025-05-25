import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RemoteUser } from '../types/user';

interface AppContextType {
    users: RemoteUser[];
    setUsers: React.Dispatch<React.SetStateAction<RemoteUser[]>>;
    drawingData: any; // Replace with proper type if needed
    setDrawingData: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppContextProvider');
    }
    return context;
};

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const [users, setUsers] = useState<RemoteUser[]>([]);
    const [drawingData, setDrawingData] = useState<any>(null);

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                drawingData,
                setDrawingData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext; 