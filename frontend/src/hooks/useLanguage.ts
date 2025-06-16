import { useState, useCallback } from 'react';

export type LanguageType = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

export const useLanguage = () => {
    const [language, setLanguage] = useState<LanguageType>('javascript');

    const changeLanguage = useCallback((newLanguage: LanguageType) => {
        setLanguage(newLanguage);
    }, []);

    const getLanguageFromExtension = useCallback((filename: string): LanguageType => {
        const parts = filename.split('.');
        const ext = parts[parts.length - 1];
        switch (ext) {
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            case 'cpp':
            case 'c':
            case 'h':
                return 'cpp';
            default:
                return 'javascript'; // Default to javascript if extension is unknown
        }
    }, []);

    return {
        language,
        changeLanguage,
        getLanguageFromExtension
    };
}; 