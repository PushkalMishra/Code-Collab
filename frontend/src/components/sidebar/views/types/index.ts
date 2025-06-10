export * from './CodeView.types';
export * from './ChatView.types';
export * from './CopilotView.types';
export * from './RoomView.types';

// Define the panel types
export type PanelType = 'code' | 'chat' | 'copilot' | 'room';

// Base interface for all sidebar views
export interface SidebarViewProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
    setIsFilePanelOpen: (isOpen: boolean) => void;
}

// Specific view props interfaces
export interface CodeViewProps extends SidebarViewProps {}
export interface ChatViewProps extends SidebarViewProps {}
export interface CopilotViewProps extends SidebarViewProps {}
export interface RoomViewProps extends SidebarViewProps {} 