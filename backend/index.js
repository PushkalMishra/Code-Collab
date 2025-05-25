import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { executors } from './executors/index.js';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
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
    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: '// Start coding!',
        files: [],
        users: [],
        fileStructure: {
          id: 'root',
          name: 'root',
          type: 'directory',
          children: [],
          isOpen: true
        },
        drawingData: null
      };
    }
    rooms[roomId].users.push({ socketId: socket.id, username });
    // Send current code and file list to the new user
    socket.emit('code-change', rooms[roomId].code);
    socket.emit('file-list', rooms[roomId].files);
    // Notify others
    socket.to(roomId).emit('user:joined', { socketId: socket.id, username });
    console.log(`${username} joined room: ${roomId}`);
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
      socket.to(socketId).emit('file:sync', {
        fileStructure: rooms[currentRoom].fileStructure,
        openFiles,
        activeFile
      });
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

  socket.on('file:created', ({ parentDirId, newFile }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('file:created', { parentDirId, newFile });
    }
  });

  socket.on('file:updated', ({ fileId, newContent }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('file:updated', { fileId, newContent });
    }
  });

  socket.on('file:renamed', ({ fileId, newName }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('file:renamed', { fileId, newName });
    }
  });

  socket.on('file:deleted', ({ fileId }) => {
    if (currentRoom) {
      socket.to(currentRoom).emit('file:deleted', { fileId });
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