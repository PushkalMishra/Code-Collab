import React from 'react';
import { useFileSystem } from '../../context/FileContext';

const FileTab: React.FC = () => {
    const { openFiles, activeFile, setActiveFile, closeFile } = useFileSystem();

    return (
        <div className="file-tabs">
            {openFiles.map((file) => (
                <div
                    key={file.id}
                    className={`file-tab ${activeFile?.id === file.id ? 'active' : ''}`}
                    onClick={() => setActiveFile(file)}
                >
                    <span className="file-name">{file.name}</span>
                    <button
                        className="close-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeFile(file.id);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FileTab; 