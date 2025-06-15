import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { CodeViewProps } from './types';

export const CodeView: React.FC<CodeViewProps> = ({ activePanel, switchPanel, togglePanel, isPanelOpen }) => (
    <SidebarIcon
        icon={<span>📄</span>}
        label="Files"
        active={activePanel === 'code' && isPanelOpen}
        onClick={() => {
            switchPanel('code');
        }}
    />
); 