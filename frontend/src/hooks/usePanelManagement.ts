import { useState, useCallback } from 'react';
import { PanelType } from '../components/sidebar/views/types';

export const usePanelManagement = () => {
    const [activePanel, setActivePanel] = useState<PanelType | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const switchPanel = useCallback((panel: PanelType) => {
        if (activePanel === panel && isPanelOpen) {
            setIsPanelOpen(false); // Close panel if already open and clicked again
            setActivePanel(null); // Clear active panel
        } else {
        setActivePanel(panel);
            setIsPanelOpen(true); // Open panel
        }
    }, [activePanel, isPanelOpen]);

    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
        if (isPanelOpen && activePanel) {
            setActivePanel(null); // Clear active panel when closing manually
        }
    }, [isPanelOpen, activePanel]);

    return {
        activePanel,
        isPanelOpen,
        switchPanel,
        togglePanel
    };
}; 