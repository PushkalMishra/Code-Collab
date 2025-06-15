import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Editor.css';
import { AppContextProvider } from '../context/AppContext';
import { FileContextProvider } from '../context/FileContext';
import EditorContent from '../components/editor/EditorContent';

const EditorPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const location = useLocation();
    const username = location.state?.username || 'Anonymous';

    if (!roomId) {
        return <div>Invalid room ID</div>;
    }

    return (
        <AppContextProvider>
            <FileContextProvider>
                <EditorContent />
            </FileContextProvider>
        </AppContextProvider>
    );
};

export default EditorPage; 