import type { EmailCampaign, EmailJob, EmailList, SendingStats, SmtpConfig } from '../types';

// Mock data
const mockEmailLists: EmailList[] = [
    {
        id: '1',
        name: 'Lista Premium',
        emails: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
    },
    {
        id: '2',
        name: 'Lista Clientes VIP',
        emails: ['vip1@example.com', 'vip2@example.com'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
    },
    {
        id: '3',
        name: 'Lista Newsletter',
        emails: ['news1@example.com', 'news2@example.com', 'news3@example.com', 'news4@example.com'],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-22')
    }
];

const mockSmtpConfigs: SmtpConfig[] = [
    {
        id: '1',
        name: 'Gmail SMTP',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'sender@gmail.com',
        password: '****',
        isActive: true
    },
    {
        id: '2',
        name: 'Outlook SMTP',
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        username: 'sender@outlook.com',
        password: '****',
        isActive: true
    },
    {
        id: '3',
        name: 'SendGrid SMTP',
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        username: 'apikey',
        password: '****',
        isActive: false
    }
];

const mockCampaigns: EmailCampaign[] = [
    {
        id: '1',
        subject: 'Promoção Especial',
        sender: 'marketing@empresa.com',
        htmlContent: '<h1>Promoção Especial!</h1><p>Não perca esta oportunidade única!</p>',
        selectedLists: ['1', '2'],
        status: 'draft',
        totalEmails: 5,
        sentEmails: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const mockJobs: EmailJob[] = [];

// Mock API functions with delays to simulate real API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // Email Lists
    async getEmailLists(): Promise<EmailList[]> {
        await delay(300);
        return [...mockEmailLists];
    },

    async createEmailList(data: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailList> {
        await delay(500);
        const newList: EmailList = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockEmailLists.push(newList);
        return newList;
    },

    async updateEmailList(id: string, data: Partial<EmailList>): Promise<EmailList> {
        await delay(400);
        const index = mockEmailLists.findIndex(list => list.id === id);
        if (index === -1) throw new Error('List not found');

        mockEmailLists[index] = {
            ...mockEmailLists[index],
            ...data,
            updatedAt: new Date()
        };
        return mockEmailLists[index];
    },

    async deleteEmailList(id: string): Promise<void> {
        await delay(300);
        const index = mockEmailLists.findIndex(list => list.id === id);
        if (index === -1) throw new Error('List not found');
        mockEmailLists.splice(index, 1);
    },

    // SMTP Configs
    async getSmtpConfigs(): Promise<SmtpConfig[]> {
        await delay(200);
        return [...mockSmtpConfigs];
    },

    async createSmtpConfig(data: Omit<SmtpConfig, 'id'>): Promise<SmtpConfig> {
        await delay(500);
        const newSmtp: SmtpConfig = {
            ...data,
            id: Date.now().toString()
        };
        mockSmtpConfigs.push(newSmtp);
        return newSmtp;
    },

    async updateSmtpConfig(id: string, data: Partial<SmtpConfig>): Promise<SmtpConfig> {
        await delay(400);
        const index = mockSmtpConfigs.findIndex(smtp => smtp.id === id);
        if (index === -1) throw new Error('SMTP config not found');

        mockSmtpConfigs[index] = {
            ...mockSmtpConfigs[index],
            ...data
        };
        return mockSmtpConfigs[index];
    },

    async deleteSmtpConfig(id: string): Promise<void> {
        await delay(300);
        const index = mockSmtpConfigs.findIndex(smtp => smtp.id === id);
        if (index === -1) throw new Error('SMTP config not found');
        mockSmtpConfigs.splice(index, 1);
    },

    // Campaigns
    async getCampaigns(): Promise<EmailCampaign[]> {
        await delay(250);
        return [...mockCampaigns];
    },

    async createCampaign(data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailCampaign> {
        await delay(600);
        const newCampaign: EmailCampaign = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockCampaigns.push(newCampaign);
        return newCampaign;
    },

    async updateCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign> {
        await delay(400);
        const index = mockCampaigns.findIndex(campaign => campaign.id === id);
        if (index === -1) throw new Error('Campaign not found');

        mockCampaigns[index] = {
            ...mockCampaigns[index],
            ...data,
            updatedAt: new Date()
        };
        return mockCampaigns[index];
    },

    async sendCampaign(id: string): Promise<EmailCampaign> {
        await delay(800);
        const campaign = mockCampaigns.find(c => c.id === id);
        if (!campaign) throw new Error('Campaign not found');

        // Simulate sending process
        campaign.status = 'sending';

        // Create jobs for each email in selected lists
        const selectedLists = mockEmailLists.filter(list => campaign.selectedLists.includes(list.id));
        const allEmails = selectedLists.flatMap(list => list.emails);

        allEmails.forEach(email => {
            mockJobs.push({
                id: Date.now().toString() + Math.random(),
                campaignId: id,
                email,
                status: 'pending'
            });
        });

        campaign.totalEmails = allEmails.length;
        campaign.updatedAt = new Date();

        return campaign;
    },

    async pauseCampaign(id: string): Promise<EmailCampaign> {
        await delay(300);
        const campaign = mockCampaigns.find(c => c.id === id);
        if (!campaign) throw new Error('Campaign not found');

        campaign.status = 'paused';
        campaign.updatedAt = new Date();

        return campaign;
    },

    async getSendingStats(campaignId: string): Promise<SendingStats> {
        await delay(200);
        const jobs = mockJobs.filter(job => job.campaignId === campaignId);
        const sent = jobs.filter(job => job.status === 'sent').length;
        const failed = jobs.filter(job => job.status === 'failed').length;
        const pending = jobs.filter(job => job.status === 'pending').length;

        return {
            total: jobs.length,
            sent,
            failed,
            pending,
            rate: 10 // emails per minute
        };
    }
};
