import React, { useEffect } from 'react';
import { RemoteUser } from '../../types/user';

interface UserProps {
    user: RemoteUser;
}

export const User: React.FC<UserProps> = ({ user }) => {
    // Debug log to check if component is receiving user data
    useEffect(() => {
        console.log('User component mounted/updated:', {
            socketId: user.socketId,
            username: user.username,
            props: user,
            hasRequiredFields: {
                hasSocketId: Boolean(user.socketId),
                hasUsername: Boolean(user.username)
            }
        });
    }, [user]);

    // If no user data, show error state
    if (!user || !user.username || !user.socketId) {
        console.error('User component received invalid data:', {
            user,
            hasUser: Boolean(user),
            hasUsername: Boolean(user?.username),
            hasSocketId: Boolean(user?.socketId),
            userType: typeof user
        });
        return (
            <div className="flex items-center space-x-2 p-2 bg-red-900/20 rounded-md">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                    ?
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-red-400">Invalid User Data</span>
                    <pre className="text-xs text-red-400/70 mt-1">
                        {JSON.stringify({
                            user,
                            hasUser: Boolean(user),
                            hasUsername: Boolean(user?.username),
                            hasSocketId: Boolean(user?.socketId),
                            userType: typeof user
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    console.log('User component rendering:', {
        socketId: user.socketId,
        username: user.username
    });

    return (
        <div 
            className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-md transition-colors"
            data-testid={`user-${user.socketId}`}
        >
            <div className="relative">
                <div 
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium"
                    title={user.username}
                >
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div 
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"
                    title="Online"
                />
            </div>
            <div className="flex flex-col">
                <span className="text-sm text-gray-200">{user.username}</span>
            </div>
        </div>
    );
}; 