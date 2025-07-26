import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../../pages/Editor.css';
import Sidebar from '../sidebar/Sidebar';
import FilePanel from './FilePanel';
import { ChatPanel } from './ChatPanel';
import { UsersPanel } from './UsersPanel';
import { CopilotPanel } from './CopilotPanel';
import MainContentArea from './MainContentArea';
import { useSocketConnection } from '../../hooks/useSocketConnection';
import { usePanelManagement } from '../../hooks/usePanelManagement';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const EditorContent: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const username = location.state?.username || 'Anonymous';
    console.log('EditorPage: Username from location state:', username);
    const [newMessage, setNewMessage] = useState('');

    // Custom hooks
    const { activePanel, isPanelOpen, switchPanel, togglePanel } = usePanelManagement();
    const { language, changeLanguage } = useLanguage();
    const { chatMessages, executionResult, socketService, isConnected } = useSocketConnection(roomId || '', username);

    const { socket } = useAppContext();

    // if (!isConnected) {
    //     toast.error('Disconnected from server. Please refresh the page.');
    // }

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    const renderPanel = () => {
        if (!isPanelOpen) return null;
        switch (activePanel) {
            case 'code':
                return <FilePanel />;
            case 'chat':
                return <ChatPanel chatMessages={chatMessages} newMessage={newMessage} setNewMessage={setNewMessage} />;
            case 'users':
                return <UsersPanel />;
            case 'copilot':
                return <CopilotPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-[#1e1e1e] text-white">
            <Sidebar 
                activePanel={activePanel}
                switchPanel={switchPanel}
                isPanelOpen={isPanelOpen}
                togglePanel={togglePanel}
            />
            
            {/* Collapsible Main Panel */}
            <div 
                className={`flex-shrink-0 bg-[#252526] transition-all duration-300 ease-in-out border-r border-transparent ${isPanelOpen ? 'w-72 border-gray-700' : 'w-0'}`}
            >
                {renderPanel()}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <MainContentArea
                    language={language}
                    setLanguage={changeLanguage}
                    executionResult={executionResult}
                />
            </div>
        </div>
    );
};

export default EditorContent; 