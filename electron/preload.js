import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Menu actions
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-new-campaign', callback);
        ipcRenderer.on('menu-save-campaign', callback);
        ipcRenderer.on('menu-send-campaign', callback);
        ipcRenderer.on('menu-pause-campaign', callback);
        ipcRenderer.on('menu-preview-email', callback);
        ipcRenderer.on('menu-about', callback);
    },
    
    // Window state
    onWindowStateChange: (callback) => {
        ipcRenderer.on('window-maximized', callback);
        ipcRenderer.on('window-unmaximized', callback);
    },

    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // File operations (for future use)
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    
    // Notifications
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
