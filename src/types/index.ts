export interface EmailList {
    id: string;
    name: string;
    emails: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface SmtpConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    isActive: boolean;
}

export interface EmailCampaign {
    id: string;
    subject: string;
    sender: string;
    htmlContent: string;
    selectedLists: string[];
    status: 'draft' | 'sending' | 'paused' | 'completed' | 'failed';
    totalEmails: number;
    sentEmails: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailJob {
    id: string;
    campaignId: string;
    email: string;
    status: 'pending' | 'sending' | 'sent' | 'failed';
    smtpId?: string;
    error?: string;
    sentAt?: Date;
}

export interface SendingStats {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    rate: number; // emails per minute
}

export interface ApiConfig {
    useMock: boolean;
    baseUrl: string;
}

export interface AppSettings {
    threads: number;
    timeout: number;
    proxies: string[];
}

export interface ProxyTestResult {
    proxy: string;
    status: 'success' | 'failed';
    responseTime?: number;
    error?: string;
}
