import { FileSystemItem, Id } from "../types/file"
import { v4 as uuidv4 } from "uuid"

const initialCode = `function sayHi() {
  console.log("👋 Hello world");
}

sayHi()`

export const initialFileStructure: FileSystemItem = {
    id: 'root',
    name: 'root',
    type: 'directory',
    parentId: null,
    children: [],
    isOpen: true
};

export const findParentDirectory = (
    fileStructure: FileSystemItem,
    targetId: Id
): FileSystemItem | null => {
    if (fileStructure.children) {
        for (const child of fileStructure.children) {
            if (child.id === targetId) {
                return fileStructure;
            }
            if (child.type === 'directory') {
                const found = findParentDirectory(child, targetId);
                if (found) return found;
            }
        }
    }
    return null;
};

export const getFileById = (
    fileStructure: FileSystemItem,
    targetId: Id
): FileSystemItem | null => {
    if (fileStructure.id === targetId) {
        return fileStructure;
    }
    if (fileStructure.children) {
        for (const child of fileStructure.children) {
            const found = getFileById(child, targetId);
            if (found) return found;
        }
    }
    return null;
};

export const isFileExist = (
    directory: FileSystemItem,
    fileName: string
): boolean => {
    if (!directory.children) return false;
    return directory.children.some(
        (item) => item.type === 'file' && item.name === fileName
    );
};

export const sortFileSystemItem = (item: FileSystemItem): FileSystemItem => {
    // Recursively sort children if it's a directory
    if (item.type === "directory" && item.children) {
        // Separate directories and files
        let directories = item.children.filter(
            (child: FileSystemItem) => child.type === "directory",
        )
        const files = item.children.filter((child: FileSystemItem) => child.type === "file")

        // Sort directories by name (A-Z)
        directories.sort((a: FileSystemItem, b: FileSystemItem) => a.name.localeCompare(b.name))

        // Recursively sort nested directories
        directories = directories.map((dir: FileSystemItem) => sortFileSystemItem(dir))

        // Sort files by name (A-Z)
        files.sort((a: FileSystemItem, b: FileSystemItem) => a.name.localeCompare(b.name))

        // Combine sorted directories and files
        item.children = [
            ...directories.filter((dir) => dir.name.startsWith(".")),
            ...directories.filter((dir) => !dir.name.startsWith(".")),
            ...files.filter((file) => file.name.startsWith(".")),
            ...files.filter((file) => !file.name.startsWith(".")),
        ]
    }

    return item
} 