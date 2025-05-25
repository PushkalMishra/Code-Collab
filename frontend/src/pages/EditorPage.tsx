import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useParams, useLocation } from 'react-router-dom';
import SocketService from '../services/socketService';
import './Editor.css';
import { FileContextProvider, useFileSystem } from '../context/FileContext';
import FileStructureView from '../components/FileStructureView';
import FileTab from '../components/editor/FileTab';
import '../components/FileSystem.css';
import { SocketContextProvider, useSocket } from '../context/SocketContext';
import { AppContextProvider } from '../context/AppContext';

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

// const FileActions: React.FC = () => {
//     const { createFile, downloadFilesAndFolders, fileStructure, createDirectory } = useFileSystem();

//     const handleCreateFile = () => {
//         const filename = prompt('Enter file name:');
//         if (filename && fileStructure?.id) {
//             createFile(fileStructure.id, filename);
//         }
//     };

//     const handleCreateDirectory = () => {
//         const dirName = prompt('Enter directory name:');
//         if (dirName && fileStructure?.id) {
//             createDirectory(fileStructure.id, dirName);
//         }
//     };

//     const handleDownloadAll = () => {
//         downloadFilesAndFolders();
//     };

//     return (
//         <div className="file-actions">
//             <button onClick={handleCreateFile}>- File</button>
//             <button onClick={handleCreateDirectory}>+ Folder</button>
//             <button onClick={handleDownloadAll}>Download All</button>
//         </div>
//     );
// };

const EditorPage: React.FC = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const [activePanel, setActivePanel] = useState('code');
    const [isFilePanelOpen, setIsFilePanelOpen] = useState(true);
    const [code, setCode] = useState('// Start coding!');
    const [language, setLanguage] = useState('javascript');
    const [username, setUsername] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [executionResult, setExecutionResult] = useState<{ output: string; error?: string } | null>(null);
    const socketService = SocketService.getInstance();

    useEffect(() => {
        if (location.state && 'username' in location.state) {
            const username = (location.state as { username: string }).username;
            setUsername(username);

            socketService.connect(roomId!, username);

            socketService.onChatMessage((message) => {
                setChatMessages(prev => [...prev, message]);
            });

            socketService.onCodeChange((newCode) => {
                setCode(newCode);
            });

            socketService.onExecutionResult((result) => {
                // Regex to remove ANSI escape codes
                const ansiRegex = /\u001b\[(?:(?:\d*;){0,5}\d*)?[mG]/g;
                const cleanOutput = result.output.replace(ansiRegex, '');
                const cleanError = result.error ? result.error.replace(ansiRegex, '') : '';
                setExecutionResult({ output: cleanOutput, error: cleanError });
            });

            return () => {
                socketService.disconnect();
                socketService.onCodeChange(() => {});
                socketService.onChatMessage(() => {});
                socketService.onExecutionResult(() => {});
            };
        }
    }, [location, roomId, socketService]);

    const handleCodeChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
            socketService.emitCodeChange(value);
        }
    }, [socketService]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketService.emitChatMessage(newMessage);
            setNewMessage('');
        }
    };

    const handleExecuteCode = () => {
        console.log('Executing code:', { code: code, language: language });
        socketService.emitExecuteCode(code, language);
    };

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    const socket = socketService.getSocket();

    if (!socket) {
        return <div>Connecting to server...</div>;
    }

    return (
        <AppContextProvider>
            <SocketContextProvider socket={socket}>
                <FileContextProvider>
                    <div className="editor-container">
                        <div className="sidebar">
                            <SidebarIcon
                                icon={<span>📄</span>}
                                label="Files"
                                active={activePanel === 'code'}
                                onClick={() => {
                                    setActivePanel('code');
                                    setIsFilePanelOpen(!isFilePanelOpen);
                                }}
                            />
                            <SidebarIcon
                                icon={<span>💬</span>}
                                label="Chat"
                                active={activePanel === 'chat'}
                                onClick={() => {
                                    setActivePanel('chat');
                                    setIsFilePanelOpen(false);
                                }}
                            />
                            <SidebarIcon
                                icon={<span>🤖</span>}
                                label="Copilot"
                                active={activePanel === 'copilot'}
                                onClick={() => {
                                    setActivePanel('copilot');
                                    setIsFilePanelOpen(false);
                                }}
                            />
                        </div>

                        {isFilePanelOpen && (
                            <div className="file-panel">
                                {/* <FileActions /> */}
                                <FileStructureView />
                            </div>
                        )}

                        <div className={`main-content-area ${isFilePanelOpen ? 'file-panel-open' : ''}`}>
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
                                        <p>AI suggestions coming soon...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </FileContextProvider>
            </SocketContextProvider>
        </AppContextProvider>
    );
};

export default EditorPage; 