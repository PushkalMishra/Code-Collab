import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User';
import fileRoutes from './routes/files'; // Updated import path for files.ts
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection URL from environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecollab';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

// Integrate file routes
app.use('/api/files', fileRoutes);

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

// Add this type above the io.on('connection')
type PistonRunResult = {
  run: {
    stdout: string;
    stderr: string;
    code: number;
  };
};

// Add this helper function above io.on('connection')
function getExtensionForLanguage(language: string): string {
  switch (language) {
    case "python3": return "py";
    case "javascript": return "js";
    case "typescript": return "ts";
    case "cpp": return "cpp";
    case "java": return "java";
    default: return "txt";
  }
}

// Add this version map above io.on('connection')
const versionMap: Record<string, string> = {
  python3: "3.10.0",
  javascript: "15.10.0",
  typescript: "4.2.3",
  cpp: "10.2.0",
  java: "15.0.2",
};

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
      io.to(roomId).emit('code-change', code, file);
    }
  });

  // Handle file creation
  socket.on('file-created', (fileData) => {
    const roomId = Array.from(socket.rooms)[1];
    if (roomId) {
      io.to(roomId).emit('file-created', fileData);
      console.log(`File created in room ${roomId}:`, fileData);
    }
  });

  // Handle file updates
  socket.on('file-updated', (fileData) => {
    const roomId = Array.from(socket.rooms)[1];
    if (roomId) {
      io.to(roomId).emit('file-updated', fileData);
      console.log(`File updated in room ${roomId}:`, fileData);
    }
  });

  // Handle file deletion
  socket.on('file-deleted', (fileId) => {
    const roomId = Array.from(socket.rooms)[1];
    if (roomId) {
      io.to(roomId).emit('file-deleted', fileId);
      console.log(`File deleted in room ${roomId}:`, fileId);
    }
  });

  // Handle code execution
  socket.on('execute-code', async ({ code, language, input }) => {
    try {
      // Map frontend language to Piston API language
      const languageMap: Record<string, string> = {
        python: 'python3',
        javascript: 'javascript',
        typescript: 'typescript',
        cpp: 'cpp',
        java: 'java',
      };
      const pistonLanguage = languageMap[language] || language;
      const pistonVersion = versionMap[pistonLanguage] || "latest";
      const payload = {
        language: pistonLanguage,
        version: pistonVersion,
        files: [
          {
            name: `Main.${getExtensionForLanguage(pistonLanguage)}`,
            content: code,
          },
        ],
        stdin: input || '',
      };
      const response = await axios.post<PistonRunResult>('https://emkc.org/api/v2/piston/execute', payload);
      const run = response.data.run;
      socket.emit('execution-result', {
        output: run.stdout,
        error: run.stderr || (run.code !== 0 ? `Process exited with code ${run.code}` : ''),
      });
    } catch (e: any) {
      socket.emit('execution-result', {
        output: '',
        error: e?.response?.data?.message || e.message || 'Execution failed',
      });
    }
  });

  // Handle copilot prompts
  socket.on('copilot-prompt', async (prompt: string) => {
    try {
      // console.log('Received copilot prompt:', prompt);
      
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Create a system prompt for code generation
      const systemPrompt = `You are a helpful AI coding assistant. Generate clean, efficient, reponse based on the user's request.`;
      
      const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
      
      // Generate content
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const generatedCode = response.text();
      
      // console.log('Generated code:', generatedCode);
      
      // Send the response back to the client
      socket.emit('copilot-response', generatedCode);
      
    } catch (error: any) {
      console.error('Error generating code with Gemini:', error);
      socket.emit('copilot-error', error.message || 'Failed to generate code');
    }
  });
});

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with that username or email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'supersecretjwtkey', // Use a strong secret from environment variables
      { expiresIn: '24hr' } // Token expires in 1 hour
    );

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      username: user.username,
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});