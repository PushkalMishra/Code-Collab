import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { CodeViewProps } from './types';

export const CodeView: React.FC<CodeViewProps> = ({ activePanel, setActivePanel, setIsFilePanelOpen }) => (
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