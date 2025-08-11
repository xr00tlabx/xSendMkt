import { apiConfig } from './apiConfig';
import { mockApi } from './mockApi';
import { realApi } from './realApi';

// Main API service that switches between mock and real API
export const apiService = {
    // Email Lists
    getEmailLists: () => apiConfig.useMock ? mockApi.getEmailLists() : realApi.getEmailLists(),
    createEmailList: (data: Parameters<typeof mockApi.createEmailList>[0]) =>
        apiConfig.useMock ? mockApi.createEmailList(data) : realApi.createEmailList(data),
    updateEmailList: (id: string, data: Parameters<typeof mockApi.updateEmailList>[1]) =>
        apiConfig.useMock ? mockApi.updateEmailList(id, data) : realApi.updateEmailList(id, data),
    deleteEmailList: (id: string) =>
        apiConfig.useMock ? mockApi.deleteEmailList(id) : realApi.deleteEmailList(id),

    // SMTP Configs
    getSmtpConfigs: () => apiConfig.useMock ? mockApi.getSmtpConfigs() : realApi.getSmtpConfigs(),
    createSmtpConfig: (data: Parameters<typeof mockApi.createSmtpConfig>[0]) =>
        apiConfig.useMock ? mockApi.createSmtpConfig(data) : realApi.createSmtpConfig(data),
    updateSmtpConfig: (id: string, data: Parameters<typeof mockApi.updateSmtpConfig>[1]) =>
        apiConfig.useMock ? mockApi.updateSmtpConfig(id, data) : realApi.updateSmtpConfig(id, data),
    deleteSmtpConfig: (id: string) =>
        apiConfig.useMock ? mockApi.deleteSmtpConfig(id) : realApi.deleteSmtpConfig(id),

    // Campaigns
    getCampaigns: () => apiConfig.useMock ? mockApi.getCampaigns() : realApi.getCampaigns(),
    createCampaign: (data: Parameters<typeof mockApi.createCampaign>[0]) =>
        apiConfig.useMock ? mockApi.createCampaign(data) : realApi.createCampaign(data),
    updateCampaign: (id: string, data: Parameters<typeof mockApi.updateCampaign>[1]) =>
        apiConfig.useMock ? mockApi.updateCampaign(id, data) : realApi.updateCampaign(id, data),
    sendCampaign: (id: string) =>
        apiConfig.useMock ? mockApi.sendCampaign(id) : realApi.sendCampaign(id),
    pauseCampaign: (id: string) =>
        apiConfig.useMock ? mockApi.pauseCampaign(id) : realApi.pauseCampaign(id),
    getSendingStats: (campaignId: string) =>
        apiConfig.useMock ? mockApi.getSendingStats(campaignId) : realApi.getSendingStats(campaignId),
};
