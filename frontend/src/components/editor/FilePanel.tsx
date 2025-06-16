import React, { useState } from 'react';
import FileStructureView from '../FileStructureView';
import { useFile } from '../../context/FileContext'; // Corrected import
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { FileSystemItem } from '../../types/file'; // Ensure this import is correct
import { useAuth } from '../../context/AuthContext'; // Added useAuth

const FilePanel: React.FC = () => {
    const {
        fileStructure,
        createDirectory,
        createFileSystemFile,
        openFile,
        updateDirectory,
        renameDirectory,
        deleteDirectory,
        renameFile,
        deleteFileSystemFile,
        files, // From MongoDB
        createPersistentFile, // For MongoDB
        activeFile // For general use
    } = useFile();
    const { isLoggedIn, user } = useAuth();
    const [showNewFolderInput, setShowNewFolderInput] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFileInput, setShowNewFileInput] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');

    const handleCreateFolder = (parentDirId: string | null) => {
        if (newFolderName.trim()) {
            // For local file system only (no MongoDB interaction for directories)
            createDirectory(parentDirId || '', newFolderName);
            setNewFolderName('');
            setShowNewFolderInput(null);
            toast.success('Folder created!');
        }
    };

    const handleCreateFile = async (parentDirId: string | null) => {
        if (!newFileName.trim()) return;

        if (isLoggedIn) {
            // Create persistent file in MongoDB
            await createPersistentFile(newFileName, '', selectedLanguage);
            toast.success('File created and saved to MongoDB!');
        } else {
            // Create local file system file
            createFileSystemFile(parentDirId || '', newFileName, '', selectedLanguage);
            toast.success('Local file created!');
        }

        setNewFileName('');
        setShowNewFileInput(null);
    };

    return (
        <div className="file-panel">
            <div className="file-panel-header">
                <span>Files</span>
                <div className="file-actions">
                    <button onClick={() => setShowNewFolderInput('root')} title="New Folder">
                        📁 New Folder
                    </button>
                    <button onClick={() => setShowNewFileInput('root')} title="New File">
                        📄 New File
                    </button>
                </div>
            </div>

            {showNewFolderInput === 'root' && (
                <div className="new-item-input">
                    <input
                        type="text"
                        placeholder="New folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder(null)}
                        autoFocus
                    />
                    <button onClick={() => handleCreateFolder(null)}>Create</button>
                    <button onClick={() => setShowNewFolderInput(null)}>Cancel</button>
                </div>
            )}

            {showNewFileInput === 'root' && (
                <div className="new-item-input">
                    <input
                        type="text"
                        placeholder="New file name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFile(null)}
                        autoFocus
                    />
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <button onClick={() => handleCreateFile(null)}>Create</button>
                    <button onClick={() => setShowNewFileInput(null)}>Cancel</button>
                </div>
            )}
            {isLoggedIn && files.length > 0 && (
                <div className="persistent-files-section">
                    <h3>Your Persistent Files</h3>
                    {files.map(file => (
                        <div
                            key={file._id}
                            className={`file-item ${activeFile?.id === file._id ? 'active' : ''}`}
                            onClick={() => openFile({
                                id: file._id,
                                name: file.name,
                                type: 'file',
                                parentId: null,
                                content: file.content,
                                language: file.language,
                            })}
                        >
                            📄 {file.name} {file.owner && `(Owner: ${file.owner.username})`}
                        </div>
                    ))}
                </div>
            )}
            <FileStructureView />
        </div>
    );
};

export default FilePanel;