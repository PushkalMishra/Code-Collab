export interface RemoteUser {
    socketId: string;
    username: string;
    _id?: string; // This is the MongoDB user ID, added for consistent user identification
} 