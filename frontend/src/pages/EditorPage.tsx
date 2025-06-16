import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Editor.css';
import { AppContextProvider } from '../context/AppContext';
import { FileProvider } from '../context/FileContext';
import EditorContent from '../components/editor/EditorContent';
import SocketService from '../services/socketService';
import { SocketContextProvider } from '../context/SocketContext';

const EditorPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const username = location.state?.username || 'Anonymous';

    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        if (roomId && username) {
            const newSocket = SocketService.getInstance().connect(roomId, username);
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [roomId, username]);

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    return (
        <AppContextProvider>
            <SocketContextProvider socket={socket}>
            <FileProvider>
                <EditorContent />
            </FileProvider>
            </SocketContextProvider>
        </AppContextProvider>
    );
};

export default EditorPage; 