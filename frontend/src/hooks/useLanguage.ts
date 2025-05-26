import { useState, useCallback } from 'react';

export type LanguageType = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

export const useLanguage = () => {
    const [language, setLanguage] = useState<LanguageType>('javascript');

    const changeLanguage = useCallback((newLanguage: LanguageType) => {
        setLanguage(newLanguage);
    }, []);

    return {
        language,
        changeLanguage
    };
}; 