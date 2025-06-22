import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useAppContext } from './AppContext';
import { fileService, File as FileType } from '../services/fileService';

// Types for the file system
interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  parentId: string | null;
  content?: string;
  language?: string;
  isOpen?: boolean;
  children?: FileSystemItem[];
}

interface FileContextType {
  // MongoDB file operations
  files: FileType[];
  currentFile: FileSystemItem | null;
  setCurrentFile: (file: FileSystemItem | null) => void;
  createPersistentFile: (name: string, content: string, language: string) => Promise<void>;
  updatePersistentFile: (fileId: string, updates: Partial<FileType>) => Promise<void>;
  deletePersistentFile: (fileId: string) => Promise<void>;
  shareFile: (fileId: string, userIds: string[]) => Promise<void>;
  
  // File system operations
  fileStructure: FileSystemItem[];
  openFiles: FileSystemItem[];
  activeFile: FileSystemItem | null;
  setActiveFile: (file: FileSystemItem | null) => void;
  closeFile: (fileId: string) => void;
  toggleDirectory: (dirId: string) => void;
  collapseDirectories: () => void;
  createDirectory: (parentId: string, name: string) => void;
  updateDirectory: (dirId: string, updates: Partial<FileSystemItem>) => void;
  renameDirectory: (dirId: string, newName: string) => void;
  deleteDirectory: (dirId: string) => void;
  openFile: (file: FileSystemItem) => void;
  createFileSystemFile: (parentId: string, name: string, content?: string, language?: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  deleteFileSystemFile: (fileId: string) => void;
  downloadFilesAndFolders: () => void;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  roomId: string | undefined;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { setUsers } = useAppContext();
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const { isLoggedIn } = useAuth();

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // MongoDB file states
  const [files, setFiles] = useState<FileType[]>([]);
  const [currentFile, setCurrentFile] = useState<FileSystemItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File system states
  const [fileStructure, setFileStructure] = useState<FileSystemItem[]>([]);
  const [openFiles, setOpenFiles] = useState<FileSystemItem[]>([]);
  const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null);

  // Helper function to convert FileType to FileSystemItem
  const convertToFileSystemItem = (file: FileType): FileSystemItem => ({
    id: file._id,
    name: file.name,
    type: 'file',
    parentId: null, // MongoDB files don't have a direct parent in the local tree
    content: file.content,
    language: file.language,
  });

  // Load files when roomId changes or login status changes
  useEffect(() => {
    const loadFiles = async () => {
      const token = getToken();
      if (!token || !isLoggedIn) {
        console.warn('loadFiles aborted: Missing token or not logged in');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Load user's personal files
        const userFiles = await fileService.getMyFiles(token);
        console.log('Successfully fetched user files:', userFiles);
        
        // Load room files (files created in this room)
        let roomFiles: FileType[] = [];
        if (urlRoomId) {
          roomFiles = await fileService.getRoomFiles(urlRoomId, token);
          console.log('Successfully fetched room files:', roomFiles);
        }

        // Combine user's personal files with room files, avoiding duplicates
        const allFiles = [...userFiles];
        roomFiles.forEach(roomFile => {
          if (!allFiles.some(f => f._id === roomFile._id)) {
            allFiles.push(roomFile);
          }
        });

        setFiles(allFiles);
        
        if (!currentFile && allFiles.length > 0) {
          const firstFileAsFSItem = convertToFileSystemItem(allFiles[0]);
          setCurrentFile(firstFileAsFSItem);
          setActiveFile(firstFileAsFSItem);
          setOpenFiles([firstFileAsFSItem]);
        }
      } catch (err) {
        setError('Failed to load files');
        console.error('Error loading files in FileContext:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [isLoggedIn, urlRoomId]);

  // Set up socket listeners for real-time collaboration
  useEffect(() => {
    if (!socket || !urlRoomId) return;

    // Listen for file creation from other users
    socket.on('file-created', (newFile: FileType) => {
      console.log('Received file-created event:', newFile);
      setFiles(prevFiles => {
        // Check if file already exists
        if (prevFiles.some(f => f._id === newFile._id)) {
          return prevFiles;
        }
        // Only add the file if it's from the current room
        if (newFile.roomId === urlRoomId) {
          return [...prevFiles, newFile];
        }
        return prevFiles;
      });
    });

    // Listen for file updates from other users
    socket.on('file-updated', (updatedFile: FileType) => {
      console.log('Received file-updated event:', updatedFile);
      setFiles(prevFiles => 
        prevFiles.map(file => file._id === updatedFile._id ? updatedFile : file)
      );

      // Update active file if it's the one being updated
      if (activeFile?.id === updatedFile._id) {
        const updatedFileAsFSItem = convertToFileSystemItem(updatedFile);
        setActiveFile(updatedFileAsFSItem);
        setOpenFiles(prevOpenFiles => 
          prevOpenFiles.map(file => file.id === updatedFile._id ? updatedFileAsFSItem : file)
        );
      }
    });

    // Listen for file deletion from other users
    socket.on('file-deleted', (deletedFileId: string) => {
      console.log('Received file-deleted event:', deletedFileId);
      setFiles(prevFiles => prevFiles.filter(file => file._id !== deletedFileId));
      
      // Remove from open and active files if deleted
      if (activeFile?.id === deletedFileId) {
        setActiveFile(null);
      }
      setOpenFiles(prevOpenFiles => prevOpenFiles.filter(file => file.id !== deletedFileId));
      if (currentFile?.id === deletedFileId) {
        setCurrentFile(null);
      }
    });

    // Cleanup socket listeners
    return () => {
      socket.off('file-created');
      socket.off('file-updated');
      socket.off('file-deleted');
    };
  }, [socket, urlRoomId]);

  // Modify createPersistentFile to handle file creation in room
  const createPersistentFile = async (name: string, content: string, language: string) => {
    const token = getToken();
    if (!urlRoomId || !token || !isLoggedIn || !socket) {
      console.warn('createPersistentFile aborted: Missing requirements');
      return;
    }

    try {
      // Create the file in the room
      const newFile = await fileService.createFile(name, content, language, urlRoomId, token);
      
      // Update local state
      setFiles(prevFiles => {
        // Check if file already exists
        if (prevFiles.some(f => f._id === newFile._id)) {
          return prevFiles;
        }
        return [...prevFiles, newFile];
      });
      
      const newFileAsFSItem = convertToFileSystemItem(newFile);
      setCurrentFile(newFileAsFSItem);
      setActiveFile(newFileAsFSItem);
      setOpenFiles(prevOpenFiles => [...prevOpenFiles.filter(f => f.id !== newFileAsFSItem.id), newFileAsFSItem]);

      // Emit socket event for other users
      socket.emit('file-created', newFile);
    } catch (err) {
      setError('Failed to create file');
      console.error('Error creating file:', err);
      throw err;
    }
  };

  // Modify updatePersistentFile to emit socket event
  const updatePersistentFile = async (fileId: string, updates: Partial<FileType>) => {
    const token = getToken();
    if (!token || !isLoggedIn || !socket) return;

    try {
      const updatedFile = await fileService.updateFile(fileId, updates, token);
      setFiles(prevFiles => 
        prevFiles.map(file => file._id === fileId ? updatedFile : file)
      );
      
      const updatedFileAsFSItem = convertToFileSystemItem(updatedFile);

      if (activeFile?.id === fileId) {
        setActiveFile(updatedFileAsFSItem);
      }
      setOpenFiles(prevOpenFiles => 
        prevOpenFiles.map(file => file.id === fileId ? updatedFileAsFSItem : file)
      );
      if (currentFile?.id === fileId) {
        setCurrentFile(updatedFileAsFSItem);
      }

      // Emit socket event for other users
      socket.emit('file-updated', updatedFile);
    } catch (err) {
      setError('Failed to update file');
      console.error('Error updating file:', err);
      throw err;
    }
  };

  // Modify deletePersistentFile to emit socket event
  const deletePersistentFile = async (fileId: string) => {
    const token = getToken();
    if (!token) {
      console.error('Delete failed: No token found');
      throw new Error('Authentication token not found');
    }
    if (!isLoggedIn) {
      console.error('Delete failed: User not logged in');
      throw new Error('User not logged in');
    }
    if (!socket) {
      console.error('Delete failed: No socket connection');
      throw new Error('No socket connection');
    }

    try {
      console.log('Attempting to delete file:', fileId);
      await fileService.deleteFile(fileId, token);
      console.log('File deleted successfully on backend');
      
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.filter(file => file._id !== fileId);
        console.log('Updated files state:', updatedFiles);
        return updatedFiles;
      });
      
      // Remove from open and active files if deleted
      if (activeFile?.id === fileId) {
        console.log('Clearing active file');
        setActiveFile(null);
      }
      setOpenFiles(prevOpenFiles => {
        const updatedOpenFiles = prevOpenFiles.filter(file => file.id !== fileId);
        console.log('Updated open files:', updatedOpenFiles);
        return updatedOpenFiles;
      });
      if (currentFile?.id === fileId) {
        console.log('Clearing current file');
        setCurrentFile(null);
      }

      // Emit socket event for other users
      console.log('Emitting file-deleted event');
      socket.emit('file-deleted', fileId);
      console.log('File deletion completed successfully');
    } catch (err) {
      console.error('Error deleting file:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        setError(`Failed to delete file: ${err.message}`);
      } else {
        setError('Failed to delete file: Unknown error');
      }
      throw err;
    }
  };

  const shareFile = async (fileId: string, userIds: string[]) => {
    const token = getToken();
    if (!token || !isLoggedIn) return;

    try {
      const updatedFile = await fileService.shareFile(fileId, userIds, token);
      setFiles(prevFiles => 
        prevFiles.map(file => file._id === fileId ? updatedFile : file)
      );
      
      const updatedFileAsFSItem = convertToFileSystemItem(updatedFile);

      if (activeFile?.id === fileId) {
        setActiveFile(updatedFileAsFSItem);
      }
      if (currentFile?.id === fileId) {
        setCurrentFile(updatedFileAsFSItem);
      }

    } catch (err) {
      setError('Failed to share file');
      console.error('Error sharing file:', err);
      throw err;
    }
  };

  // File system operations
  const closeFile = (fileId: string) => {
    setOpenFiles(prev => prev.filter(file => file.id !== fileId));
    if (activeFile?.id === fileId) {
      setActiveFile(openFiles.find(file => file.id !== fileId) || null);
    }
  };

  const toggleDirectory = (dirId: string) => {
    setFileStructure(prev => 
      prev.map(item => 
        item.id === dirId 
          ? { ...item, isOpen: !item.isOpen }
          : item
      )
    );
  };

  const collapseDirectories = () => {
    setFileStructure(prev =>
      prev.map(item => ({ ...item, isOpen: false }))
    );
  };

  const createDirectory = (parentId: string, name: string) => {
    const newDir: FileSystemItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'directory',
      parentId,
      isOpen: false,
      children: []
    };

    setFileStructure(prev => {
      if (parentId === '') { // For root level directories
        return [...prev, newDir];
      }
      return prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newDir]
          };
        }
        return item;
      });
    });
  };

  const updateDirectory = (dirId: string, updates: Partial<FileSystemItem>) => {
    setFileStructure(prev =>
      prev.map(item => 
        item.id === dirId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const renameDirectory = (dirId: string, newName: string) => {
    updateDirectory(dirId, { name: newName });
  };

  const deleteDirectory = (dirId: string) => {
    setFileStructure(prev =>
      prev.filter(item => item.id !== dirId)
    );
    closeFile(dirId);
  };

  const openFile = (file: FileSystemItem) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);
  };

  const createFileSystemFile = (parentId: string, name: string, content = '', language = 'javascript') => {
    const newFile: FileSystemItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type: 'file',
      parentId,
      content,
      language
    };

    setFileStructure(prev => {
      if (parentId === '') { // For root level files
        return [...prev, newFile];
      }
      return prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newFile]
          };
        }
        return item;
      });
    });

    openFile(newFile);
  };

  const updateFileContent = async (fileId: string, content: string) => {
    setFileStructure(prev =>
      prev.map(item => {
        if (item.id === fileId) {
          return { ...item, content };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map(child =>
              child.id === fileId ? { ...child, content } : child
            )
          };
        }
        return item;
      })
    );

    if (activeFile?.id === fileId) {
      setActiveFile(prev => prev ? { ...prev, content } : null);
    }

    // Call updatePersistentFile to save to backend
    try {
      await updatePersistentFile(fileId, { content });
      console.log('File content update sent to backend for fileId:', fileId);
    } catch (error) {
      console.error('Error sending content update to backend:', error);
    }
  };

  const renameFile = (fileId: string, newName: string) => {
    setFileStructure(prev =>
      prev.map(item => {
        if (item.id === fileId) {
          return { ...item, name: newName };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map(child =>
              child.id === fileId ? { ...child, name: newName } : child
            )
          };
        }
        return item;
      })
    );

    if (activeFile?.id === fileId) {
      setActiveFile(prev => prev ? { ...prev, name: newName } : null);
    }
  };

  const deleteFileSystemFile = (fileId: string) => {
    setFileStructure(prev =>
      prev.filter(item => item.id !== fileId)
    );
    closeFile(fileId);
  };

  const downloadFilesAndFolders = () => {
    const data = JSON.stringify(fileStructure, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file-structure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const value: FileContextType = {
    // MongoDB file operations
    files,
    currentFile,
    setCurrentFile,
    createPersistentFile,
    updatePersistentFile,
    deletePersistentFile,
    shareFile,
    
    // File system operations
    fileStructure,
    openFiles,
    activeFile,
    setActiveFile,
    closeFile,
    toggleDirectory,
    collapseDirectories,
    createDirectory,
    updateDirectory,
    renameDirectory,
    deleteDirectory,
    openFile,
    createFileSystemFile,
    updateFileContent,
    renameFile,
    deleteFileSystemFile,
    downloadFilesAndFolders,
    
    // Loading and error states
    loading,
    error,
    roomId: urlRoomId
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};

export const useFile = () => {
    const context = useContext(FileContext);
    if (!context) {
      throw new Error('useFile must be used within a FileProvider');
    }
    return context;
  };

export { FileProvider }; 