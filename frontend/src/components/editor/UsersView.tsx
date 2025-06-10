import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { Users } from './Users';
import './UsersView.css';

export const UsersView: React.FC = () => {
    const navigate = useNavigate();
    const { socket, setStatus, users } = useAppContext();

    const getJoinUrl = () => {
        const currentUrl = window.location.href;
        const editorUrl = new URL(currentUrl);
        const roomId = editorUrl.pathname.split('/').pop();
        return `${window.location.origin}/join/${roomId}`;
    };

    const handleShareUrl = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'CodeCollab Room',
                    url: getJoinUrl()
                });
                toast.success('URL shared successfully!');
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (error) {
            toast.error('Failed to share URL');
            console.error('Share error:', error);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(getJoinUrl());
            toast.success('URL copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy URL');
            console.error('Copy error:', error);
        }
    };

    const handleLeaveRoom = () => {
        if (socket) {
            socket.disconnect();
        }
        setStatus('DISCONNECTED');
        navigate('/');
        toast.success('Left the room successfully');
    };

    return (
        <div className="users-view bg-gray-800 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[320px]">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <span>Users in Room</span>
                    <span className="text-sm text-gray-400">({users?.length || 0})</span>
                </h3>
                <div className="border-t border-gray-700 pt-2">
                    <Users />
                </div>
            </div>
            <div className="space-y-2 border-t border-gray-700 pt-4">
                <button 
                    className="action-button share-button w-full"
                    onClick={handleShareUrl}
                >
                    <span>Share URL</span>
                </button>
                <button 
                    className="action-button copy-button w-full"
                    onClick={handleCopyUrl}
                >
                    <span>Copy URL</span>
                </button>
                <button 
                    className="action-button leave-button w-full"
                    onClick={handleLeaveRoom}
                >
                    <span>Leave Room</span>
                </button>
            </div>
        </div>
    );
}; 