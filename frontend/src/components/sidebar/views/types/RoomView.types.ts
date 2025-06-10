import { PanelType } from './index';

export interface RoomViewProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
    setIsFilePanelOpen: (isOpen: boolean) => void;
} 