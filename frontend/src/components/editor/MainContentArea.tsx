import React, { useState } from 'react';
import { PanelType } from '../sidebar/views/types';
import { LanguageType } from '../../hooks/useLanguage';
import { useFileSystem } from '../../context/FileContext';
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
    const { activeFile, updateFileContent } = useFileSystem();
    const socketService = SocketService.getInstance();
    const [customInput, setCustomInput] = useState<string>('');

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined && activeFile) {
            updateFileContent(activeFile.id, value);
        }
    };

    const handleExecuteCode = () => {
        if (activeFile) {
            socketService.emitExecuteCode(activeFile.content || '', language, customInput);
        }
    };

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
                    {activeFile ? (
                        <MonacoEditor
                            height="100%"
                            language={language}
                            value={activeFile.content || ''}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                        />
                    ) : (
                        <div className="no-file-selected">
                            <p>No file selected. Create or open a file to start coding.</p>
                        </div>
                    )}
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