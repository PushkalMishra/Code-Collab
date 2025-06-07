import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { SidebarViewProps } from '../../../types/sidebar.types';

export const CopilotView: React.FC<SidebarViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
    <SidebarIcon
        icon={<span>🤖</span>}
        label="Copilot"
        active={activePanel === 'copilot'}
        onClick={() => {
            setActivePanel('copilot');
            setIsFilePanelOpen(false);
        }}
    />
); 