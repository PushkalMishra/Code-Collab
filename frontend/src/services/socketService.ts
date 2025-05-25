import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(roomId: string, username: string) {
    if (!this.socket) {
      this.socket = io('http://localhost:3002', {
        query: { roomId, username }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
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

  // Code execution
  onExecutionResult(callback: (result: { output: string; error?: string }) => void) {
    this.socket?.on('execution-result', callback);
  }

  emitExecuteCode(code: string, language: string) {
    this.socket?.emit('execute-code', { code, language });
  }
}

export default SocketService; 