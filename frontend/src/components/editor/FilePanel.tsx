import React, { useState } from 'react';
import FileStructureView from '../FileStructureView';
import { useFile } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { FileSystemItem } from '../../types/file';
import { File as FileType } from '../../services/fileService';
import { RemoteUser } from '../../types/user';

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
        files,
        createPersistentFile,
        shareFile,
        activeFile
    } = useFile();
    const { isLoggedIn, user } = useAuth();
    const { users } = useAppContext();
    const { socket } = useSocket();
    const [showNewFolderInput, setShowNewFolderInput] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFileInput, setShowNewFileInput] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [showShareDialog, setShowShareDialog] = useState<string | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // This will store socketIds for checkboxes

    const handleCreateFolder = (parentId: string) => {
        if (newFolderName.trim() === '') return;
        createDirectory(parentId, newFolderName);
            setNewFolderName('');
            setShowNewFolderInput(null);
    };

    const handleCreateFile = async (parentId: string) => {
        if (newFileName.trim() === '') return;
        if (parentId === 'root') {
            try {
            await createPersistentFile(newFileName, '', selectedLanguage);
                toast.success('File created successfully!');
            } catch (error) {
                toast.error('Failed to create file.');
            }
        } else {
            createFileSystemFile(parentId, newFileName, '', selectedLanguage);
        }
        setNewFileName('');
        setShowNewFileInput(null);
    };

    const handleShareFile = async (fileId: string) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user to share with');
            return;
        }

        try {
            // Map selected socketIds back to user _ids for the backend API
            const userIdsToShare = users
                .filter(u => selectedUsers.includes(u.socketId) && u._id)
                .map(u => u._id as string);

            if (userIdsToShare.length === 0) {
                toast.error('No valid users selected to share with.');
                return;
            }
            
            await shareFile(fileId, userIdsToShare);
            toast.success('File shared successfully!');
            setShowShareDialog(null);
            setSelectedUsers([]);
        } catch (error) {
            toast.error('Failed to share file');
            console.error('Error sharing file:', error);
        }
    };

    const toggleUserSelection = (socketId: string) => {
        setSelectedUsers(prev => 
            prev.includes(socketId)
                ? prev.filter(id => id !== socketId)
                : [...prev, socketId]
        );
    };

    const renderShareDialog = (file: FileType) => {
        if (showShareDialog !== file._id) return null;

        const currentUserSocketId = socket?.id;
        if (!currentUserSocketId) {
            toast.error('Not connected to room');
            return null;
        }

        // Filter out the current user and users who already have access to the file
        // Ensure `roomUser._id` exists for comparison against `file.sharedWith`
        const roomUsers = users.filter(roomUser => 
            roomUser.socketId !== currentUserSocketId && 
            roomUser._id && // Ensure the remote user has a MongoDB _id
            !file.sharedWith.some(sharedUser => sharedUser._id === roomUser._id)
        );

        return (
            <div className="share-dialog">
                <div className="share-dialog-content">
                    <h4>Share "{file.name}" with:</h4>
                    <div className="user-list">
                        {roomUsers.map(roomUser => (
                            <label key={roomUser.socketId} className="user-option">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(roomUser.socketId)}
                                    onChange={() => toggleUserSelection(roomUser.socketId)}
                                />
                                {roomUser.username}
                            </label>
                        ))}
                    </div>
                    <div className="share-dialog-actions">
                        <button onClick={() => handleShareFile(file._id)}>Share</button>
                        <button onClick={() => {
                            setShowShareDialog(null);
                            setSelectedUsers([]);
                        }}>Cancel</button>
                    </div>
                </div>
            </div>
        );
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

            {showNewFolderInput && (
                <div className="new-item-input-container">
                    <input
                        type="text"
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder(showNewFolderInput)}
                    />
                    <button onClick={() => handleCreateFolder(showNewFolderInput)}>Create</button>
                    <button onClick={() => setShowNewFolderInput(null)}>Cancel</button>
                </div>
            )}
            {showNewFileInput && (
                <div className="new-item-input-container">
                    <input
                        type="text"
                        placeholder="File name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFile(showNewFileInput)}
                    />
                    <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                    </select>
                    <button onClick={() => handleCreateFile(showNewFileInput)}>Create</button>
                    <button onClick={() => setShowNewFileInput(null)}>Cancel</button>
                </div>
            )}

            {isLoggedIn && files.length > 0 && (
                <div className="persistent-files-section">
                    <h3>Your Files</h3>
                    {files.map(file => (
                        <div key={file._id} className="file-item-container">
                        <div
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
                                <span className="file-name">📄 {file.name}</span>
                                {file.owner && file.owner._id === user?.userId && (
                                    <button
                                        className="share-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowShareDialog(file._id);
                                        }}
                                        title="Share file"
                                    >
                                        Share
                                    </button>
                                )}
                                {file.owner && file.owner._id !== user?.userId && (
                                    <span className="file-owner">(Shared by {file.owner.username})</span>
                                )}
                            </div>
                            {renderShareDialog(file)}
                        </div>
                    ))}
                </div>
            )}
            <FileStructureView />
        </div>
    );
};

export default FilePanel;