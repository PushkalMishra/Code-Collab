import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { CopilotViewProps } from './types';

export const CopilotView: React.FC<CopilotViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
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