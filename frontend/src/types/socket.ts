export enum SocketEvent {
    USER_JOINED = 'user:joined',
    SYNC_FILE_STRUCTURE = 'file:sync',
    DIRECTORY_CREATED = 'directory:created',
    DIRECTORY_UPDATED = 'directory:updated',
    DIRECTORY_RENAMED = 'directory:renamed',
    DIRECTORY_DELETED = 'directory:deleted',
    FILE_CREATED = 'file:created',
    FILE_UPDATED = 'file:updated',
    FILE_RENAMED = 'file:renamed',
    FILE_DELETED = 'file:deleted',
    CODE_CHANGE = 'code:change',
    CHAT_MESSAGE = 'chat:message',
    EXECUTE_CODE = 'code:execute',
    EXECUTION_RESULT = 'code:result',
    SYNC_DRAWING = 'drawing:sync'
} 