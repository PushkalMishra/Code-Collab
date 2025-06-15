import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../../pages/Editor.css';
import MainContentArea from './MainContentArea';
import FilePanel from './FilePanel';
import Sidebar from '../sidebar/Sidebar';
import { ChatPanel } from './ChatPanel';
import { UsersPanel } from './UsersPanel';
import { CopilotPanel } from './CopilotPanel';
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
    const editorContainerRef = useRef<HTMLDivElement>(null);

    // Custom hooks
    const { activePanel, isPanelOpen, switchPanel, togglePanel } = usePanelManagement();
    const { language, changeLanguage } = useLanguage();
    const { chatMessages, executionResult, socketService, isConnected } = useSocketConnection(roomId || '', username);

    const { socket } = useAppContext();

    useEffect(() => {
        if (!isConnected) {
            toast.error('Disconnected from server. Please refresh the page.');
        }
    }, [isConnected]);

    useEffect(() => {
        if (editorContainerRef.current) {
            // Grid template columns: sidebar, left panel, main content
            editorContainerRef.current.style.gridTemplateColumns = `auto ${isPanelOpen ? '250px' : '0px'} 1fr`;
        }
    }, [isPanelOpen]);

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    if (!socket || !isConnected) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Connecting to server...</p>
            </div>
        );
    }

    return (
        <div className="editor-page">
            <div className="editor-container" ref={editorContainerRef}>
                <Sidebar 
                    activePanel={activePanel}
                    switchPanel={switchPanel}
                    isPanelOpen={isPanelOpen}
                    togglePanel={togglePanel}
                />
                <div className="left-panel-wrapper">
                    <FilePanel isOpen={activePanel === 'code' && isPanelOpen} />
                    <ChatPanel
                        isOpen={activePanel === 'chat' && isPanelOpen}
                        chatMessages={chatMessages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                    />
                    <UsersPanel isOpen={activePanel === 'users' && isPanelOpen} />
                    <CopilotPanel isOpen={activePanel === 'copilot' && isPanelOpen} />
                </div>
                <MainContentArea
                    activePanel={activePanel}
                    isPanelOpen={isPanelOpen}
                    language={language}
                    setLanguage={changeLanguage}
                    chatMessages={chatMessages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    executionResult={executionResult}
                />
            </div>
        </div>
    );
};

export default EditorContent; 