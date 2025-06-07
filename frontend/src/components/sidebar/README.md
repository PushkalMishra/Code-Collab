# Sidebar Component

This directory contains the sidebar component implementation for the Code-Sync editor.

## Directory Structure

```
sidebar/
├── README.md           # This documentation file
├── Sidebar.tsx         # Main sidebar component
├── Sidebar.css         # Sidebar styles
├── SidebarIcon.tsx     # Reusable sidebar icon component
├── types.ts            # TypeScript type definitions
└── views/              # Individual panel views
    ├── index.ts        # View exports
    ├── CodeView.tsx    # Code editor panel
    ├── ChatView.tsx    # Chat panel
    └── CopilotView.tsx # Copilot panel
```

## Components

### Sidebar
The main sidebar component that manages the navigation between different panels.

### SidebarIcon
A reusable component for sidebar navigation icons with hover and active states.

### Views
- **CodeView**: Handles the code editor panel with file management
- **ChatView**: Manages the chat interface
- **CopilotView**: Controls the AI copilot interface

## Usage

```typescript
import Sidebar from './components/sidebar/Sidebar';

// In your component:
<Sidebar
    activePanel={activePanel}
    setActivePanel={setActivePanel}
    setIsFilePanelOpen={setIsFilePanelOpen}
/>
```

## Styling
The sidebar uses a dedicated CSS file (`Sidebar.css`) for styling, including:
- Fixed width (60px)
- Dark theme
- Responsive design
- Hover and active states
- Accessibility features 