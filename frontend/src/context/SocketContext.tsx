import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import SocketService from '../services/socketService';

interface SocketContextType {
    socket: Socket;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketContextProvider');
    }
    return context;
};

interface SocketContextProviderProps {
    children: ReactNode;
    socket: Socket;
}

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({ children, socket }) => {
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext; 