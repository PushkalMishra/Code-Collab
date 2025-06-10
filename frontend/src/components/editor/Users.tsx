import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from './User';

export const Users: React.FC = () => {
    const { users } = useAppContext();

    // Debug log to check users data from context
    useEffect(() => {
        console.log('Users component state:', {
            users,
            usersLength: users?.length,
            isArray: Array.isArray(users),
            usersType: typeof users,
            usersKeys: users ? Object.keys(users) : null
        });
    }, [users]);

    // If users is undefined or null, show error
    if (!Array.isArray(users)) {
        console.error('Users component received invalid data:', {
            users,
            type: typeof users,
            isNull: users === null,
            isUndefined: users === undefined
        });
        return (
            <div className="p-2 bg-red-900/20 rounded-md">
                <p className="text-sm text-red-400">Error: Invalid users data</p>
                <pre className="text-xs text-red-400/70 mt-1">
                    {JSON.stringify({ users, type: typeof users }, null, 2)}
                </pre>
            </div>
        );
    }

    if (users.length === 0) {
        console.log('Users component: No users in room');
        return (
            <div className="p-2 bg-gray-800/50 rounded-md">
                <p className="text-sm text-gray-400 text-center py-2">No users in room</p>
            </div>
        );
    }

    console.log('Users component: Rendering user list', {
        userCount: users.length,
        users: users.map(u => ({ socketId: u.socketId, username: u.username }))
    });

    return (
        <div className="space-y-2">
            {users.map((user) => {
                console.log('Rendering user component:', {
                    socketId: user.socketId,
                    username: user.username
                });
                return <User key={user.socketId} user={user} />;
            })}
        </div>
    );
}; 