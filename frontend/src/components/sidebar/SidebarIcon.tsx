import React from 'react';
import { SidebarIconProps } from '../../types/sidebar.types';

export const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, active, onClick }) => (
    <div 
        className={`sidebar-icon${active ? ' active' : ''}`} 
        onClick={onClick} 
        title={label}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
        {icon}
    </div>
); 