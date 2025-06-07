import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { SidebarViewProps } from '../../../types/sidebar.types';

export const CodeView: React.FC<SidebarViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
    <SidebarIcon
        icon={<span>📄</span>}
        label="Files"
        active={activePanel === 'code'}
        onClick={() => {
            setActivePanel('code');
            setIsFilePanelOpen(activePanel !== 'code');
        }}
    />
); 