import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Editor.css';
import { FileContextProvider } from '../context/FileContext';
import { SocketContextProvider } from '../context/SocketContext';
import { AppContextProvider } from '../context/AppContext';
import MainContentArea from '../components/editor/MainContentArea';
import FilePanel from '../components/editor/FilePanel';
import Sidebar from '../components/sidebar/Sidebar';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { usePanelManagement } from '../hooks/usePanelManagement';
import { useLanguage } from '../hooks/useLanguage';

const EditorPage: React.FC = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const [newMessage, setNewMessage] = useState('');

    // Custom hooks
    const { activePanel, isFilePanelOpen, switchPanel } = usePanelManagement();
    const { language, changeLanguage } = useLanguage();
    const { chatMessages, executionResult, socketService, isConnected } = useSocketConnection(
        roomId!,
        (location.state as { username: string })?.username || ''
    );

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    const socket = socketService.getSocket();

    if (!socket || !isConnected) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Connecting to server...</p>
            </div>
        );
    }

    return (
        <AppContextProvider>
            <SocketContextProvider socket={socket}>
                <FileContextProvider>
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
                    </div>
                </FileContextProvider>
            </SocketContextProvider>
        </AppContextProvider>
    );
};

export default EditorPage; 