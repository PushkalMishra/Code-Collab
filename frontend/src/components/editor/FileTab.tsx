import React from 'react';
import { useFile } from '../../context/FileContext';
import { getLanguageIcon } from '../../utils/language-icons';
import { XMarkIcon } from '@heroicons/react/24/solid';

const FileTab: React.FC = () => {
    const { openFiles, activeFile, setActiveFile, closeFile } = useFile();

    if (!openFiles || openFiles.length === 0) {
        return null; // Don't render anything if no files are open
    }

    return (
        <div className="flex bg-[#252526] border-b border-t border-gray-700">
            {openFiles.map((file) => {
                const { abbr, color } = getLanguageIcon(file.name);
                const isActive = activeFile?.id === file.id;

                return (
                    <div
                        key={file.id}
                        className={`flex items-center justify-between p-2 cursor-pointer border-r border-gray-700 ${isActive ? 'bg-[#1e1e1e]' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e3e]'}`}
                        onClick={() => setActiveFile(file)}
                    >
                        <div className="flex items-center">
                            <span className={`${color} w-6 text-center mr-2 font-mono text-xs`}>{abbr}</span>
                            <span className="text-sm">{file.name}</span>
                        </div>
                        <XMarkIcon
                            className="h-4 w-4 ml-4 text-gray-500 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeFile(file.id);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default FileTab;