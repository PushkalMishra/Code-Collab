import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RemoteUser } from '../types/user';
import { Socket } from 'socket.io-client';

type UserStatus = 'CONNECTED' | 'DISCONNECTED';

interface AppContextType {
    users: RemoteUser[];
    setUsers: React.Dispatch<React.SetStateAction<RemoteUser[]>>;
    drawingData: any; // Replace with proper type if needed
    setDrawingData: React.Dispatch<React.SetStateAction<any>>;
    socket: Socket | null;
    setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
    roomId: string | null;
    setRoomId: React.Dispatch<React.SetStateAction<string | null>>;
    status: UserStatus;
    setStatus: (status: UserStatus) => void;
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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [status, setStatus] = useState<UserStatus>('DISCONNECTED');

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                drawingData,
                setDrawingData,
                socket,
                setSocket,
                roomId,
                setRoomId,
                status,
                setStatus,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext; 