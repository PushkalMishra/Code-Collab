import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active rooms and their users
interface Room {
  id: string;
  users: Map<string, User>;
}

interface User {
  id: string;
  username: string;
  isCreator: boolean;
}

const rooms = new Map<string, Room>();

app.use(cors());
app.use(express.json());

// Create a new room
app.post('/api/rooms', (req, res) => {
  const roomId = uuidv4();
  const room: Room = {
    id: roomId,
    users: new Map()
  };
  rooms.set(roomId, room);
  res.json({ roomId });
});

// Get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    users: Array.from(room.users.values())
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    console.log(`User ${username} (${socket.id}) attempting to join room ${roomId}`);
    
    let room = rooms.get(roomId);
    
    // Create room if it doesn't exist
    if (!room) {
      room = {
        id: roomId,
        users: new Map()
      };
      rooms.set(roomId, room);
    }

    // Check if username is already taken in the room
    const isUsernameTaken = Array.from(room.users.values()).some(
      user => user.username === username
    );

    if (isUsernameTaken) {
      socket.emit('room-join-error', 'Username is already taken in this room');
      return;
    }

    // Add user to room
    const isCreator = room.users.size === 0; // First user is creator
    const user: User = {
      id: socket.id,
      username,
      isCreator
    };
    
    room.users.set(socket.id, user);
    socket.join(roomId);

    // Notify all users in the room about the new user
    io.to(roomId).emit('users-update', Array.from(room.users.values()));
    io.to(roomId).emit('user-joined', user);

    console.log(`User ${username} (${socket.id}) joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find and remove user from their room
    for (const [roomId, room] of rooms.entries()) {
      const user = room.users.get(socket.id);
      if (user) {
        room.users.delete(socket.id);
        
        // If room is empty, delete it
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          // Notify remaining users
          io.to(roomId).emit('users-update', Array.from(room.users.values()));
          io.to(roomId).emit('user-left', user);
        }
        break;
      }
    }
  });

  // Handle chat messages
  socket.on('chat-message', (message) => {
    const roomId = Array.from(socket.rooms)[1]; // First room is socket's own room
    if (roomId) {
      const user = rooms.get(roomId)?.users.get(socket.id);
      if (user) {
        io.to(roomId).emit('chat-message', {
          username: user.username,
          text: message,
          timestamp: Date.now()
        });
      }
    }
  });

  // Handle code changes
  socket.on('code-change', (code: string, file?: string) => {
    const roomId = Array.from(socket.rooms)[1];
    if (roomId) {
      socket.to(roomId).emit('code-change', code, file);
    }
  });

  // Handle code execution
  socket.on('execute-code', ({ code, language, input }) => {
    console.log('Received execute-code request:', { language, hasCode: code.length > 0, hasInput: input.length > 0 });
    const tempFileName = path.join(__dirname, `${uuidv4()}.${language === 'python' ? 'py' : 'txt'}`);
    console.log(`Attempting to execute ${language} code. Saving to ${tempFileName}`);

    fs.writeFile(tempFileName, code, (err) => {
      if (err) {
        console.error('Failed to write temporary file:', err);
        socket.emit('execution-result', {
          output: '',
          error: `Failed to write code to temporary file: ${err.message}`
        });
        return;
      }

      let command = '';
      switch (language) {
        case 'python':
          command = 'python';
          break;
        // Add other languages here
        default:
          socket.emit('execution-result', {
            output: '',
            error: `Unsupported language: ${language}`
          });
          fs.unlink(tempFileName, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
          });
          return;
      }

      const child = spawn(command, [tempFileName]);
      let output = '';
      let error = '';

      // Write custom input to the child process's stdin
      if (input) {
        console.log('Writing input to stdin:', input);
        child.stdin.write(input);
        child.stdin.end(); // End the stdin stream after writing input
      } else {
        console.log('No input provided for stdin.');
        child.stdin.end(); // Always end stdin if no input or after input
      }

      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log('stdout data received:', data.toString().trim());
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
        console.error('stderr data received:', data.toString().trim());
      });

      child.on('close', (code) => {
        console.log(`Execution finished with code ${code}. Output: ${output}. Error: ${error}`);
        socket.emit('execution-result', {
          output,
          error: error || (code !== 0 ? `Process exited with code ${code}` : null)
        });

        // Clean up the temporary file
        fs.unlink(tempFileName, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
        });
      });

      child.on('error', (spawnError) => {
        console.error(`Failed to start subprocess: ${spawnError.message}`);
        socket.emit('execution-result', {
          output: '',
          error: `Failed to execute code: ${spawnError.message}`
        });
        fs.unlink(tempFileName, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
      });
    });
  });
});

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 