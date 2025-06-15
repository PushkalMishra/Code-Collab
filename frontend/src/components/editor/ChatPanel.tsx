import React from 'react';
import { useSocket } from '../../context/SocketContext';
import SocketService from '../../services/socketService';

interface ChatMessage {
    username: string;
    text: string;
    timestamp: number;
}

interface ChatPanelProps {
    isOpen: boolean;
    chatMessages: Array<ChatMessage>;
    newMessage: string;
    setNewMessage: (message: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, chatMessages, newMessage, setNewMessage }) => {
    const { socket } = useSocket(); // Use the useSocket hook to get the socket instance
    const socketService = SocketService.getInstance();

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketService.emitChatMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <span className="username">{msg.username}:</span>
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}; 