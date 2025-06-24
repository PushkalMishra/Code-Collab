import { io, Socket } from 'socket.io-client';
import { FileContent, Id } from '../types/file'; // Import necessary types
import { SocketEvent } from '../types/socket'; // Import SocketEvent enum
import { RemoteUser } from '../types/user';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private currentRoomId: string | null = null;
  private currentUsername: string | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(roomId: string, username: string): Socket {
    if (!this.socket) {
      this.currentRoomId = roomId;
      this.currentUsername = username;

      this.socket = io('http://localhost:3002', {
        query: { roomId, username },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        // Explicitly join the room after connection
        this.joinRoom(roomId, username);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.currentRoomId = null;
        this.currentUsername = null;
      });

      this.socket.on('room-join-error', (error: string) => {
        console.error('Failed to join room:', error);
      });
    } else if (this.currentRoomId !== roomId || this.currentUsername !== username) {
      // If already connected but room/username changed, disconnect and reconnect
      this.disconnect();
      return this.connect(roomId, username);
    }
    return this.socket;
  }

  private joinRoom(roomId: string, username: string) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, username });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
      this.currentUsername = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Code synchronization
  onCodeChange(handler: (code: string, file?: string) => void): void {
    this.socket?.on('code-change', (code: string, file?: string) => {
      handler(code, file);
    });
  }

  emitCodeChange(code: string, file?: string): void {
    this.socket?.emit('code-change', code, file);
  }

  // Chat functionality
  onChatMessage(callback: (message: { username: string; text: string; timestamp: number }) => void) {
    this.socket?.on('chat-message', callback);
  }

  emitChatMessage(text: string) {
    this.socket?.emit('chat-message', text);
  }

  // File management
  onFileList(callback: (files: string[]) => void) {
    this.socket?.on('file-list', callback);
  }

  emitFileCreate(filename: string) {
    this.socket?.emit('file-create', filename);
  }

  emitFileDelete(filename: string) {
    this.socket?.emit('file-delete', filename);
  }

  emitFileOpen(filename: string): void {
    this.socket?.emit('open-file', filename);
  }

  emitFileUploaded(filename: string, content: string): void {
    this.socket?.emit('upload-file', { filename, content });
  }

  // Add methods for file content synchronization
  onFileUpdated(handler: (fileId: Id, newContent: FileContent) => void): void {
    this.socket?.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }: { fileId: Id, newContent: FileContent }) => {
      handler(fileId, newContent);
    });
  }

  emitFileUpdated(fileId: Id, newContent: FileContent): void {
    this.socket?.emit(SocketEvent.FILE_UPDATED, { fileId, newContent });
  }

  // Code execution
  onExecutionResult(callback: (result: { output: string; error?: string }) => void) {
    this.socket?.on('execution-result', callback);
  }

  emitExecuteCode(code: string, language: string, input: string = '') {
    this.socket?.emit('execute-code', { code, language, input });
  }

  // Copilot functionality
  emitCopilotPrompt(prompt: string) {
    this.socket?.emit('copilot-prompt', prompt);
  }

  onCopilotResponse(callback: (response: string) => void) {
    this.socket?.on('copilot-response', callback);
  }

  onCopilotError(callback: (error: string) => void) {
    this.socket?.on('copilot-error', callback);
  }

  // User list synchronization
  onUsersUpdate(callback: (users: RemoteUser[]) => void) {
    this.socket?.on('users-update', callback);
  }

  onUserJoined(callback: (user: RemoteUser) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (user: RemoteUser) => void) {
    this.socket?.on('user-left', callback);
  }
}

export default SocketService; 