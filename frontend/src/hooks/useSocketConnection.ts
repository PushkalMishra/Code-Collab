import { useState, useEffect } from 'react';
import SocketService from '../services/socketService';
import { useAppContext } from '../context/AppContext';
import { RemoteUser } from '../types/user';

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
    const { setUsers, setSocket } = useAppContext();

    // Helper function to format user data
    const formatUser = (user: any): RemoteUser => {
        console.log('Formatting user data:', {
            original: user,
            formatted: {
                socketId: user.id || user.socketId,
                username: user.username
            }
        });
        return {
            socketId: user.id || user.socketId,
            username: user.username
        };
    };

    useEffect(() => {
        if (roomId && username) {
            console.log('Initializing socket connection:', { roomId, username });
            const socket = socketService.connect(roomId, username);
            console.log('Socket instance created:', socket.id);
            setSocket(socket);

            socket.on('connect', () => {
                console.log('Socket connected successfully:', {
                    socketId: socket.id,
                    roomId,
                    username
                });
                setIsConnected(true);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', {
                    error,
                    roomId,
                    username
                });
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', {
                    reason,
                    socketId: socket.id,
                    roomId,
                    username
                });
                setIsConnected(false);
            });

            // Set up user list update handlers
            socket.on('users-update', (users: any[]) => {
                console.log('Received users-update event:', {
                    event: 'users-update',
                    users,
                    socketId: socket.id
                });
                try {
                    const formattedUsers = users.map(formatUser);
                    console.log('Setting formatted users in context:', {
                        formattedUsers,
                        socketId: socket.id
                    });
                    setUsers(formattedUsers);
                } catch (error) {
                    console.error('Error formatting users:', {
                        error,
                        users,
                        socketId: socket.id
                    });
                }
            });

            socket.on('user-joined', (user: any) => {
                console.log('Received user-joined event:', {
                    event: 'user-joined',
                    user,
                    socketId: socket.id
                });
                try {
                    const formattedUser = formatUser(user);
                    setUsers(prev => {
                        console.log('Updating users list after user joined:', {
                            previousUsers: prev,
                            newUser: formattedUser,
                            socketId: socket.id
                        });
                        if (prev.some(u => u.socketId === formattedUser.socketId)) {
                            console.log('User already exists in list:', formattedUser);
                            return prev;
                        }
                        return [...prev, formattedUser];
                    });
                } catch (error) {
                    console.error('Error handling user joined:', {
                        error,
                        user,
                        socketId: socket.id
                    });
                }
            });

            socket.on('user-left', (user: any) => {
                console.log('Received user-left event:', {
                    event: 'user-left',
                    user,
                    socketId: socket.id
                });
                try {
                    const formattedUser = formatUser(user);
                    setUsers(prev => {
                        console.log('Updating users list after user left:', {
                            previousUsers: prev,
                            leavingUser: formattedUser,
                            socketId: socket.id
                        });
                        return prev.filter(u => u.socketId !== formattedUser.socketId);
                    });
                } catch (error) {
                    console.error('Error handling user left:', {
                        error,
                        user,
                        socketId: socket.id
                    });
                }
            });

            socketService.onChatMessage((message) => {
                setChatMessages(prev => [...prev, message]);
            });

            socketService.onExecutionResult((result) => {
                // Regex to remove ANSI escape codes
                const ansiRegex = /\u001b\[(?:(?:\d*;){0,5}\d*)?[mG]/g;
                const cleanOutput = result.output.replace(ansiRegex, '');
                const cleanError = result.error ? result.error.replace(ansiRegex, '') : undefined;
                setExecutionResult({ output: cleanOutput, error: cleanError });
            });

            return () => {
                console.log('Cleaning up socket connection:', {
                    socketId: socket.id,
                    roomId,
                    username
                });
                socketService.disconnect();
                socket.off('users-update');
                socket.off('user-joined');
                socket.off('user-left');
                socket.off('chat-message');
                socket.off('execution-result');
                setSocket(null);
            };
        }
    }, [roomId, username, setUsers, setSocket]);

    return {
        chatMessages,
        executionResult,
        socketService,
        isConnected
    };
}; 
