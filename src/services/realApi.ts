import axios from 'axios';
import type { EmailCampaign, EmailList, SendingStats, SmtpConfig } from '../types';
import { apiConfig } from './apiConfig';

const api = axios.create({
    baseURL: apiConfig.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const realApi = {
    // Email Lists
    async getEmailLists(): Promise<EmailList[]> {
        const response = await api.get('/email-lists');
        return response.data;
    },

    async createEmailList(data: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailList> {
        const response = await api.post('/email-lists', data);
        return response.data;
    },

    async updateEmailList(id: string, data: Partial<EmailList>): Promise<EmailList> {
        const response = await api.put(`/email-lists/${id}`, data);
        return response.data;
    },

    async deleteEmailList(id: string): Promise<void> {
        await api.delete(`/email-lists/${id}`);
    },

    // SMTP Configs
    async getSmtpConfigs(): Promise<SmtpConfig[]> {
        const response = await api.get('/smtp-configs');
        return response.data;
    },

    async createSmtpConfig(data: Omit<SmtpConfig, 'id'>): Promise<SmtpConfig> {
        const response = await api.post('/smtp-configs', data);
        return response.data;
    },

    async updateSmtpConfig(id: string, data: Partial<SmtpConfig>): Promise<SmtpConfig> {
        const response = await api.put(`/smtp-configs/${id}`, data);
        return response.data;
    },

    async deleteSmtpConfig(id: string): Promise<void> {
        await api.delete(`/smtp-configs/${id}`);
    },

    // Campaigns
    async getCampaigns(): Promise<EmailCampaign[]> {
        const response = await api.get('/campaigns');
        return response.data;
    },

    async createCampaign(data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
        const response = await api.post('/campaigns', data);
        return response.data;
    },

    async updateCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign> {
        const response = await api.put(`/campaigns/${id}`, data);
        return response.data;
    },

    async sendCampaign(id: string): Promise<EmailCampaign> {
        const response = await api.post(`/campaigns/${id}/send`);
        return response.data;
    },

    async pauseCampaign(id: string): Promise<EmailCampaign> {
        const response = await api.post(`/campaigns/${id}/pause`);
        return response.data;
    },

    async getSendingStats(campaignId: string): Promise<SendingStats> {
        const response = await api.get(`/campaigns/${campaignId}/stats`);
        return response.data;
    }
};
