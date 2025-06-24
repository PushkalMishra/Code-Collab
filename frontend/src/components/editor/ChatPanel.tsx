import React, { useEffect, useRef } from 'react';
import SocketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface ChatMessage {
    username: string;
    text: string;
    timestamp: number;
}

interface ChatPanelProps {
    chatMessages: Array<ChatMessage>;
    newMessage: string;
    setNewMessage: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ chatMessages, newMessage, setNewMessage }) => {
    const socketService = SocketService.getInstance();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user) {
            socketService.emitChatMessage(newMessage);
            setNewMessage('');
        }
    };
    
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-[#36393f] text-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-900">
                <h2 className="text-lg font-semibold text-white">Group Chat</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                    <div key={index} className="flex flex-col p-3 rounded-lg bg-[#2f3136]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-green-400">{msg.username}</span>
                            <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                        </div>
                        <p className="text-white">{msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#36393f]">
                <form onSubmit={handleSendMessage} className="flex items-center bg-[#40444b] rounded-lg p-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Enter a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                    />
                    <button 
                        type="submit"
                        className="p-2 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500"
                        disabled={!newMessage.trim()}
                    >
                        <PaperAirplaneIcon className="h-5 w-5 text-white" />
                    </button>
                </form>
            </div>
        </div>
    );
}; 