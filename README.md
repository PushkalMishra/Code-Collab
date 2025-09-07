CodeCollab 🚀

Real-time Collaborative Code Editor**

CodeCollab is a powerful, real-time collaborative code editor and development environment that enables developers and teams to work together seamlessly. Built with modern web technologies, it provides live code synchronization, integrated chat, AI-powered code assistance, and robust file management capabilities.

Features

Core Features
- **Real-time Collaboration**: Live code synchronization with multiple users
- **Monaco Editor Integration**: Professional code editor with syntax highlighting
- **Multi-language Support**: JavaScript, TypeScript, Python, C++, Java
- **File Management**: Create, edit, delete, and organize files and folders
- **Room-based Workspaces**: Create or join collaborative coding rooms
- **User Authentication**: Secure JWT-based authentication system

Communication
- **Integrated Chat**: Real-time messaging within coding sessions
- **User Presence**: See who's online and actively coding
- **Room Sharing**: Share room URLs with team members

AI-Powered Features
- **AI Copilot**: Get AI assistance for code generation and suggestions
- **Code Execution**: Run code directly in the browser
- **Smart Language Detection**: Automatic language detection for files

User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Professional dark theme optimized for coding
- **Toast Notifications**: Non-intrusive success/error notifications
- **File Tabs**: Easy navigation between multiple files

Tech Stack

Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code editor)
- **State Management**: React Context API
- **Real-time Communication**: Socket.io Client
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **Password Hashing**: bcrypt
- **AI Integration**: Google Generative AI


Installation

1. Clone the Repository
```bash
git clone https://github.com/yourusername/codecollab.git
cd codecollab
```

2. Install Dependencies

#### Option A: Install All Dependencies (Recommended)
```bash
npm run build
```
This command will automatically install dependencies for both frontend and backend.

#### Option B: Manual Installation
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/codecollab
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/codecollab

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=3002

# Google AI API Key (for Copilot feature)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

4. Database Setup

Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```
Running the Application

Development Mode

Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3002`

Start Frontend (in a new terminal)
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

### Production Mode

#### Build and Start
```bash
# Build both frontend and backend
npm run build

# Start the production server
npm start
```

The application will be available at `http://localhost:3002`


Getting Started

1. **Visit the Application**: Open your browser and navigate to the application URL
2. **Create Account**: Click "Get Started" to register a new account
3. **Login**: Use your credentials to log in
4. **Create/Join Room**: 
   - Create a new room with a custom room ID
   - Or join an existing room using a room ID
5. **Start Coding**: Begin collaborative coding with your team!

Features Guide

Creating Files
- Click the "Code" panel in the sidebar
- Use the "+" button to create new files or folders
- Choose your programming language

Real-time Collaboration
- Multiple users can edit the same file simultaneously
- See other users' cursors and changes in real-time
- Chat with team members using the integrated chat

AI Copilot
- Access the AI Copilot panel
- Enter prompts for code generation
- Get AI-powered suggestions and assistance

File Management
- Organize files in folders
- Download entire projects as ZIP files
- Share files with team members







