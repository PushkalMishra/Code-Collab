import React from 'react';
import FileStructureView from '../FileStructureView';

interface FilePanelProps {
    isOpen: boolean;
}

const FilePanel: React.FC<FilePanelProps> = ({ isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="file-panel">
            <FileStructureView />
        </div>
    );
};

export default FilePanel; 