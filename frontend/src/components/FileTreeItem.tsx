import React from 'react';
import { FileSystemItem } from '../types/file';
import { useFileSystem } from '../context/FileContext';

interface FileTreeItemProps {
    item: FileSystemItem;
    selectedNodeId: string | null;
    setSelectedNodeId: (id: string) => void;
    onNewFolder: () => void;
    onNewFile: () => void;
    children?: React.ReactNode;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    item,
    selectedNodeId,
    setSelectedNodeId,
    onNewFolder,
    onNewFile,
    children
}) => {
    const {
        toggleDirectory,
        openFile,
        renameFile,
        deleteFile,
        renameDirectory,
        deleteDirectory
    } = useFileSystem();

    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState(item.name);

    const handleRename = () => {
        if (newName.trim() && newName !== item.name) {
            if (item.type === 'file') {
                renameFile(item.id, newName);
            } else {
                renameDirectory(item.id, newName);
            }
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        if (item.type === 'file') {
            deleteFile(item.id);
        } else {
            deleteDirectory(item.id);
        }
    };

    return (
        <div className="file-tree-item">
            <div
                className={`file-tree-item-content ${selectedNodeId === item.id ? 'selected' : ''}`}
                onClick={() => {
                    if (item.type === 'file') {
                        openFile(item.id);
                    } else {
                        toggleDirectory(item.id);
                    }
                    setSelectedNodeId(item.id);
                }}
            >
                <span className="file-icon">
                    {item.type === 'directory' ? '📁' : '📄'}
                </span>
                {isRenaming ? (
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                        autoFocus
                    />
                ) : (
                    <span className="file-name">{item.name}</span>
                )}
            </div>
            <div className="file-tree-item-actions">
                {item.type === 'directory' && (
                    <>
                        <button onClick={onNewFolder} title="New Folder">📁</button>
                        <button onClick={onNewFile} title="New File">📄</button>
                    </>
                )}
                <button onClick={() => setIsRenaming(true)} title="Rename">✏️</button>
                <button onClick={handleDelete} title="Delete">🗑️</button>
            </div>
            {children}
        </div>
    );
};

export default FileTreeItem; 