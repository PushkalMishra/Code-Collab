import React, { useContext, useState, useCallback } from 'react';
import { useFile } from '../context/FileContext';
import FileTreeItem from './FileTreeItem';
import { FileSystemItem } from '../types/file';

const FileStructureView: React.FC = () => {
    const { fileStructure, toggleDirectory, openFile, createDirectory, createFileSystemFile, renameFile, deleteFileSystemFile, renameDirectory, deleteDirectory } = useFile();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileSystemItem | null; isDirectory: boolean } | null>(null);
    const [showCreateMenu, setShowCreateMenu] = useState<{ x: number; y: number; parentId: string | null; isDirectory: boolean } | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [newDirectoryName, setNewDirectoryName] = useState('');
    const [renameItemId, setRenameItemId] = useState<string | null>(null);
    const [renameItemName, setRenameItemName] = useState('');

    const handleContextMenu = useCallback((event: React.MouseEvent, item: FileSystemItem | null, isDirectory: boolean) => {
        event.preventDefault();
        setContextMenu({ x: event.clientX, y: event.clientY, item, isDirectory });
    }, []);

    const handleCloseContextMenu = () => {
        setContextMenu(null);
        setShowCreateMenu(null);
    };

    const handleCreateNew = (type: 'file' | 'directory') => {
        if (contextMenu) {
            setShowCreateMenu({
                x: contextMenu.x,
                y: contextMenu.y,
                parentId: contextMenu.item ? contextMenu.item.id : null,
                isDirectory: type === 'directory',
            });
        } else {
            setShowCreateMenu({
                x: 0,
                y: 0,
                parentId: null,
                isDirectory: type === 'directory',
            });
        }
        setContextMenu(null);
    };

    const handleConfirmCreate = () => {
        if (showCreateMenu) {
            if (showCreateMenu.isDirectory) {
                createDirectory(showCreateMenu.parentId || '', newDirectoryName);
            } else {
                createFileSystemFile(showCreateMenu.parentId || '', newFileName);
            }
            setNewFileName('');
            setNewDirectoryName('');
            setShowCreateMenu(null);
        }
    };

    const handleRename = () => {
        if (contextMenu && contextMenu.item) {
            setRenameItemId(contextMenu.item.id);
            setRenameItemName(contextMenu.item.name);
            setContextMenu(null);
        }
    };

    const handleConfirmRename = () => {
        if (renameItemId) {
            const itemToRename = findItem(fileStructure, renameItemId);
            if (itemToRename) {
                if (itemToRename.type === 'file') {
                    renameFile(renameItemId, renameItemName);
                } else {
                    renameDirectory(renameItemId, renameItemName);
                }
            }
            setRenameItemId(null);
            setRenameItemName('');
        }
    };

    const handleDelete = () => {
        if (contextMenu && contextMenu.item) {
            if (contextMenu.item.type === 'file') {
                deleteFileSystemFile(contextMenu.item.id);
            } else {
                deleteDirectory(contextMenu.item.id);
            }
            setContextMenu(null);
        }
    };

    const findItem = (items: FileSystemItem[], id: string): FileSystemItem | undefined => {
        for (const item of items) {
            if (item.id === id) {
                return item;
            }
            if (item.children) {
                const found = findItem(item.children, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    return (
        <div className="file-structure-view-container" onClick={handleCloseContextMenu}>
            <div className="file-tree">
                {fileStructure.map((item) => (
                    <FileTreeItem
                        key={item.id}
                        item={item}
                        level={0}
                        onContextMenu={handleContextMenu}
                        onSelectFile={openFile}
                        onRename={setRenameItemId}
                        isRenaming={renameItemId === item.id}
                        renameItemName={renameItemName}
                        setRenameItemName={setRenameItemName}
                        handleConfirmRename={handleConfirmRename}
                    />
                ))}
            </div>

            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="context-menu-item" onClick={() => handleCreateNew('file')}>New File</div>
                    <div className="context-menu-item" onClick={() => handleCreateNew('directory')}>New Directory</div>
                    {contextMenu.item && (
                        <>
                            <div className="context-menu-item" onClick={handleRename}>Rename</div>
                            <div className="context-menu-item" onClick={handleDelete}>Delete</div>
                        </>
                    )}
                </div>
            )}

            {showCreateMenu && (
                <div
                    className="context-menu"
                    style={{ top: showCreateMenu.y, left: showCreateMenu.x }}
                >
                    {showCreateMenu.isDirectory ? (
                        <input
                            type="text"
                            placeholder="Directory name"
                            value={newDirectoryName}
                            onChange={(e) => setNewDirectoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreate()}
                        />
                    ) : (
                        <input
                            type="text"
                            placeholder="File name"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreate()}
                        />
                    )}
                    <button onClick={handleConfirmCreate}>Create</button>
                    <button onClick={handleCloseContextMenu}>Cancel</button>
                </div>
            )}

            {renameItemId && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu?.y, left: contextMenu?.x }}
                >
                    <input
                        type="text"
                        value={renameItemName}
                        onChange={(e) => setRenameItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                    />
                    <button onClick={handleConfirmRename}>Rename</button>
                    <button onClick={() => setRenameItemId(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default FileStructureView; 