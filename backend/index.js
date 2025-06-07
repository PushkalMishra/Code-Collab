import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { executors } from './executors/index.js';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import File from './models/File.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
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

app.use(cors());
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// In-memory room state
const rooms = {};

// Helper function to execute TypeScript
async function executeTypeScript(code) {
  const tempDir = join(process.cwd(), 'temp');
  const filename = `${uuidv4()}`;
  const sourceFile = `${filename}.ts`;
  const jsFile = `${filename}.js`;
  const sourcePath = join(tempDir, sourceFile);
  const jsPath = join(tempDir, jsFile);

  try {
    // Write code to temporary file
    await writeFile(sourcePath, code);

    // Compile and execute the code
    return new Promise((resolve, reject) => {
      // First compile TypeScript to JavaScript
      exec(`tsc ${sourcePath} --outFile ${jsPath}`, async (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          // Clean up
          await unlink(sourcePath).catch(console.error);
          resolve({ output: '', error: compileError.message });
          return;
        }

        // Then run the JavaScript
        exec(`node ${jsPath}`, async (runError, runStdout, runStderr) => {
          // Clean up both files
          await Promise.all([
            unlink(sourcePath).catch(console.error),
            unlink(jsPath).catch(console.error)
          ]);

          if (runError) {
            resolve({ output: '', error: runError.message });
          } else if (runStderr) {
            resolve({ output: '', error: runStderr });
          } else {
            resolve({ output: runStdout.trim(), error: '' });
          }
        });
      });
    });
  } catch (error) {
    return { output: '', error: error.message };
  }
}

io.on('connection', (socket) => {
  let currentRoom = null;
  let currentUser = null;

  // Parse roomId and username from query
  const { roomId, username } = socket.handshake.query;
  if (roomId && username) {
    currentRoom = roomId;
    currentUser = username;
    socket.join(roomId);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        fileStructure: {
          id: 'root',
          name: 'root',
          type: 'directory',
          children: [],
          isOpen: true
        }
      };
    }

    // Add user to room
    rooms[roomId].users.push({ socketId: socket.id, username });

    // Load files from MongoDB for this room
    File.find({ roomId }).then(files => {
      // Convert flat file structure to tree
      const fileMap = new Map();
      const root = {
        id: 'root',
        name: 'root',
        type: 'directory',
        children: [],
        isOpen: true
      };
      fileMap.set('root', root);

      files.forEach(file => {
        const fileNode = {
          id: file.id,
          name: file.name,
          type: file.type,
          content: file.content,
          children: file.type === 'directory' ? [] : undefined,
          isOpen: file.type === 'directory' ? false : undefined
        };
        fileMap.set(file.id, fileNode);

        if (file.parentId) {
          const parent = fileMap.get(file.parentId);
          if (parent && parent.children) {
            parent.children.push(fileNode);
          }
        } else {
          root.children.push(fileNode);
        }
      });

      rooms[roomId].fileStructure = root;
      
      // Send current file structure to the new user
      socket.emit('file:sync', {
        fileStructure: root,
        openFiles: [],
        activeFile: null
      });

      // Notify others
      socket.to(roomId).emit('user:joined', { socketId: socket.id, username });
      console.log(`${username} joined room: ${roomId}`);
    });
  }

  // Real-time code sync
  socket.on('code-change', (code) => {
    if (currentRoom) {
      rooms[currentRoom].code = code;
      socket.to(currentRoom).emit('code-change', code);
    }
  });

  // Chat
  socket.on('chat-message', (text) => {
    if (currentRoom && currentUser) {
      const message = { username: currentUser, text, timestamp: Date.now() };
      io.to(currentRoom).emit('chat-message', message);
    }
  });

  // File system events
  socket.on('file:sync', ({ fileStructure, openFiles, activeFile, socketId }) => {
    if (currentRoom && socketId) {
      try {
        socket.to(socketId).emit('file:sync', {
          fileStructure: rooms[currentRoom].fileStructure,
          openFiles,
          activeFile
        });
      } catch (error) {
        console.error('Error syncing files:', error);
        socket.emit('error', { message: 'Failed to sync files' });
      }
    }
  });

  socket.on('directory:created', ({ parentDirId, newDirectory }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('directory:created', { parentDirId, newDirectory });
    }
  });

  socket.on('directory:updated', ({ dirId, children }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('directory:updated', { dirId, children });
    }
  });

  socket.on('directory:renamed', ({ dirId, newDirName }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('directory:renamed', { dirId, newDirName });
    }
  });

  socket.on('directory:deleted', ({ dirId }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('directory:deleted', { dirId });
    }
  });

  socket.on('file:created', async ({ parentDirId, newFile }) => {
    if (currentRoom) {
      try {
        await File.create({
          id: newFile.id,
          name: newFile.name,
          type: newFile.type,
          content: newFile.content || '',
          parentId: parentDirId,
          roomId: currentRoom
        });
        socket.to(currentRoom).emit('file:created', { parentDirId, newFile });
      } catch (error) {
        console.error('Error creating file:', error);
        socket.emit('error', { message: 'Failed to create file' });
      }
    }
  });

  socket.on('file:updated', async ({ fileId, newContent }) => {
    if (currentRoom) {
      try {
        await File.findOneAndUpdate(
          { id: fileId, roomId: currentRoom },
          { content: newContent },
          { new: true, maxTimeMS: 5000 }
        );
        socket.to(currentRoom).emit('file:updated', { fileId, newContent });
      } catch (error) {
        console.error('Error updating file:', error);
        socket.emit('error', { message: 'Failed to update file' });
      }
    }
  });

  socket.on('file:renamed', ({ fileId, newName }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('file:renamed', { fileId, newName });
    }
  });

  socket.on('file:deleted', async ({ fileId }) => {
    if (currentRoom) {
      try {
        await File.deleteOne({ id: fileId, roomId: currentRoom });
        socket.to(currentRoom).emit('file:deleted', { fileId });
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  });

  socket.on('drawing:sync', ({ drawingData, socketId }) => {
    if (currentRoom && socketId) {
      socket.to(socketId).emit('drawing:sync', { drawingData: rooms[currentRoom].drawingData });
    }
  });

  // Code execution
  socket.on('execute-code', async ({ code, language }) => {
    try {
      let result;
      if (language === 'typescript') {
        result = await executeTypeScript(code);
      } else {
        const executor = executors[language];
        if (!executor) {
          result = { output: '', error: `Language ${language} is not supported` };
        } else {
          result = await executor(code);
        }
      }
      socket.emit('execution-result', result);
    } catch (error) {
      socket.emit('execution-result', { output: '', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && currentUser) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(u => u.username !== currentUser);
      socket.to(currentRoom).emit('user-left', currentUser);
    }
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 