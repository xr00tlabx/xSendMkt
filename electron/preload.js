const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App methods
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Dialog methods
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

    // Notification methods
    showNotification: (notification) => ipcRenderer.invoke('show-notification', notification),

    // Database API
    database: {
        // Settings
        getSetting: (key) => ipcRenderer.invoke('db:get-setting', key),
        setSetting: (key, value, type) => ipcRenderer.invoke('db:set-setting', key, value, type),
        getAllSettings: () => ipcRenderer.invoke('db:get-all-settings'),

        // SMTPs
        addSmtp: (smtpData) => ipcRenderer.invoke('db:add-smtp', smtpData),
        getAllSmtps: () => ipcRenderer.invoke('db:get-all-smtps'),
        updateSmtp: (id, smtpData) => ipcRenderer.invoke('db:update-smtp', id, smtpData),
        deleteSmtp: (id) => ipcRenderer.invoke('db:delete-smtp', id),
        clearAllSmtps: () => ipcRenderer.invoke('db:clear-all-smtps'),

        // Campaigns
        saveCampaign: (campaignData) => ipcRenderer.invoke('db:save-campaign', campaignData),
        getCampaign: (id) => ipcRenderer.invoke('db:get-campaign', id),
        getAllCampaigns: () => ipcRenderer.invoke('db:get-all-campaigns'),

        // Logs
        getEmailLogs: (campaignId, limit) => ipcRenderer.invoke('db:get-email-logs', campaignId, limit)
    },

    // Email API
    email: {
        testSmtp: (smtpConfig) => ipcRenderer.invoke('email:test-smtp', smtpConfig),
        testAllSmtps: () => ipcRenderer.invoke('email:test-all-smtps'),
        sendSingle: (emailData, smtpId) => ipcRenderer.invoke('email:send-single', emailData, smtpId),
        sendTest: (smtpId, testEmail) => ipcRenderer.invoke('email:send-test', smtpId, testEmail),
        addToQueue: (emails, campaignId) => ipcRenderer.invoke('email:add-to-queue', emails, campaignId),
        pauseQueue: () => ipcRenderer.invoke('email:pause-queue'),
        resumeQueue: () => ipcRenderer.invoke('email:resume-queue'),
        clearQueue: () => ipcRenderer.invoke('email:clear-queue'),
        getQueueStatus: () => ipcRenderer.invoke('email:get-queue-status')
    },

    // File API
    files: {
        selectListsDirectory: () => ipcRenderer.invoke('file:select-lists-directory'),
        setListsDirectory: (directory) => ipcRenderer.invoke('file:set-lists-directory', directory),
        getListsDirectory: () => ipcRenderer.invoke('file:get-lists-directory'),
        getEmailLists: () => ipcRenderer.invoke('file:get-email-lists'),
        readEmails: (filename) => ipcRenderer.invoke('file:read-emails', filename),
        saveEmailList: (filename, emails, format) => ipcRenderer.invoke('file:save-email-list', filename, emails, format),
        deleteEmailList: (filename) => ipcRenderer.invoke('file:delete-email-list', filename),
        clearAllLists: () => ipcRenderer.invoke('file:clear-all-lists'),
        mergeLists: (filenames, outputFilename, format) => ipcRenderer.invoke('file:merge-lists', filenames, outputFilename, format),
        validateAndCleanList: (filename) => ipcRenderer.invoke('file:validate-and-clean-list', filename),
        filterEmailsByDomain: (emails, domains, exclude) => ipcRenderer.invoke('file:filter-emails-by-domain', emails, domains, exclude),
        selectAndImport: () => ipcRenderer.invoke('file:select-and-import')
    },

    // Window API
    windows: {
        openSettings: () => ipcRenderer.invoke('window:open-settings'),
        openSmtpManager: () => ipcRenderer.invoke('window:open-smtp-manager'),
        openEmailLists: () => ipcRenderer.invoke('window:open-email-lists'),
        openTestSmtps: () => ipcRenderer.invoke('window:open-test-smtps'),
        openLoadSmtps: () => ipcRenderer.invoke('window:open-load-smtps'),
        openCampaign: (campaignId) => ipcRenderer.invoke('window:open-campaign', campaignId),
        openStatistics: () => ipcRenderer.invoke('window:open-statistics'),
        closeModal: (windowId) => ipcRenderer.invoke('window:close-modal', windowId),
        getModal: (windowId) => ipcRenderer.invoke('window:get-modal', windowId),
        sendToModal: (windowId, channel, data) => ipcRenderer.invoke('window:send-to-modal', windowId, channel, data)
    },

    // Menu event listeners
    onMenuNewCampaign: (callback) => ipcRenderer.on('menu-new-campaign', callback),
    onMenuSaveCampaign: (callback) => ipcRenderer.on('menu-save-campaign', callback),
    onMenuClearLists: (callback) => ipcRenderer.on('menu-clear-lists', callback),
    onMenuClearSmtps: (callback) => ipcRenderer.on('menu-clear-smtps', callback),
    onMenuLoadSmtps: (callback) => ipcRenderer.on('menu-load-smtps', callback),
    onMenuTestSmtps: (callback) => ipcRenderer.on('menu-test-smtps', callback),
    onMenuOpenSettings: (callback) => ipcRenderer.on('menu-open-settings', callback),

    // Window event listeners
    onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', callback),
    onWindowUnmaximized: (callback) => ipcRenderer.on('window-unmaximized', callback),

    // Generic event listener
    on: (channel, callback) => {
        const validChannels = [
            'menu-new-campaign',
            'menu-save-campaign',
            'menu-clear-lists',
            'menu-clear-smtps',
            'menu-load-smtps',
            'menu-test-smtps',
            'menu-open-settings',
            'window-maximized',
            'window-unmaximized'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    },
    
    // Cleanup
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
