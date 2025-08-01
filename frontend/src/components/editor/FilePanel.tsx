import React, { useState } from 'react';
import { useFile } from '../../context/FileContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentPlusIcon, FolderPlusIcon, ArrowDownTrayIcon, FolderOpenIcon, FolderIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { File as PersistentFile } from '../../services/fileService';
import { FileSystemItem } from '../../types/file';
import { getLanguageIcon } from '../../utils/language-icons';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const FileItemDisplay: React.FC<{ item: FileSystemItem, onOpenFile: (file: FileSystemItem) => void }> = ({ item, onOpenFile }) => {
    const { user } = useAuth();
    const { files, deletePersistentFile } = useFile();
    const { socket } = useSocket();
    if (item.type === 'directory') {
        return (
            <div className="flex items-center px-4 py-1.5 cursor-pointer text-sm">
                <FolderIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>{item.name}</span>
            </div>
        );
    }

    const { abbr, color } = getLanguageIcon(item.name);
    // Find the persistent file object
    const persistentFile = files.find(f => f._id === item.id);
    console.log('DEBUG: persistentFile.owner', persistentFile?.owner, 'user', user);
    // const isOwner =
    //   persistentFile &&
    //   user &&
    //   persistentFile.owner &&
    //   (
    //     (persistentFile.owner._id && persistentFile.owner._id === user.userId) ||
    //     (persistentFile.owner.username && persistentFile.owner.username === user.username)
    //   );
    const isOwner =
  persistentFile &&
  user &&
  persistentFile.owner &&
  (
    (typeof persistentFile.owner === 'object' && persistentFile.owner._id === user.userId) ||
    (typeof persistentFile.owner === 'string' && persistentFile.owner === user.userId)
  );
    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (socket && persistentFile) {
            socket.emit('file-created', persistentFile);
        }
    };
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!persistentFile) return;
        console.log('DEBUG owner:', persistentFile?.owner, 'userId:', user?.userId);
        if (!isOwner) {
            toast.error('Only the owner can delete this file.');
            return;
        }
        try {
            await deletePersistentFile(persistentFile._id);
            toast.success('File deleted successfully');
        } catch (err) {
            toast.error('Failed to delete file.');
        }
    };
    return (
        <div
            className={
                `flex items-center px-4 py-1.5 cursor-pointer text-sm hover:bg-gray-700 justify-between group`
            }
            onClick={() => onOpenFile(item)}
        >
            <div className="flex items-center">
                <span className={`${color} mr-2 font-mono text-xs`}>{abbr}</span>
                <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Re-share file to room"
                    onClick={handleShare}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <ShareIcon className="h-4 w-4 text-blue-400" />
                </button>
                <button
                    className="p-1 hover:bg-gray-600 rounded"
                    title="Delete file"
                    onClick={handleDelete}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <TrashIcon className="h-4 w-4 text-red-400" />
                </button>
            </div>
        </div>
    );
};

const FilePanel: React.FC = () => {
    const {
        files,
        fileStructure,
        openFile,
        createPersistentFile,
        activeFile,
        createDirectory,
        downloadFilesAndFolders,
    } = useFile();
    const { isLoggedIn } = useAuth();
    const [newFileName, setNewFileName] = useState('');
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const handleCreateFile = async () => {
        if (newFileName.trim() === '') return;
        try {
            await createPersistentFile(newFileName, '', 'javascript');
            setNewFileName('');
            setIsCreatingFile(false);
        } catch (error) {
            console.error('Failed to create file:', error);
        }
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim() === '') return;
        createDirectory('root', newFolderName);
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    const handleOpenFile = (file: FileSystemItem) => {
        openFile(file);
    };

    const combinedFileStructure = [
        ...fileStructure,
        ...files
            .filter(f => !fileStructure.some(fs => fs.id === f._id))
            .map(f => ({
                id: f._id,
                name: f.name,
                type: 'file',
                parentId: 'root',
                content: f.content,
                language: f.language || 'javascript',
            }) as FileSystemItem),
    ];

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
            <div className="flex items-center justify-between p-2 border-b border-gray-700">
                <h2 className="text-sm font-medium px-2">Files</h2>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setIsCreatingFile(!isCreatingFile)} className="p-1 hover:bg-gray-700 rounded" title="New File">
                        <DocumentPlusIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setIsCreatingFolder(!isCreatingFolder)} className="p-1 hover:bg-gray-700 rounded" title="New Folder">
                        <FolderPlusIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isCreatingFile && (
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Enter file name..."
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                )}
                {isCreatingFolder && (
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Enter folder name..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                )}
                {isLoggedIn && combinedFileStructure.map((item) => (
                    <FileItemDisplay key={item.id} item={item} onOpenFile={handleOpenFile} />
                ))}
            </div>

            <div className="p-2 border-t border-gray-700">
                <button className="flex items-center w-full text-left px-2 py-1.5 text-xs hover:bg-gray-700 rounded">
                    <FolderOpenIcon className="h-4 w-4 mr-2" />
                    Open File/Folder
                </button>
                <button onClick={downloadFilesAndFolders} className="flex items-center w-full text-left px-2 py-1.5 text-xs hover:bg-gray-700 rounded mt-1">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Code
                </button>
            </div>
        </div>
    );
};

export default FilePanel;