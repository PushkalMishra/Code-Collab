import React, { useState, useEffect } from 'react';
import { useFile } from '../../context/FileContext';
import MonacoEditor from '@monaco-editor/react';
import FileTab from './FileTab';
import { detectLanguage } from '../../utils/languageDetect';
import { LanguageType } from '../../hooks/useLanguage';
import SocketService from '../../services/socketService';

interface MainContentAreaProps {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
    executionResult: { output: string; error?: string } | null;
}

const MainContentArea: React.FC<MainContentAreaProps> = ({ language, setLanguage, executionResult }) => {
    const { activeFile, updateFileContent } = useFile();
    const [customInput, setCustomInput] = useState<string>('');
    const socketService = SocketService.getInstance();

    const mapToLanguageType = (lang: string): LanguageType => {
        switch (lang) {
            case 'javascript':
            case 'typescript':
            case 'python':
            case 'cpp':
            case 'java':
                return lang;
            default:
                return 'javascript';
        }
    };

    useEffect(() => {
        if (activeFile?.name) {
            const detected = detectLanguage(activeFile.name);
            setLanguage(mapToLanguageType(detected));
        }
    }, [activeFile, setLanguage]);
    
    const handleEditorChange = (value: string | undefined) => {
        if (activeFile && value !== undefined) {
            updateFileContent(activeFile.id, value);
        }
    };

    const handleExecuteCode = () => {
        if (activeFile) {
            socketService.emitExecuteCode(activeFile.content || '', language, customInput);
        }
    };

    if (!activeFile) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-500">
                Select a file to begin editing.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e]">
            {/* Toolbar */}
            <div className="flex-shrink-0 flex items-center justify-end p-1 bg-[#252526] border-b border-gray-700">
                 <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageType)}
                    className="bg-[#3c3c3c] text-white rounded px-2 py-1 text-xs"
                >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                </select>
                <button 
                    onClick={handleExecuteCode} 
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                    Run Code
                </button>
            </div>

            {/* File Tabs */}
            <div className="flex-shrink-0">
                <FileTab />
            </div>

            {/* Editor */}
            <div className="flex-1 relative overflow-hidden">
                <MonacoEditor
                    key={activeFile.id}
                    path={activeFile.name}
                    defaultValue={activeFile.content || ''}
                    language={language}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
            
            {/* Input/Output */}
            <div className="flex flex-col h-64 flex-shrink-0 border-t border-gray-700">
                <div className="flex-1 p-2 flex flex-col">
                    <h3 className="text-xs text-gray-400 mb-1 flex-shrink-0">Custom Input:</h3>
                    <textarea
                        className="w-full flex-1 bg-[#252526] text-white rounded p-2 text-sm resize-none focus:outline-none"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input..."
                    />
                </div>
                <div className="flex-1 p-2 border-t border-gray-700 flex flex-col">
                    <h3 className="text-xs text-gray-400 mb-1 flex-shrink-0">Execution Result:</h3>
                    <pre className={`w-full flex-1 bg-[#252526] text-white rounded p-2 text-sm overflow-auto ${executionResult?.error ? 'text-red-400' : ''}`}>
                        {executionResult?.error || executionResult?.output || 'No output yet.'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default MainContentArea; 