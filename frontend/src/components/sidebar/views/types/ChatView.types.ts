import { PanelType } from './index';

export interface ChatViewProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
    setIsFilePanelOpen: (isOpen: boolean) => void;
} 