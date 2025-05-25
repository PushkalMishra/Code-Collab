import React, { useContext, useState, useCallback } from 'react';
import { useFileSystem } from '../context/FileContext';
import FileTreeItem from './FileTreeItem';
import { FileSystemItem } from '../types/file';

const FileStructureView: React.FC = () => {
    const { fileStructure, createDirectory, createFile, downloadFilesAndFolders } = useFileSystem();
    const [newFolderName, setNewFolderName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [showNewFolderInput, setShowNewFolderInput] = useState<string | null>(null);
    const [showNewFileInput, setShowNewFileInput] = useState<string | null>(null);

    const handleCreateFolder = useCallback((parentDirId: string | null) => {
        if (newFolderName.trim()) {
            createDirectory(parentDirId || fileStructure.id, newFolderName);
            setNewFolderName('');
            setShowNewFolderInput(null);
        }
    }, [newFolderName, createDirectory, fileStructure.id]);

    const handleCreateFile = useCallback((parentDirId: string | null) => {
        if (newFileName.trim()) {
            createFile(parentDirId || fileStructure.id, newFileName);
            setNewFileName('');
            setShowNewFileInput(null);
        }
    }, [newFileName, createFile, fileStructure.id]);

    const renderTree = (item: FileSystemItem) => (
        <FileTreeItem
            key={item.id}
            item={item}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            onNewFolder={() => setShowNewFolderInput(item.id)}
            onNewFile={() => setShowNewFileInput(item.id)}
        >
            {showNewFolderInput === item.id && (
                <div className="new-item-input">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder(item.id)}
                        placeholder="New folder name"
                        autoFocus
                    />
                    <button onClick={() => handleCreateFolder(item.id)}>Create</button>
                    <button onClick={() => setShowNewFolderInput(null)}>Cancel</button>
                </div>
            )}
            {showNewFileInput === item.id && (
                <div className="new-item-input">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFile(item.id)}
                        placeholder="New file name"
                        autoFocus
                    />
                    <button onClick={() => handleCreateFile(item.id)}>Create</button>
                    <button onClick={() => setShowNewFileInput(null)}>Cancel</button>
                </div>
            )}
            {item.children && item.isOpen && item.children.map(renderTree)}
        </FileTreeItem>
    );

    return (
        <div className="file-structure-view">
            <div className="file-structure-actions">
                <button onClick={() => setShowNewFolderInput(fileStructure.id)}>+ Folder</button>
                <button onClick={() => setShowNewFileInput(fileStructure.id)}>+ File</button>
                <button onClick={downloadFilesAndFolders}>Download All</button>
            </div>
            {showNewFolderInput === fileStructure.id && (
                <div className="new-item-input">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder(null)}
                        placeholder="New folder name"
                        autoFocus
                    />
                    <button onClick={() => handleCreateFolder(null)}>Create</button>
                    <button onClick={() => setShowNewFolderInput(null)}>Cancel</button>
                </div>
            )}
            {showNewFileInput === fileStructure.id && (
                <div className="new-item-input">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateFile(null)}
                        placeholder="New file name"
                        autoFocus
                    />
                    <button onClick={() => handleCreateFile(null)}>Create</button>
                    <button onClick={() => setShowNewFileInput(null)}>Cancel</button>
                </div>
            )}
            <div className="file-tree">
                {fileStructure.children && fileStructure.isOpen && fileStructure.children.map(renderTree)}
            </div>
        </div>
    );
};

export default FileStructureView; 