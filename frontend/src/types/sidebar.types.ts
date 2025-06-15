export type PanelType = 'code' | 'chat' | 'copilot' | 'users';

export interface SidebarIconProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

export interface SidebarViewProps {
    activePanel: PanelType | null;
    switchPanel: (panel: PanelType) => void;
    isPanelOpen: boolean;
    togglePanel: () => void;
} 