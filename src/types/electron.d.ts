// Electron API types for the renderer process

export interface ElectronAPI {
    // Menu actions - File
    onMenuAction: (callback: () => void) => void;

    // Menu actions - New menus  
    on: (channel: string, callback: () => void) => void;

    // Window state
    onWindowStateChange: (callback: () => void) => void;

    // App info
    getAppVersion: () => Promise<string>;

    // File operations
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;

    // Notifications
    showNotification: (title: string, body: string) => Promise<void>;

    // Remove listeners
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };

