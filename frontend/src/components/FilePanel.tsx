import React, { useState } from 'react';
import { useFile } from '../context/FileContext';
import { useAuth } from '../context/AuthContext';
import { File as FileType } from '../services/fileService';
import '../App.css';

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

const FilePanel: React.FC = () => {
  const {
    files,
    fileStructure,
    createPersistentFile,
    createFileSystemFile,
    openFile,
    toggleDirectory,
    activeFile,
    loading,
    error
  } = useFile();
  const { isLoggedIn, user } = useAuth();
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;

    if (isLoggedIn) {
      // Create persistent file in MongoDB
      await createPersistentFile(newFileName, '', selectedLanguage);
    } else {
      // Create local file system file at root level (empty string for parentId)
      createFileSystemFile('', newFileName, '', selectedLanguage);
    }

    setNewFileName('');
    setShowNewFileInput(false);
  };

  const renderFileTree = (items: FileSystemItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} style={{ marginLeft: `${level * 20}px` }}>
        {item.type === 'directory' ? (
          <div className="directory-item">
            <span
              className="directory-toggle"
              onClick={() => toggleDirectory(item.id)}
            >
              {item.isOpen ? '📂' : '📁'} {item.name}
            </span>
            {item.isOpen && item.children && renderFileTree(item.children, level + 1)}
          </div>
        ) : (
          <div
            className={`file-item ${activeFile?.id === item.id ? 'active' : ''}`}
            onClick={() => openFile(item)}
          >
            📄 {item.name}
          </div>
        )}
      </div>
    ));
  };

  const renderPersistentFiles = () => {
    if (!isLoggedIn) return null;

    return (
      <div className="persistent-files">
        <h3>My Files</h3>
        {files.map((file) => (
          <div
            key={file._id}
            className={`file-item ${activeFile?.id === file._id ? 'active' : ''}`}
            onClick={() => openFile({
              id: file._id,
              name: file.name,
              type: 'file',
              parentId: null,
              content: file.content,
              language: file.language,
            })}
          >
            📄 {file.name}
            <span className="file-owner">{file.owner.username}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="file-panel-loading">Loading files...</div>;
  }

  if (error) {
    return <div className="file-panel-error">{error}</div>;
  }

  return (
    <div className="file-panel">
      <div className="file-panel-header">
        <h2>Files</h2>
        <button
          className="new-file-button"
          onClick={() => setShowNewFileInput(true)}
        >
          New File
        </button>
      </div>

      {showNewFileInput && (
        <div className="new-file-input">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Enter file name"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={handleCreateFile}>Create</button>
          <button onClick={() => setShowNewFileInput(false)}>Cancel</button>
        </div>
      )}

      {renderPersistentFiles()}
      
      <div className="file-system">
        <h3>File System</h3>
        {renderFileTree(fileStructure)}
      </div>
    </div>
  );
};

export default FilePanel; 