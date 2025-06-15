import React from 'react';
import { SidebarIcon } from '../SidebarIcon';
import { UsersViewProps } from './types';

export const UsersView: React.FC<UsersViewProps> = ({ activePanel, switchPanel, togglePanel, isPanelOpen }) => (
    <SidebarIcon
        icon={<span>👥</span>}
        label="Users"
        active={activePanel === 'users' && isPanelOpen}
        onClick={() => {
            switchPanel('users');
        }}
    />
); 