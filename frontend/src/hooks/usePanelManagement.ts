import { useState, useCallback } from 'react';

export type PanelType = 'code' | 'chat' | 'copilot';

export const usePanelManagement = () => {
    const [activePanel, setActivePanel] = useState<PanelType>('code');
    const [isFilePanelOpen, setIsFilePanelOpen] = useState(true);

    const switchPanel = useCallback((panel: PanelType) => {
        setActivePanel(panel);
        setIsFilePanelOpen(panel === 'code');
    }, []);

    const toggleFilePanel = useCallback(() => {
        setIsFilePanelOpen(prev => !prev);
    }, []);

    return {
        activePanel,
        isFilePanelOpen,
        switchPanel,
        toggleFilePanel
    };
}; 