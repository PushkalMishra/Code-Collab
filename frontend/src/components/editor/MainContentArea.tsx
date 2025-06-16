import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PanelType } from '../sidebar/views/types';
import { LanguageType } from '../../hooks/useLanguage';
import { useFile } from '../../context/FileContext';
import MonacoEditor from '@monaco-editor/react';
import FileTab from './FileTab';
import { useSocket } from '../../context/SocketContext';
import SocketService from '../../services/socketService';
import { ChatPanel } from '../editor/ChatPanel';
import FilePanel from './FilePanel';

interface MainContentAreaProps {
    activePanel: PanelType | null;
    isPanelOpen: boolean;
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
    chatMessages: Array<{ username: string; text: string; timestamp: number }>;
    newMessage: string;
    setNewMessage: (message: string) => void;
    executionResult: { output: string; error?: string } | null;
}

const MainContentArea: React.FC<MainContentAreaProps> = ({
    activePanel,
    isPanelOpen,
    language,
    setLanguage,
    chatMessages,
    newMessage,
    setNewMessage,
    executionResult
}) => {
    const { activeFile, updateFileContent, roomId } = useFile();
    const { socket } = useSocket();
    const socketService = SocketService.getInstance();
    const [customInput, setCustomInput] = useState<string>('');
    const editorRef = useRef<any>(null);
    const resizeTimeoutRef = useRef<NodeJS.Timeout>();

    const handleEditorDidMount = useCallback((editor: any) => {
        editorRef.current = editor;
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.layout();
                }
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    const handleEditorChange = (value: string | undefined) => {
        if (activeFile && value !== undefined) {
            updateFileContent(activeFile.id, value);
            if (socket && roomId) {
                socket.emit('code-change', { roomId, fileId: activeFile.id, code: value });
            }
        }
    };

    const handleExecuteCode = () => {
        if (activeFile) {
            socketService.emitExecuteCode(activeFile.content || '', language, customInput);
        }
    };

    if (!activeFile) {
        return (
            <div className="main-content-area">
                <div className="no-file-selected">
                    No file selected. Please open a file from the file panel.
                </div>
            </div>
        );
    }

    return (
        <div className="main-content-area">
            <div className="editor-content">
                <div className="editor-toolbar">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as LanguageType)}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                    <button onClick={handleExecuteCode} className="run-button">▶️ Run Code</button>
                </div>
                <FileTab />
                <div className="editor-flex-container">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={activeFile.content || ''}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: false,
                            scrollBeyondLastLine: false,
                            fixedOverflowWidgets: true,
                        }}
                    />
                </div>
                <div className="input-output-area">
                    <h3>Custom Input:</h3>
                    <textarea
                        className="custom-input-textarea"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input here (e.g., for input() calls in Python)"
                    />
                    <h3>Execution Result:</h3>
                    <pre className={`execution-result-pre ${executionResult?.error ? 'error' : ''}`}>
                        {executionResult?.error || executionResult?.output || 'No output yet.'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default MainContentArea; 