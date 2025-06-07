export type PanelType = 'code' | 'chat' | 'copilot';

export interface SidebarIconProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

export interface SidebarViewProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
    setIsFilePanelOpen: (isOpen: boolean) => void;
} 