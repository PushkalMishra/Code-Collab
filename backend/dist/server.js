"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const files_1 = __importDefault(require("./routes/files")); // Updated import path for files.ts
const axios_1 = __importDefault(require("axios"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// MongoDB connection URL from environment variable or default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecollab';
// Connect to MongoDB
mongoose_1.default.connect(MONGODB_URI, {
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
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const rooms = new Map();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Integrate file routes
app.use('/api/files', files_1.default);
// Create a new room
app.post('/api/rooms', (req, res) => {
    const roomId = (0, uuid_1.v4)();
    const room = {
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
// Add this helper function above io.on('connection')
function getExtensionForLanguage(language) {
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
const versionMap = {
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
        const isUsernameTaken = Array.from(room.users.values()).some(user => user.username === username);
        if (isUsernameTaken) {
            socket.emit('room-join-error', 'Username is already taken in this room');
            return;
        }
        // Add user to room
        const isCreator = room.users.size === 0; // First user is creator
        const user = {
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
                }
                else {
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
    socket.on('code-change', (code, file) => {
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
            const languageMap = {
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
            const response = await axios_1.default.post('https://emkc.org/api/v2/piston/execute', payload);
            const run = response.data.run;
            socket.emit('execution-result', {
                output: run.stdout,
                error: run.stderr || (run.code !== 0 ? `Process exited with code ${run.code}` : ''),
            });
        }
        catch (e) {
            socket.emit('execution-result', {
                output: '',
                error: e?.response?.data?.message || e.message || 'Execution failed',
            });
        }
    });
    // Handle copilot prompts
    socket.on('copilot-prompt', async (prompt) => {
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
        }
        catch (error) {
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
        const existingUser = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with that username or email already exists.' });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10); // Salt rounds = 10
        // Create new user
        const newUser = new User_1.default({
            username,
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    }
    catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        // Compare password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET || 'supersecretjwtkey', // Use a strong secret from environment variables
        { expiresIn: '24hr' } // Token expires in 1 hour
        );
        res.status(200).json({
            message: 'Logged in successfully.',
            token,
            username: user.username,
            userId: user._id,
            email: user.email
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/build')));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/build', 'index.html'));
});
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
