import {
    FileContent,
    FileContext as FileContextType,
    FileName,
    FileSystemItem,
    Id,
} from "../types/file"
import { SocketEvent } from "../types/socket"
import { RemoteUser } from "../types/user"
import {
    findParentDirectory,
    getFileById,
    initialFileStructure,
    isFileExist,
} from "../utils/file"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useAppContext } from "./AppContext"
import { useSocket } from "./SocketContext"

const FileContext = createContext<FileContextType | null>(null)

export const useFileSystem = (): FileContextType => {
    const context = useContext(FileContext)
    if (!context) {
        throw new Error("useFileSystem must be used within FileContextProvider")
    }
    return context
}

function FileContextProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket()
    const { setUsers, drawingData } = useAppContext()

    const [fileStructure, setFileStructure] =
        useState<FileSystemItem>(initialFileStructure)
    const initialOpenFiles = fileStructure.children
        ? fileStructure.children
        : []
    const [openFiles, setOpenFiles] =
        useState<FileSystemItem[]>(initialOpenFiles)
    const [activeFile, setActiveFile] = useState<FileSystemItem | null>(
        openFiles[0],
    )

    // Function to toggle the isOpen property of a directory (Directory Open/Close)
    const toggleDirectory = (dirId: Id) => {
        const toggleDir = (directory: FileSystemItem): FileSystemItem => {
            if (directory.id === dirId) {
                return {
                    ...directory,
                    isOpen: !directory.isOpen,
                }
            } else if (directory.children) {
                return {
                    ...directory,
                    children: directory.children.map(toggleDir),
                }
            } else {
                return directory
            }
        }

        // Update fileStructure with the opened directory
        setFileStructure((prevFileStructure) => toggleDir(prevFileStructure))
    }

    const collapseDirectories = () => {
        const collapseDir = (directory: FileSystemItem): FileSystemItem => {
            return {
                ...directory,
                isOpen: false,
                children: directory.children?.map(collapseDir),
            }
        }

        setFileStructure((prevFileStructure) => collapseDir(prevFileStructure))
    }

    const createDirectory = useCallback(
        (
            parentDirId: string,
            newDir: string | FileSystemItem,
            sendToSocket: boolean = true,
        ) => {
            let newDirectory: FileSystemItem
            if (typeof newDir === "string") {
                newDirectory = {
                    id: uuidv4(),
                    name: newDir,
                    type: "directory",
                    children: [],
                    isOpen: false,
                }
            } else {
                newDirectory = newDir
            }

            if (!parentDirId) parentDirId = fileStructure.id

            const addDirectoryToParent = (
                directory: FileSystemItem,
            ): FileSystemItem => {
                if (directory.id === parentDirId) {
                    // If the current directory matches the parent, add new directory to its children
                    return {
                        ...directory,
                        children: [...(directory.children || []), newDirectory],
                    }
                } else if (directory.children) {
                    // If it's not the parent directory, recursively update children
                    return {
                        ...directory,
                        children: directory.children.map(addDirectoryToParent),
                    }
                } else {
                    // Return the directory as is if it has no children
                    return directory
                }
            }

            setFileStructure((prevFileStructure) =>
                addDirectoryToParent(prevFileStructure),
            )

            if (!sendToSocket) return newDirectory.id
            if (socket) {
                 socket.emit(SocketEvent.DIRECTORY_CREATED, {
                     parentDirId,
                     newDirectory,
                 })
            }

            return newDirectory.id
        },
        [fileStructure.id, socket],
    )

    const updateDirectory = useCallback(
        (
            dirId: string,
            children: FileSystemItem[],
            sendToSocket: boolean = true,
        ) => {
            if (!dirId) dirId = fileStructure.id

            const updateChildren = (
                directory: FileSystemItem,
            ): FileSystemItem => {
                if (directory.id === dirId) {
                    return {
                        ...directory,
                        children,
                    }
                } else if (directory.children) {
                    return {
                        ...directory,
                        children: directory.children.map(updateChildren),
                    }
                } else {
                    return directory
                }
            }

            setFileStructure((prevFileStructure) =>
                updateChildren(prevFileStructure),
            )

            // Close all open files in the directory being updated
            setOpenFiles([])

            // Set the active file to null if it's in the directory being updated
            setActiveFile(null)

            if (dirId === fileStructure.id) {
                toast.dismiss()
                toast.success("Files and folders updated")
            }

            if (!sendToSocket) return
            if (socket) {
                 socket.emit(SocketEvent.DIRECTORY_UPDATED, {
                     dirId,
                     children,
                 })
            }
        },
        [fileStructure.id, socket],
    )

    const renameDirectory = useCallback(
        (
            dirId: string,
            newDirName: string,
            sendToSocket: boolean = true,
        ): boolean => {
            const renameInDirectory = (
                directory: FileSystemItem,
            ): FileSystemItem | null => {
                if (directory.type === "directory" && directory.children) {
                    // Check if a directory with the new name already exists
                    const isNameTaken = directory.children.some(
                        (item) =>
                            item.type === "directory" &&
                            item.name === newDirName &&
                            item.id !== dirId,
                    )

                    if (isNameTaken) {
                        return null // Name is already taken
                    }

                    return {
                        ...directory,
                        children: directory.children.map((item) => {
                            if (item.id === dirId) {
                                return {
                                    ...item,
                                    name: newDirName,
                                }
                            } else if (item.type === "directory") {
                                // Recursively update nested directories
                                const updatedNestedDir = renameInDirectory(item)
                                return updatedNestedDir !== null
                                    ? updatedNestedDir
                                    : item
                            } else {
                                return item
                            }
                        }),
                    }
                } else {
                    return directory
                }
            }

            const updatedFileStructure = renameInDirectory(fileStructure)

            if (updatedFileStructure === null) {
                return false
            }

            setFileStructure(updatedFileStructure)

            if (!sendToSocket) return true
            if (socket) {
                 socket.emit(SocketEvent.DIRECTORY_RENAMED, {
                     dirId,
                     newDirName,
                 })
            }

            return true
        },
        [socket, setFileStructure, fileStructure],
    )

    const deleteDirectory = useCallback(
        (dirId: string, sendToSocket: boolean = true) => {
            // Recursive function to find and delete the file in nested directories
            const deleteFromDirectory = (
                directory: FileSystemItem,
            ): FileSystemItem | null => {
                if (directory.type === "directory" && directory.id === dirId) {
                    // If the current directory matches the one to delete, return null (remove it)
                    return null
                } else if (directory.children) {
                    // If it's not the directory to delete, recursively update children
                    const updatedChildren = directory.children
                        .map(deleteFromDirectory)
                        .filter((item) => item !== null) as FileSystemItem[]
                    return {
                        ...directory,
                        children: updatedChildren,
                    }
                } else {
                    // Return the directory as is if it has no children
                    return directory
                }
            }

            setFileStructure(
                (prevFileStructure) => deleteFromDirectory(prevFileStructure)!
            )

            if (!sendToSocket) return
            if (socket) {
                 socket.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
            }
        },
        [socket],
    )

    // Function to find a file in the file structure
    const findFileInStructure = useCallback((fileId: Id): FileSystemItem | null => {
        const findFile = (item: FileSystemItem): FileSystemItem | null => {
            if (item.id === fileId) return item;
            if (item.children) {
                for (const child of item.children) {
                    const found = findFile(child);
                    if (found) return found;
                }
            }
            return null;
        };
        return findFile(fileStructure);
    }, [fileStructure]);

    // Function to update file content in the file structure
    const updateFileInStructure = useCallback((fileId: Id, newContent: FileContent) => {
        const updateContent = (item: FileSystemItem): FileSystemItem => {
            if (item.id === fileId) {
                return { ...item, content: newContent };
            }
            if (item.children) {
                return {
                    ...item,
                    children: item.children.map(updateContent)
                };
            }
            return item;
        };
        setFileStructure(prev => updateContent(prev));
    }, []);

    const openFile = useCallback((fileId: Id) => {
        const fileToOpen = findFileInStructure(fileId);
        if (fileToOpen && fileToOpen.type === 'file') {
            // If file is not already open, add it to openFiles
            if (!openFiles.some(file => file.id === fileId)) {
                setOpenFiles(prevOpenFiles => [...prevOpenFiles, fileToOpen]);
            }
            setActiveFile(fileToOpen);
        }
    }, [fileStructure, openFiles, findFileInStructure]);

    const closeFile = useCallback((fileId: Id) => {
        // Save the content of the active file before closing
        if (activeFile?.id === fileId) {
            updateFileInStructure(activeFile.id, activeFile.content || "");
        }

        // Remove the file from openFiles
        setOpenFiles(prevOpenFiles => {
            const newOpenFiles = prevOpenFiles.filter(file => file.id !== fileId);
            
            // Set new active file if needed
            if (activeFile?.id === fileId) {
                if (newOpenFiles.length > 0) {
                    setActiveFile(newOpenFiles[0]);
                } else {
                    setActiveFile(null);
                }
            }
            
            return newOpenFiles;
        });
    }, [activeFile, updateFileInStructure]);

    const createFile = useCallback(
        (
            parentDirId: string,
            file: FileName | FileSystemItem,
            sendToSocket: boolean = true,
        ): Id => {
            // Check if file with same name already exists
            let num = 1

            if (!parentDirId) parentDirId = fileStructure.id

            const parentDir = getFileById(fileStructure, parentDirId)
            if (!parentDir || parentDir.type !== 'directory') {
                throw new Error("Parent directory not found or is not a directory")
            }

            let newFile: FileSystemItem

            if (typeof file === "string") {
                let name = file
                let fileExists = isFileExist(parentDir, name)
                while (fileExists) {
                    name = `${name.split(".")[0]}(${num}).${name.split(".")[1]}`
                    fileExists = isFileExist(parentDir, name)
                    num++
                }

                newFile = {
                    id: uuidv4(),
                    name,
                    type: "file",
                    content: "",
                }
            } else {
                newFile = file
            }

            const updateDirectory = (
                directory: FileSystemItem,
            ): FileSystemItem => {
                if (directory.id === parentDirId) {
                    // If directory matches parentDir, return updated directory with new file
                    return {
                        ...directory,
                        children: [...(directory.children || []), newFile],
                        isOpen: true, // Ensure parent directory is open
                    }
                } else if (directory.children) {
                    // If directory has children, recursively update each child
                    return {
                        ...directory,
                        children: directory.children.map(updateDirectory),
                    }
                } else {
                    // Otherwise, return unchanged directory
                    return directory
                }
            }

            // Update fileStructure with the updated parentDir
            setFileStructure((prevFileStructure) =>
                updateDirectory(prevFileStructure),
            )

            // Add the new file to openFiles
            setOpenFiles((prevOpenFiles) => [...prevOpenFiles, newFile])

            // Set the new file as active file
            setActiveFile(newFile)

            if (!sendToSocket) return newFile.id
            if (socket) {
                 socket.emit(SocketEvent.FILE_CREATED, {
                     parentDirId,
                     newFile,
                 })
            }

            return newFile.id
        },
        [fileStructure, socket],
    )

    const updateFileContent = useCallback((fileId: string, newContent: FileContent) => {
        // Update content in openFiles
        setOpenFiles(prevOpenFiles =>
            prevOpenFiles.map(file =>
                file.id === fileId ? { ...file, content: newContent } : file
            )
        );

        // Update content in activeFile if it's the current file
        if (activeFile && activeFile.id === fileId) {
            setActiveFile(prevActiveFile => prevActiveFile ? { ...prevActiveFile, content: newContent } : null);
        }

        // Update content in file structure
        updateFileInStructure(fileId, newContent);

        // Emit content change to backend
        if (socket) {
            socket.emit(SocketEvent.FILE_UPDATED, { fileId, newContent });
        }
    }, [activeFile, socket, updateFileInStructure]);

    const renameFile = useCallback(
        (
            fileId: string,
            newName: string,
            sendToSocket: boolean = true,
        ): boolean => {
            const renameInDirectory = (
                directory: FileSystemItem,
            ): FileSystemItem => {
                if (directory.type === "directory" && directory.children) {
                    return {
                        ...directory,
                        children: directory.children.map((item) => {
                            if (item.type === "file" && item.id === fileId) {
                                return {
                                    ...item,
                                    name: newName,
                                }
                            } else {
                                return item
                            }
                        }),
                    }
                } else {
                    return directory
                }
            }

            setFileStructure((prevFileStructure) =>
                renameInDirectory(prevFileStructure)
            )

            // Update Open Files
            setOpenFiles((prevOpenFiles) =>
                prevOpenFiles.map((file) => {
                    if (file.id === fileId) {
                        return {
                            ...file,
                            name: newName,
                        }
                    } else {
                        return file
                    }
                })
            )

            // Update Active File
            if (fileId === activeFile?.id) {
                setActiveFile((prevActiveFile) => {
                    if (prevActiveFile) {
                        return {
                            ...prevActiveFile,
                            name: newName,
                        }
                    } else {
                        return null
                    }
                })
            }

            if (!sendToSocket) return true
            if (socket) {
                 socket.emit(SocketEvent.FILE_RENAMED, {
                     fileId,
                     newName,
                 })
            }

            return true
        },
        [activeFile?.id, socket],
    )

    const deleteFile = useCallback(
        (fileId: string, sendToSocket: boolean = true) => {
            // Save content before deletion if it's the active file
            if (activeFile?.id === fileId) {
                updateFileContent(fileId, activeFile.content || "");
            }

            // Remove from openFiles first
            setOpenFiles((prevOpenFiles) => {
                const newOpenFiles = prevOpenFiles.filter((file) => file.id !== fileId);
                
                // Set new active file if needed
                if (activeFile?.id === fileId) {
                    if (newOpenFiles.length > 0) {
                        setActiveFile(newOpenFiles[0]);
                    } else {
                        setActiveFile(null);
                    }
                }
                
                return newOpenFiles;
            });

            // Then remove from file structure
            const deleteFileFromDirectory = (
                directory: FileSystemItem,
            ): FileSystemItem | null => {
                if (directory.type === "directory" && directory.children) {
                    const updatedChildren = directory.children
                        .map((child) => {
                            if (child.type === "directory") {
                                return deleteFileFromDirectory(child);
                            }
                            if (child.type === "file" && child.id !== fileId) {
                                return child;
                            }
                            return null;
                        })
                        .filter((child) => child !== null) as FileSystemItem[];

                    return {
                        ...directory,
                        children: updatedChildren,
                    };
                }
                return directory;
            };

            setFileStructure((prevFileStructure) =>
                deleteFileFromDirectory(prevFileStructure) as FileSystemItem
            );

            if (!sendToSocket) return;
            if (socket) {
                 socket.emit(SocketEvent.FILE_DELETED, { fileId });
            }
        },
        [activeFile, socket, updateFileContent],
    );

    const downloadFilesAndFolders = () => {
        const zip = new JSZip()

        const downloadRecursive = (
            item: FileSystemItem,
            parentPath: string = "",
        ) => {
            const currentPath =
                parentPath + item.name + (item.type === "directory" ? "/" : "")

            if (item.type === "file") {
                zip.file(currentPath, item.content || "") // Add file to zip
            } else if (item.type === "directory" && item.children) {
                for (const child of item.children) {
                    downloadRecursive(child, currentPath)
                }
            }
        }

        // Start downloading from the children of the root directory
        if (fileStructure.type === "directory" && fileStructure.children) {
            for (const child of fileStructure.children) {
                downloadRecursive(child)
            }
        }

        // Generate and save zip file
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "download.zip")
        })
    }

    const handleUserJoined = useCallback(
        (user: RemoteUser) => {
            toast.success(`${user.username} joined the room`)

            // Send the code and drawing data to the server
            if (socket) {
                 socket.emit(SocketEvent.SYNC_FILE_STRUCTURE, {
                     fileStructure,
                     openFiles,
                     activeFile,
                     socketId: user.socketId,
                 })

                 socket.emit(SocketEvent.SYNC_DRAWING, {
                     drawingData,
                     socketId: user.socketId,
                 })
            }

            setUsers((prev: RemoteUser[]) => [...prev, user])
        },
        [activeFile, drawingData, fileStructure, openFiles, setUsers, socket],
    )

    const handleFileStructureSync = useCallback(
        ({
            fileStructure,
            openFiles,
            activeFile,
        }: {
            fileStructure: FileSystemItem
            openFiles: FileSystemItem[]
            activeFile: FileSystemItem | null
        }) => {
            setFileStructure(fileStructure)
            setOpenFiles(openFiles)
            setActiveFile(activeFile)
            toast.dismiss()
        },
        [],
    )

    const handleDirCreated = useCallback(
        ({
            parentDirId,
            newDirectory,
        }: {
            parentDirId: Id
            newDirectory: FileSystemItem
        }) => {
            createDirectory(parentDirId, newDirectory, false)
        },
        [createDirectory],
    )

    const handleDirUpdated = useCallback(
        ({ dirId, children }: { dirId: Id; children: FileSystemItem[] }) => {
            updateDirectory(dirId, children, false)
        },
        [updateDirectory],
    )

    const handleDirRenamed = useCallback(
        ({ dirId, newName }: { dirId: Id; newName: FileName }) => {
            renameDirectory(dirId, newName, false)
        },
        [renameDirectory],
    )

    const handleDirDeleted = useCallback(
        ({ dirId }: { dirId: Id }) => {
            deleteDirectory(dirId, false)
        },
        [deleteDirectory],
    )

    const handleFileCreated = useCallback(
        ({
            parentDirId,
            newFile,
        }: {
            parentDirId: Id
            newFile: FileSystemItem
        }) => {
            createFile(parentDirId, newFile, false)
        },
        [createFile],
    )

    const handleFileRenamed = useCallback(
        ({ fileId, newName }: { fileId: string; newName: FileName }) => {
            renameFile(fileId, newName, false)
        },
        [renameFile],
    )

    const handleFileDeleted = useCallback(
        ({ fileId }: { fileId: Id }) => {
            deleteFile(fileId, false)
        },
        [deleteFile],
    )

    const handleFileUpdated = useCallback(
        ({ fileId, newContent }: { fileId: Id; newContent: FileContent }) => {
            // Update the content of the specific file in openFiles
            setOpenFiles(prevOpenFiles =>
                prevOpenFiles.map(file =>
                    file.id === fileId ? { ...file, content: newContent } : file
                )
            );
            // Update the content of the active file if it's the same file
            setActiveFile(prevActiveFile =>
                prevActiveFile && prevActiveFile.id === fileId
                    ? { ...prevActiveFile, content: newContent }
                    : prevActiveFile
            );
        },
        [], // Dependencies: updateFileContent and activeFile are not needed here as we directly modify state
    );

    useEffect(() => {
        socket?.once(SocketEvent.SYNC_FILE_STRUCTURE, handleFileStructureSync)
        socket?.on(SocketEvent.USER_JOINED, handleUserJoined)
        socket?.on(SocketEvent.DIRECTORY_CREATED, handleDirCreated)
        socket?.on(SocketEvent.DIRECTORY_UPDATED, handleDirUpdated)
        socket?.on(SocketEvent.DIRECTORY_RENAMED, handleDirRenamed)
        socket?.on(SocketEvent.DIRECTORY_DELETED, handleDirDeleted)
        socket?.on(SocketEvent.FILE_CREATED, handleFileCreated)
        socket?.on(SocketEvent.FILE_UPDATED, handleFileUpdated)
        socket?.on(SocketEvent.FILE_RENAMED, handleFileRenamed)
        socket?.on(SocketEvent.FILE_DELETED, handleFileDeleted)

        return () => {
            // Add null check for socket before removing listeners
            if (socket) {
                socket.off(SocketEvent.USER_JOINED)
                socket.off(SocketEvent.DIRECTORY_CREATED)
                socket.off(SocketEvent.DIRECTORY_UPDATED)
                socket.off(SocketEvent.DIRECTORY_RENAMED)
                socket.off(SocketEvent.DIRECTORY_DELETED)
                socket.off(SocketEvent.FILE_CREATED)
                socket.off(SocketEvent.FILE_UPDATED)
                socket.off(SocketEvent.FILE_RENAMED)
                socket.off(SocketEvent.FILE_DELETED)
            }
        }
    }, [
        handleDirCreated,
        handleDirDeleted,
        handleDirRenamed,
        handleDirUpdated,
        handleFileCreated,
        handleFileDeleted,
        handleFileRenamed,
        handleFileStructureSync,
        handleUserJoined,
        socket,
    ])

    return (
        <FileContext.Provider
            value={{
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
                createFile,
                updateFileContent,
                renameFile,
                deleteFile,
                downloadFilesAndFolders,
            }}
        >
            {children}
        </FileContext.Provider>
    )
}

export { FileContextProvider }
export default FileContext 