import React, { useState } from 'react';
import { useFileSystem } from '../../context/FileContext';
import { useLanguage } from '../../hooks/useLanguage';
import './CopilotPanel.css';

interface CopilotPanelProps {
    isOpen: boolean;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ isOpen }) => {
    const { activeFile } = useFileSystem();
    const { language } = useLanguage();
    const [customInput, setCustomInput] = useState<string>('');
    const [executionResult, setExecutionResult] = useState<{ output: string; error?: string } | null>(null);

    const handleExecuteCode = () => {
        if (activeFile) {
            // TODO: Implement actual code execution through socket
            setExecutionResult({
                output: `Executing ${activeFile.name} in ${language}...\nThis is a placeholder for actual code execution.`
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="file-panel">
            <div className="file-panel-header">
                <h3>AI Copilot</h3>
                {activeFile && (
                    <div className="active-file-info">
                        <span>Active File: {activeFile.name}</span>
                    </div>
                )}
            </div>
            <div className="copilot-content">
                <div className="copilot-suggestions">
                    <h4>Code Suggestions</h4>
                    <div className="suggestion-list">
                        <div className="suggestion-item">
                            <p>I can help you with:</p>
                            <ul>
                                <li>Code completion and suggestions</li>
                                <li>Debugging assistance</li>
                                <li>Code explanations</li>
                                <li>Best practices</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="input-output-area">
                    <div className="input-section">
                        <h4>Custom Input</h4>
                        <textarea
                            className="custom-input-textarea"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter custom input here (e.g., for input() calls in Python)"
                        />
                    </div>
                    <div className="output-section">
                        <h4>Execution Result</h4>
                        <pre className={`execution-result-pre ${executionResult?.error ? 'error' : ''}`}>
                            {executionResult?.error || executionResult?.output || 'No output yet.'}
                        </pre>
                    </div>
                    <button 
                        className="run-button"
                        onClick={handleExecuteCode}
                        disabled={!activeFile}
                    >
                        ▶️ Run Code
                    </button>
                </div>
            </div>
        </div>
    );
}; 