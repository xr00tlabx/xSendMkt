import pkg from 'electron';
import Database from '../database/index.js';
const { BrowserWindow, ipcMain } = pkg;

export function setupDatabaseHandlers() {
    // Settings handlers
    ipcMain.handle('db:get-setting', async (event, key) => {
        try {
            // console.log('Handler getSetting chamado para key:', key);
            const result = await Database.getSetting(key);
            // console.log('Resultado do Database.getSetting:', { key, result });
            return result;
        } catch (error) {
            console.error('Error getting setting:', error);
            throw error;
        }
    });

    ipcMain.handle('db:set-setting', async (event, key, value, type = 'string') => {
        try {
            // console.log('Handler setSetting chamado:', { key, value, type });
            const result = await Database.setSetting(key, value, type);
            // console.log('Resultado do Database.setSetting:', result);
            return result;
        } catch (error) {
            console.error('Error setting setting:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-all-settings', async () => {
        try {
            return await Database.getAllSettings();
        } catch (error) {
            console.error('Error getting all settings:', error);
            throw error;
        }
    });

    // SMTP handlers
    ipcMain.handle('db:add-smtp', async (event, smtpData) => {
        try {
            const id = await Database.addSmtp(smtpData);
            // Broadcast update to all windows
            BrowserWindow.getAllWindows().forEach(win => {
                win.webContents.send('ui:smtp-configs-updated');
            });
            return id;
        } catch (error) {
            console.error('Error adding SMTP:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-all-smtps', async () => {
        try {
            return await Database.getAllSmtps();
        } catch (error) {
            console.error('Error getting SMTPs:', error);
            throw error;
        }
    });

    ipcMain.handle('db:update-smtp', async (event, id, smtpData) => {
        try {
            const ok = await Database.updateSmtp(id, smtpData);
            if (ok) {
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('ui:smtp-configs-updated');
                });
            }
            return ok;
        } catch (error) {
            console.error('Error updating SMTP:', error);
            throw error;
        }
    });

    ipcMain.handle('db:delete-smtp', async (event, id) => {
        try {
            const ok = await Database.deleteSmtp(id);
            if (ok) {
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('ui:smtp-configs-updated');
                });
            }
            return ok;
        } catch (error) {
            console.error('Error deleting SMTP:', error);
            throw error;
        }
    });

    ipcMain.handle('db:clear-all-smtps', async () => {
        try {
            const ok = await Database.clearAllSmtps();
            if (ok) {
                BrowserWindow.getAllWindows().forEach(win => {
                    win.webContents.send('ui:smtp-configs-updated');
                });
            }
            return ok;
        } catch (error) {
            console.error('Error clearing SMTPs:', error);
            throw error;
        }
    });

    // Campaign handlers
    ipcMain.handle('db:save-campaign', async (event, campaignData) => {
        try {
            return await Database.saveCampaign(campaignData);
        } catch (error) {
            console.error('Error saving campaign:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-campaign', async (event, id) => {
        try {
            return await Database.getCampaign(id);
        } catch (error) {
            console.error('Error getting campaign:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-all-campaigns', async () => {
        try {
            return await Database.getAllCampaigns();
        } catch (error) {
            console.error('Error getting campaigns:', error);
            throw error;
        }
    });

    // Logs handlers
    ipcMain.handle('db:get-email-logs', async (event, campaignId = null, limit = 100) => {
        try {
            return await Database.getEmailLogs(campaignId, limit);
        } catch (error) {
            console.error('Error getting email logs:', error);
            throw error;
        }
    });

    /*
    // Known SMTP configs handlers - TEMPORARIAMENTE DESABILITADOS
    ipcMain.handle('db:add-known-smtp-config', async (event, domain, smtpHost, smtpPort, smtpSecure, providerName) => {
        try {
            return await Database.addKnownSmtpConfig(domain, smtpHost, smtpPort, smtpSecure, providerName);
        } catch (error) {
            console.error('Error adding known SMTP config:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-known-smtp-config', async (event, domain) => {
        try {
            return await Database.getKnownSmtpConfig(domain);
        } catch (error) {
            console.error('Error getting known SMTP config:', error);
            throw error;
        }
    });

    ipcMain.handle('db:get-all-known-smtp-configs', async () => {
        try {
            return await Database.getAllKnownSmtpConfigs();
        } catch (error) {
            console.error('Error getting all known SMTP configs:', error);
            throw error;
        }
    });

    ipcMain.handle('db:delete-known-smtp-config', async (event, domain) => {
        try {
            return await Database.deleteKnownSmtpConfig(domain);
        } catch (error) {
            console.error('Error deleting known SMTP config:', error);
            throw error;
        }
    });
    */
}
