import React from 'react';
import { FileSystemItem } from '../types/file';
import { useFile } from '../context/FileContext';

interface FileTreeItemProps {
    item: FileSystemItem;
    level: number;
    onContextMenu: (event: React.MouseEvent, item: FileSystemItem | null, isDirectory: boolean) => void;
    onSelectFile: (file: FileSystemItem) => void;
    onRename: (itemId: string) => void;
    isRenaming: boolean;
    renameItemName: string;
    setRenameItemName: (name: string) => void;
    handleConfirmRename: () => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    item,
    level,
    onContextMenu,
    onSelectFile,
    onRename,
    isRenaming,
    renameItemName,
    setRenameItemName,
    handleConfirmRename,
}) => {
    const { toggleDirectory, openFile } = useFile();

    const handleDoubleClick = () => {
        if (item.type === 'directory') {
            toggleDirectory(item.id);
        } else {
            onSelectFile(item);
        }
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRename(item.id);
    };

    return (
        <div
            className="file-tree-item"
            onContextMenu={(e) => onContextMenu(e, item, item.type === 'directory')}
            onDoubleClick={handleDoubleClick}
            style={{ paddingLeft: `${level * 15}px` }}
        >
            {isRenaming ? (
                <input
                    type="text"
                    value={renameItemName}
                    onChange={(e) => setRenameItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
                    onBlur={handleConfirmRename}
                    autoFocus
                />
            ) : (
                <span className="item-name">
                    {item.type === 'directory' ? (
                        item.isOpen ? '📂' : '📁'
                    ) : (
                        '📄'
                    )}
                    {item.name}
                </span>
            )}
            {item.type === 'directory' && item.isOpen && item.children && (
                <div className="file-tree-children">
                    {item.children.map((child) => (
                        <FileTreeItem
                            key={child.id}
                            item={child}
                            level={level + 1}
                            onContextMenu={onContextMenu}
                            onSelectFile={onSelectFile}
                            onRename={onRename}
                            isRenaming={isRenaming}
                            renameItemName={renameItemName}
                            setRenameItemName={setRenameItemName}
                            handleConfirmRename={handleConfirmRename}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileTreeItem; 