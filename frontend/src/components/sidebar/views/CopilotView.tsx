import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { CopilotViewProps } from './types';

export const CopilotView: React.FC<CopilotViewProps> = ({ activePanel, switchPanel, togglePanel, isPanelOpen }) => (
    <SidebarIcon
        icon={<span>🤖</span>}
        label="Copilot"
        active={activePanel === 'copilot' && isPanelOpen}
        onClick={() => {
            switchPanel('copilot');
        }}
    />
); 