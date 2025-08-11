import { ipcMain } from 'electron';
import {
    closeModalWindow,
    createCampaignWindow,
    createEmailListsWindow,
    createLoadSmtpsWindow,
    createSettingsWindow,
    createSmtpManagerWindow,
    createStatisticsWindow,
    createTestSmtpsWindow,
    getModalWindow
} from '../utils/windowManager.js';

export function setupWindowHandlers(getMainWindow) {
    // Open settings window
    ipcMain.handle('window:open-settings', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createSettingsWindow(mainWindow);
    });

    // Open SMTP manager
    ipcMain.handle('window:open-smtp-manager', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createSmtpManagerWindow(mainWindow);
    });

    // Open email lists manager
    ipcMain.handle('window:open-email-lists', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createEmailListsWindow(mainWindow);
    });

    // Open test SMTPs window
    ipcMain.handle('window:open-test-smtps', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createTestSmtpsWindow(mainWindow);
    });

    // Open load SMTPs window
    ipcMain.handle('window:open-load-smtps', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createLoadSmtpsWindow(mainWindow);
    });

    // Open campaign window
    ipcMain.handle('window:open-campaign', (event, campaignId = null) => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createCampaignWindow(mainWindow, campaignId);
    });

    // Open statistics window
    ipcMain.handle('window:open-statistics', () => {
        const mainWindow = typeof getMainWindow === 'function' ? getMainWindow() : getMainWindow;
        return createStatisticsWindow(mainWindow);
    });

    // Close specific modal window
    ipcMain.handle('window:close-modal', (event, windowId) => {
        closeModalWindow(windowId);
        return true;
    });

    // Get modal window reference
    ipcMain.handle('window:get-modal', (event, windowId) => {
        const window = getModalWindow(windowId);
        return window ? { id: windowId, isOpen: !window.isDestroyed() } : null;
    });

    // Send message to modal window
    ipcMain.handle('window:send-to-modal', (event, windowId, channel, data) => {
        const window = getModalWindow(windowId);
        if (window && !window.isDestroyed()) {
            window.webContents.send(channel, data);
            return true;
        }
        return false;
    });
}
