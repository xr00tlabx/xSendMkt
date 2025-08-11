// Real API service using SQLite via Electron
export const apiService = {
    // Email Lists
    getEmailLists: () => window.electronAPI?.files?.getEmailLists() || Promise.resolve([]),

    createEmailList: (data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) =>
        window.electronAPI?.files?.saveEmailList(data.name + '.txt', data.emails, 'txt') || Promise.resolve({
            id: Date.now().toString(),
            name: data.name,
            emails: data.emails,
            createdAt: new Date(),
            updatedAt: new Date()
        }),

    updateEmailList: (id: string, data: Partial<any>) =>
        window.electronAPI?.files?.saveEmailList(data.name + '.txt', data.emails, 'txt') || Promise.resolve({
            id,
            ...data,
            updatedAt: new Date()
        }),

    checkTxtFiles: () => window.electronAPI?.files?.checkTxtFiles() || Promise.resolve({
        hasDirectory: false,
        hasTxtFiles: false,
        message: 'Função não disponível'
    }),

    readEmailList: (filename: string) =>
        window.electronAPI?.files?.readEmails(filename) || Promise.resolve([]),

    saveEmailList: (filename: string, emails: any[], format?: string) =>
        window.electronAPI?.files?.saveEmailList(filename, emails, format) || Promise.resolve(''),

    deleteEmailList: (filename: string) =>
        window.electronAPI?.files?.deleteEmailList(filename) || Promise.resolve(false),

    // SMTP Configs
    getSmtpConfigs: () => window.electronAPI?.database?.getAllSmtps() || Promise.resolve([]),

    createSmtpConfig: (data: any) =>
        window.electronAPI?.database?.addSmtp(data) || Promise.resolve(0),

    updateSmtpConfig: (id: number, data: any) =>
        window.electronAPI?.database?.updateSmtp(id, data) || Promise.resolve(false),

    deleteSmtpConfig: (id: number) =>
        window.electronAPI?.database?.deleteSmtp(id) || Promise.resolve(false),

    clearAllSmtps: () =>
        window.electronAPI?.database?.clearAllSmtps() || Promise.resolve(false),

    // Campaigns
    getCampaigns: () => window.electronAPI?.database?.getAllCampaigns() || Promise.resolve([]),

    saveCampaign: (data: any) =>
        window.electronAPI?.database?.saveCampaign(data) || Promise.resolve(0),

    getCampaign: (id: number) =>
        window.electronAPI?.database?.getCampaign(id) || Promise.resolve(null),

    createCampaign: (data: any) =>
        window.electronAPI?.database?.saveCampaign(data) || Promise.resolve(0),

    updateCampaign: (id: number, data: any) =>
        window.electronAPI?.database?.saveCampaign({ ...data, id }) || Promise.resolve(data),

    sendCampaign: async (id: number) => {
        const campaign = await window.electronAPI?.database?.getCampaign(id);
        if (campaign) {
            return window.electronAPI?.database?.saveCampaign({ ...campaign, status: 'sending' }) || Promise.resolve(null);
        }
        return Promise.resolve(null);
    },

    pauseCampaign: async (id: number) => {
        const campaign = await window.electronAPI?.database?.getCampaign(id);
        if (campaign) {
            return window.electronAPI?.database?.saveCampaign({ ...campaign, status: 'paused' }) || Promise.resolve(null);
        }
        return Promise.resolve(null);
    },

    // Email Operations
    testSmtp: (smtpConfig: any) =>
        window.electronAPI?.email?.testSmtp(smtpConfig) || Promise.resolve({ success: false }),

    testAllSmtps: () =>
        window.electronAPI?.email?.testAllSmtps() || Promise.resolve([]),

    sendEmail: (emailData: any, smtpId: number) =>
        window.electronAPI?.email?.sendSingle(emailData, smtpId) || Promise.resolve({}),

    addToQueue: (emails: any[], campaignId?: number) =>
        window.electronAPI?.email?.addToQueue(emails, campaignId) || Promise.resolve({ success: false }),

    pauseQueue: () =>
        window.electronAPI?.email?.pauseQueue() || Promise.resolve({ success: false }),

    resumeQueue: () =>
        window.electronAPI?.email?.resumeQueue() || Promise.resolve({ success: false }),

    clearQueue: () =>
        window.electronAPI?.email?.clearQueue() || Promise.resolve({ success: false }),

    getQueueStatus: () =>
        window.electronAPI?.email?.getQueueStatus() || Promise.resolve({
            pending: 0,
            sending: 0,
            sent: 0,
            failed: 0
        }),

    // Settings
    getSetting: (key: string) =>
        window.electronAPI?.database?.getSetting(key) || Promise.resolve(null),

    setSetting: (key: string, value: any, type?: string) =>
        window.electronAPI?.database?.setSetting(key, value, type) || Promise.resolve(false),

    getAllSettings: () =>
        window.electronAPI?.database?.getAllSettings() || Promise.resolve({}),

    // File Operations
    selectListsDirectory: () =>
        window.electronAPI?.files?.selectListsDirectory() || Promise.resolve({ success: false }),

    setListsDirectory: (directory: string) =>
        window.electronAPI?.files?.setListsDirectory(directory) || Promise.resolve({ success: false }),

    getListsDirectory: () =>
        window.electronAPI?.files?.getListsDirectory() || Promise.resolve(''),

    // Logs
    getEmailLogs: (campaignId?: number, limit?: number) =>
        window.electronAPI?.database?.getEmailLogs(campaignId, limit) || Promise.resolve([])
};

export default apiService;
