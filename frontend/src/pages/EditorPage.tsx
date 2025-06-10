import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Editor.css';
import MainContentArea from '../components/editor/MainContentArea';
import FilePanel from '../components/editor/FilePanel';
import { Sidebar } from '../components/sidebar/Sidebar';
import { UsersView } from '../components/editor/UsersView';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { usePanelManagement } from '../hooks/usePanelManagement';
import { useLanguage } from '../hooks/useLanguage';
import { useAppContext } from '../context/AppContext';

const EditorPage: React.FC = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const [newMessage, setNewMessage] = useState('');
    const { setSocket } = useAppContext();

    // Custom hooks
    const { activePanel, isFilePanelOpen, switchPanel } = usePanelManagement();
    const { language, changeLanguage } = useLanguage();
    const { chatMessages, executionResult, socketService, isConnected } = useSocketConnection(
        roomId!,
        (location.state as { username: string })?.username || ''
    );

    const socket = socketService.getSocket();

    // Update socket in context - moved before any conditional returns
    useEffect(() => {
        if (socket) {
            setSocket(socket);
        }
    }, [socket, setSocket]);

    // Early returns after all hooks
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
        <div className="editor-container">
            <Sidebar 
                activePanel={activePanel}
                setActivePanel={switchPanel}
                setIsFilePanelOpen={(isOpen: boolean) => isOpen && switchPanel('code')}
            />
            <FilePanel isOpen={isFilePanelOpen} />
            <MainContentArea
                activePanel={activePanel}
                language={language}
                setLanguage={changeLanguage}
                chatMessages={chatMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                executionResult={executionResult}
            />
            <UsersView />
        </div>
    );
};

export default EditorPage; 