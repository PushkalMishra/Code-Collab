export type Id = string
export type FileName = string
export type FileContent = string

export interface FileSystemItem {
    id: Id
    name: FileName
    type: 'file' | 'directory'
    parentId: string | null; // <--- Add this line
    content?: FileContent
    children?: FileSystemItem[]
    isOpen?: boolean
}

export interface FileContext {
    fileStructure: FileSystemItem
    openFiles: FileSystemItem[]
    activeFile: FileSystemItem | null
    setActiveFile: (file: FileSystemItem | null) => void
    closeFile: (fileId: Id) => void
    toggleDirectory: (dirId: Id) => void
    collapseDirectories: () => void
    createDirectory: (parentDirId: string, newDir: string | FileSystemItem, sendToSocket?: boolean) => Id
    updateDirectory: (dirId: string, children: FileSystemItem[], sendToSocket?: boolean) => void
    renameDirectory: (dirId: string, newDirName: string, sendToSocket?: boolean) => boolean
    deleteDirectory: (dirId: string, sendToSocket?: boolean) => void
    openFile: (fileId: Id) => void
    createFile: (parentDirId: string, file: FileName | FileSystemItem, sendToSocket?: boolean) => Id
    updateFileContent: (fileId: string, newContent: FileContent) => void
    renameFile: (fileId: string, newName: string, sendToSocket?: boolean) => boolean
    deleteFile: (fileId: string, sendToSocket?: boolean) => void
    downloadFilesAndFolders: () => void
}