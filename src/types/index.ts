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
    fromEmail: string; // New field to define the default sender email
    fromName: string;  // New field to define the default sender name
    isActive: boolean;
    status?: 'active' | 'standby' | 'failed';
    lastUsed?: Date;
    failureCount?: number;
    standbyUntil?: Date;
    lastError?: string;
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
    failedEmails: number;
    progress?: number;
    currentEmail?: string;
    isPaused?: boolean;
    logs?: EmailSendLog[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailSendLog {
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    email?: string;
    smtpId?: string;
}

export interface SmtpUsageTracker {
    smtpId: string;
    lastUsed: Date;
    usageCount: number;
    failureCount: number;
    isStandby: boolean;
    standbyUntil?: Date;
    status: 'active' | 'standby' | 'failed';
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

export interface TxtFileCheck {
    hasDirectory: boolean;
    hasTxtFiles: boolean;
    message: string;
}

export * from './electron';

