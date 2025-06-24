import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import SocketService from '../../services/socketService';
import { useTypingEffect } from '../../hooks/useTypingEffect';

export const CopilotPanel: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const socketService = SocketService.getInstance();
    
    const displayedCode = useTypingEffect(generatedCode, 10);

    useEffect(() => {
        const handleCopilotResponse = (code: string) => {
            setIsLoading(false);
            setGeneratedCode(code);
        };

        const handleCopilotError = (error: string) => {
            setIsLoading(false);
            toast.error(`AI Error: ${error}`);
        };

        socketService.onCopilotResponse(handleCopilotResponse);
        socketService.onCopilotError(handleCopilotError);

        return () => {
            // No standard off method in socketService, assuming cleanup is handled elsewhere
        };
    }, [socketService]);

    const handleGenerate = () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setGeneratedCode('');
        socketService.emitCopilotPrompt(prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        toast.success('Code copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full bg-[#36393f] text-gray-200 p-4 space-y-4">
            {/* Header */}
            <div className="pb-2 border-b border-gray-500">
                <h2 className="text-lg font-semibold text-white">Copilot</h2>
            </div>

            {/* Prompt Input */}
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="write the code of sum in c++"
                className="w-full h-24 p-2 bg-[#2f3136] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
            />

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Generating...' : 'Generate Code'}
            </button>

            {/* Response Area */}
            {generatedCode && (
                <div className="flex-1 bg-[#1e1e1e] rounded-md overflow-hidden relative">
                    <div className="p-4 overflow-y-auto h-full">
                         <SyntaxHighlighter language="cpp" style={vscDarkPlus} showLineNumbers>
                            {displayedCode}
                        </SyntaxHighlighter>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600"
                        title="Copy code"
                    >
                        <ClipboardIcon className="h-5 w-5 text-gray-300" />
                    </button>
                </div>
            )}
        </div>
    );
}; 