import React from 'react';
import { PanelType } from '../../hooks/usePanelManagement';

interface SidebarProps {
    activePanel: PanelType;
    setActivePanel: (panel: PanelType) => void;
    setIsFilePanelOpen: (isOpen: boolean) => void;
}

const SidebarIcon = ({ icon, label, active, onClick }: any) => (
    <div className={`sidebar-icon${active ? ' active' : ''}`} onClick={onClick} title={label}>
        {icon}
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => {
    return (
        <div className="sidebar">
            <SidebarIcon
                icon={<span>📄</span>}
                label="Files"
                active={activePanel === 'code'}
                onClick={() => {
                    setActivePanel('code');
                    setIsFilePanelOpen(activePanel !== 'code');
                }}
            />
            <SidebarIcon
                icon={<span>💬</span>}
                label="Chat"
                active={activePanel === 'chat'}
                onClick={() => {
                    setActivePanel('chat');
                    setIsFilePanelOpen(false);
                }}
            />
            <SidebarIcon
                icon={<span>🤖</span>}
                label="Copilot"
                active={activePanel === 'copilot'}
                onClick={() => {
                    setActivePanel('copilot');
                    setIsFilePanelOpen(false);
                }}
            />
        </div>
    );
};

export default Sidebar; 