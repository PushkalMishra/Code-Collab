import React, { useState } from 'react';
import { useFile } from '../../context/FileContext';
import { useLanguage } from '../../hooks/useLanguage';
import './CopilotPanel.css';

interface CopilotPanelProps {
}

export const CopilotPanel: React.FC<CopilotPanelProps> = () => {
    const { activeFile } = useFile();
    const { getLanguageFromExtension } = useLanguage();
    const [customInput, setCustomInput] = useState<string>('');
    const [executionResult, setExecutionResult] = useState<{ output: string; error?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExecuteCode = () => {
        if (activeFile) {
            // TODO: Implement actual code execution through socket
            setExecutionResult({
                output: `Executing ${activeFile.name} in ${getLanguageFromExtension(activeFile.name)}...\nThis is a placeholder for actual code execution.`
            });
        }
    };

    const handleGenerateCode = async () => {
        if (!customInput.trim()) return;

        setLoading(true);
        setError(null);
        setExecutionResult(null);

        try {
            const language = activeFile ? getLanguageFromExtension(activeFile.name) : 'javascript';
            const prompt = `Generate ${language} code for the following request: ${customInput}\n\n${activeFile?.content || ''}`;

            const res = await fetch('http://localhost:3002/api/copilot/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            if (res.ok) {
                setExecutionResult({ output: data.generatedCode });
            } else {
                setError(data.message || 'Failed to generate code');
            }
        } catch (err) {
            console.error('Error generating code:', err);
            setError('An error occurred while connecting to the copilot service.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefactorCode = async () => {
        if (!activeFile || !activeFile.content || !activeFile.content.trim()) {
            setError('No code to refactor. Please open a file with content.');
            return;
        }
        if (!customInput.trim()) {
            setError('Please provide refactoring instructions.');
            return;
        }

        setLoading(true);
        setError(null);
        setExecutionResult(null);

        try {
            const language = activeFile ? getLanguageFromExtension(activeFile.name) : 'javascript';
            const prompt = `Refactor the following ${language} code based on these instructions: ${customInput}\n\nCode:\n${activeFile?.content || ''}`;

            const res = await fetch('http://localhost:3002/api/copilot/refactor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            if (res.ok) {
                setExecutionResult({ output: data.refactoredCode });
            } else {
                setError(data.message || 'Failed to refactor code');
            }
        } catch (err) {
            console.error('Error refactoring code:', err);
            setError('An error occurred while connecting to the copilot service.');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="copilot-actions">
                        <button 
                            className="run-button"
                            onClick={handleExecuteCode}
                            disabled={!activeFile || loading}
                        >
                            ▶️ Run Code
                        </button>
                        <button 
                            className="generate-button"
                            onClick={handleGenerateCode}
                            disabled={!activeFile || loading}
                        >
                            Generate Code
                        </button>
                        <button 
                            className="refactor-button"
                            onClick={handleRefactorCode}
                            disabled={!activeFile || loading}
                        >
                            Refactor Code
                        </button>
                    </div>
                </div>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}; 