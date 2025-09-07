# CodeCollab 🚀

**Real-time Collaborative Code Editor**

CodeCollab is a powerful, real-time collaborative code editor and development environment that enables developers and teams to work together seamlessly. Built with modern web technologies, it provides live code synchronization, integrated chat, AI-powered code assistance, and robust file management capabilities.

## ✨ Features

### 🔥 Core Features
- **Real-time Collaboration**: Live code synchronization with multiple users
- **Monaco Editor Integration**: Professional code editor with syntax highlighting
- **Multi-language Support**: JavaScript, TypeScript, Python, C++, Java
- **File Management**: Create, edit, delete, and organize files and folders
- **Room-based Workspaces**: Create or join collaborative coding rooms
- **User Authentication**: Secure JWT-based authentication system

### 💬 Communication
- **Integrated Chat**: Real-time messaging within coding sessions
- **User Presence**: See who's online and actively coding
- **Room Sharing**: Share room URLs with team members

### 🤖 AI-Powered Features
- **AI Copilot**: Get AI assistance for code generation and suggestions
- **Code Execution**: Run code directly in the browser
- **Smart Language Detection**: Automatic language detection for files

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Professional dark theme optimized for coding
- **Toast Notifications**: Non-intrusive success/error notifications
- **File Tabs**: Easy navigation between multiple files

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code editor)
- **State Management**: React Context API
- **Real-time Communication**: Socket.io Client
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Icons**: Heroicons

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **Password Hashing**: bcrypt
- **AI Integration**: Google Generative AI

### DevOps & Deployment
- **Build Tool**: TypeScript Compiler
- **Package Manager**: npm
- **Deployment**: Render (Full-stack deployment)
- **Environment**: Production-ready configuration

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/codecollab.git
cd codecollab
```

### 2. Install Dependencies

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

### 3. Environment Setup

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

### 4. Database Setup

Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3002`

#### Start Frontend (in a new terminal)
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

## 🌐 Deployment

### Deploy to Render

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure the following settings**:

   **Build Command**: `npm run build`
   **Start Command**: `npm start`
   **Environment Variables**:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   ```

4. **Deploy**: Render will automatically build and deploy your application

## 📖 Usage

### Getting Started

1. **Visit the Application**: Open your browser and navigate to the application URL
2. **Create Account**: Click "Get Started" to register a new account
3. **Login**: Use your credentials to log in
4. **Create/Join Room**: 
   - Create a new room with a custom room ID
   - Or join an existing room using a room ID
5. **Start Coding**: Begin collaborative coding with your team!

### Features Guide

#### Creating Files
- Click the "Code" panel in the sidebar
- Use the "+" button to create new files or folders
- Choose your programming language

#### Real-time Collaboration
- Multiple users can edit the same file simultaneously
- See other users' cursors and changes in real-time
- Chat with team members using the integrated chat

#### AI Copilot
- Access the AI Copilot panel
- Enter prompts for code generation
- Get AI-powered suggestions and assistance

#### File Management
- Organize files in folders
- Download entire projects as ZIP files
- Share files with team members

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### File Management
- `GET /api/files/:roomId` - Get files for a room
- `POST /api/files` - Create a new file
- `PUT /api/files/:fileId` - Update file content
- `DELETE /api/files/:fileId` - Delete a file

### WebSocket Events
- `join-room` - Join a collaborative room
- `code-change` - Broadcast code changes
- `chat-message` - Send chat messages
- `copilot-prompt` - AI code generation requests

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Commit Your Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to Your Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Create a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed
- Follow the existing code style

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check if MongoDB is running
- Verify environment variables are set correctly
- Ensure port 3002 is available

#### Frontend Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

#### Authentication Issues
- Check JWT_SECRET is set in environment variables
- Verify MongoDB connection string
- Clear browser localStorage if needed

#### Real-time Features Not Working
- Check Socket.io connection
- Verify backend server is running
- Check browser console for WebSocket errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The code editor that powers VS Code
- [Socket.io](https://socket.io/) - Real-time communication
- [React](https://reactjs.org/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/codecollab/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Coding! 🎉**

Built with ❤️ by the CodeCollab Team
