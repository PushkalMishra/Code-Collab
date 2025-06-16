import React from 'react';
import { useFile } from '../../context/FileContext';
import { FileSystemItem } from '../../types/file'; // Import FileSystemItem

const FileTab: React.FC = () => {
    const { openFiles, activeFile, setActiveFile, closeFile } = useFile();

    return (
        <div className="file-tabs">
            {openFiles.map((file: FileSystemItem) => (
                <div
                    key={file.id}
                    className={`file-tab ${activeFile?.id === file.id ? 'active' : ''}`}
                    onClick={() => setActiveFile(file)}
                >
                    <span className="file-tab-name">{file.name}</span>
                    <button className="close-tab-button" onClick={(e) => {
                        e.stopPropagation();
                        closeFile(file.id);
                    }}>
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FileTab;