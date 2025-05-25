import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams, useLocation } from 'react-router-dom';
import SocketService from '../services/socketService';
import './Editor.css';

interface ChatMessage {
  username: string;
  text: string;
  timestamp: number;
}

const SidebarIcon = ({ icon, label, active, onClick }: any) => (
  <div className={`sidebar-icon${active ? ' active' : ''}`} onClick={onClick} title={label}>
    {icon}
  </div>
);

const EditorPage: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState('code');
  const [code, setCode] = useState('// Start coding!');
  const [language, setLanguage] = useState('javascript');
  const [username, setUsername] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<{ output: string; error?: string } | null>(null);
  const socketService = SocketService.getInstance();

  useEffect(() => {
    if (location.state && 'username' in location.state) {
      const username = (location.state as { username: string }).username;
      setUsername(username);
      
      // Connect to socket
      const socket = socketService.connect(roomId!, username);

      // Set up socket listeners
      socketService.onCodeChange((newCode) => {
        setCode(newCode);
      });

      socketService.onChatMessage((message) => {
        setChatMessages(prev => [...prev, message]);
      });

      socketService.onFileList((fileList) => {
        setFiles(fileList);
      });

      socketService.onExecutionResult((result) => {
        setExecutionResult(result);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [location, roomId]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      socketService.emitCodeChange(value);
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketService.emitChatMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleCreateFile = () => {
    const filename = prompt('Enter file name:');
    if (filename) {
      socketService.emitFileCreate(filename);
    }
  };

  const handleExecuteCode = () => {
    socketService.emitExecuteCode(code, language);
  };

  if (!roomId) {
    return <div>Invalid room ID</div>;
  }

  return (
    <div className="editor-container">
      <div className="sidebar">
        <SidebarIcon icon={<span>💻</span>} label="Code" active={activePanel === 'code'} onClick={() => setActivePanel('code')} />
        <SidebarIcon icon={<span>💬</span>} label="Chat" active={activePanel === 'chat'} onClick={() => setActivePanel('chat')} />
        <SidebarIcon icon={<span>🤖</span>} label="Copilot" active={activePanel === 'copilot'} onClick={() => setActivePanel('copilot')} />
      </div>
      <div className="main-panel">
        {activePanel === 'code' && (
          <div className="code-panel">
            <div className="editor-toolbar">
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <button onClick={handleCreateFile}>Create File</button>
              <button>Open File</button>
              <button>Download Code</button>
              <button onClick={handleExecuteCode} className="run-button">▶️ Run Code</button>
            </div>
            <div className="editor-content">
              <MonacoEditor
                height="50vh"
                defaultLanguage={language}
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{ fontSize: 16 }}
              />
              {executionResult && (
                <div className="execution-result">
                  <h3>Output:</h3>
                  <pre>{executionResult.output}</pre>
                  {executionResult.error && (
                    <>
                      <h3>Error:</h3>
                      <pre className="error">{executionResult.error}</pre>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {activePanel === 'chat' && (
          <div className="chat-panel">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <span className="username">{msg.username}: </span>
                  <span className="text">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
        {activePanel === 'copilot' && (
          <div className="copilot-panel">
            <div className="copilot-suggestions">
              {/* AI suggestions will be implemented here */}
              <p>AI suggestions coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage; 