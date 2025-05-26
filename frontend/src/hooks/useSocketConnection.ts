import { useState, useEffect } from 'react';
import SocketService from '../services/socketService';

interface ChatMessage {
    username: string;
    text: string;
    timestamp: number;
}

interface ExecutionResult {
    output: string;
    error?: string;
}

export const useSocketConnection = (roomId: string, username: string) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketService = SocketService.getInstance();

    useEffect(() => {
        if (roomId && username) {
            const socket = socketService.connect(roomId, username);

            socket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                setIsConnected(false);
            });

            socketService.onChatMessage((message) => {
                setChatMessages(prev => [...prev, message]);
            });

            socketService.onExecutionResult((result) => {
                // Regex to remove ANSI escape codes
                const ansiRegex = /\u001b\[(?:(?:\d*;){0,5}\d*)?[mG]/g;
                const cleanOutput = result.output.replace(ansiRegex, '');
                const cleanError = result.error ? result.error.replace(ansiRegex, '') : '';
                setExecutionResult({ output: cleanOutput, error: cleanError });
            });

            return () => {
                socketService.disconnect();
                socketService.onChatMessage(() => {});
                socketService.onExecutionResult(() => {});
            };
        }
    }, [roomId, username]);

    return {
        chatMessages,
        executionResult,
        socketService,
        isConnected
    };
}; 