import React, { useState } from 'react';
import FileStructureView from '../FileStructureView';
import { useFileSystem } from '../../context/FileContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { FileSystemItem } from '../../types/file';

interface FilePanelProps {
    isOpen: boolean;
}

interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    values(): AsyncIterableIterator<FileSystemHandle>;
}

type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

declare global {
    interface Window {
        showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    }
}

const FilePanel: React.FC<FilePanelProps> = ({ isOpen }) => {
    const { updateDirectory } = useFileSystem();
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenDirectory = async () => {
        try {
            setIsLoading(true);

            // Check for modern API support
            if ('showDirectoryPicker' in window) {
                const directoryHandle = await window.showDirectoryPicker();
                await processDirectoryHandle(directoryHandle);
                return;
            }

            // Fallback for browsers without `showDirectoryPicker`
            if ('webkitdirectory' in HTMLInputElement.prototype) {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.webkitdirectory = true;

                fileInput.onchange = async (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                        const structure = await readFileList(files);
                        updateDirectory('', structure);
                    }
                };

                fileInput.click();
                return;
            }

            // Notify if neither API is supported
            toast.error('Your browser does not support directory selection.');
        } catch (error) {
            console.error('Error opening directory:', error);
            toast.error('Failed to open directory');
        } finally {
            setIsLoading(false);
        }
    };

    const processDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle) => {
        try {
            toast.loading('Getting files and folders...');
            const structure = await readDirectory(directoryHandle);
            updateDirectory('', structure);
            toast.dismiss();
            toast.success('Directory loaded successfully');
        } catch (error) {
            console.error('Error processing directory:', error);
            toast.error('Failed to process directory');
        }
    };

    const readDirectory = async (directoryHandle: FileSystemDirectoryHandle): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = [];
        const blackList = ['node_modules', '.git', '.vscode', '.next'];

        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file') {
                const fileHandle = entry as FileSystemFileHandle;
                const file = await fileHandle.getFile();
                const newFile: FileSystemItem = {
                    id: uuidv4(),
                    name: entry.name,
                    type: 'file',
                    content: await readFileContent(file),
                };
                children.push(newFile);
            } else if (entry.kind === 'directory') {
                if (blackList.includes(entry.name)) continue;

                const dirHandle = entry as FileSystemDirectoryHandle;
                const newDirectory: FileSystemItem = {
                    id: uuidv4(),
                    name: entry.name,
                    type: 'directory',
                    children: await readDirectory(dirHandle),
                    isOpen: false,
                };
                children.push(newDirectory);
            }
        }
        return children;
    };

    const readFileList = async (files: FileList): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = [];
        const blackList = ['node_modules', '.git', '.vscode', '.next'];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pathParts = file.webkitRelativePath.split('/');

            if (pathParts.some((part) => blackList.includes(part))) continue;

            if (pathParts.length > 1) {
                const directoryPath = pathParts.slice(0, -1).join('/');
                const directoryIndex = children.findIndex(
                    (item) => item.name === directoryPath && item.type === 'directory'
                );

                if (directoryIndex === -1) {
                    const newDirectory: FileSystemItem = {
                        id: uuidv4(),
                        name: directoryPath,
                        type: 'directory',
                        children: [],
                        isOpen: false,
                    };
                    children.push(newDirectory);
                }

                const newFile: FileSystemItem = {
                    id: uuidv4(),
                    name: file.name,
                    type: 'file',
                    content: await readFileContent(file),
                };

                const targetDirectory = children.find(
                    (item) => item.name === directoryPath && item.type === 'directory'
                );
                if (targetDirectory && targetDirectory.type === 'directory' && targetDirectory.children) {
                    targetDirectory.children.push(newFile);
                }
            } else {
                const newFile: FileSystemItem = {
                    id: uuidv4(),
                    name: file.name,
                    type: 'file',
                    content: await readFileContent(file),
                };
                children.push(newFile);
            }
        }
        return children;
    };

    const readFileContent = async (file: File): Promise<string> => {
        const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit

        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${file.name} (${Math.round(file.size / 1024)}KB)`;
        }

        try {
            return await file.text();
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error);
            return `Error reading file: ${file.name}`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="file-panel">
            <div className="file-panel-header">
                <button
                    className="open-directory-button"
                    onClick={handleOpenDirectory}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Open File/Folder'}
                </button>
            </div>
            <FileStructureView />
        </div>
    );
};

export default FilePanel; 