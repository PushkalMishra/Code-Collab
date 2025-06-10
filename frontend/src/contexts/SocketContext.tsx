import React, { createContext, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context.socket;
};

export const SocketProvider: React.FC<{ socket: Socket | null; children: React.ReactNode }> = ({ 
    socket, 
    children 
}) => {
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}; 