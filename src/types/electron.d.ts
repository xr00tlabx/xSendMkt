// Definições de tipos para a API do Electron

export interface SmtpConfig {
    id?: number;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    from_email: string;
    from_name: string;
    is_active?: boolean;
    last_used?: string;
    success_count?: number;
    error_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface EmailData {
    to: string;
    subject: string;
    html: string;
    text?: string;
    campaignId?: number;
}

export interface Campaign {
    id?: number;
    name: string;
    subject: string;
    html_content: string;
    text_content?: string;
    status?: 'draft' | 'sending' | 'sent' | 'paused' | 'failed';
    total_emails?: number;
    sent_emails?: number;
    failed_emails?: number;
    created_at?: string;
    updated_at?: string;
    sent_at?: string;
}

export interface EmailList {
    name: string;
    path: string;
    size: number;
    modified: Date;
    emailCount: number;
}

export interface EmailContact {
    email: string;
    name?: string;
}

export interface EmailLog {
    id: number;
    campaign_id?: number;
    smtp_id?: number;
    recipient_email: string;
    status: 'sent' | 'failed';
    error_message?: string;
    sent_at: string;
    campaign_name?: string;
    smtp_name?: string;
}

export interface QueueStatus {
    isProcessing: boolean;
    queueLength: number;
    maxConcurrent: number;
    delayBetweenEmails: number;
}

export interface TestResult {
    success: boolean;
    message: string;
}

export interface SmtpTestResult extends TestResult {
    id?: number;
    name?: string;
}

export interface FileDialogResult {
    success: boolean;
    canceled?: boolean;
    directory?: string;
    filePath?: string;
    emails?: EmailContact[];
    count?: number;
    error?: string;
}

export interface ValidationResult {
    valid: EmailContact[];
    invalid: string[];
    totalOriginal: number;
    totalValid: number;
    totalInvalid: number;
}

export interface DomainStats {
    domain: string;
    count: number;
}

// API do Electron exposta via contextBridge
export interface ElectronAPI {
// App methods
    getAppVersion: () => Promise<string>;

    // Dialog methods
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;

    // Notification methods
    showNotification: (notification: { title: string; body: string }) => Promise<void>;

    // Database API
    database: {
        // Settings
        getSetting: (key: string) => Promise<any>;
        setSetting: (key: string, value: any, type?: string) => Promise<boolean>;
        getAllSettings: () => Promise<Record<string, any>>;

        // SMTPs
        addSmtp: (smtpData: SmtpConfig) => Promise<number>;
        getAllSmtps: () => Promise<SmtpConfig[]>;
        updateSmtp: (id: number, smtpData: SmtpConfig) => Promise<boolean>;
        deleteSmtp: (id: number) => Promise<boolean>;
        clearAllSmtps: () => Promise<boolean>;

        // Campaigns
        saveCampaign: (campaignData: Campaign) => Promise<number>;
        getCampaign: (id: number) => Promise<Campaign | null>;
        getAllCampaigns: () => Promise<Campaign[]>;

        // Logs
        getEmailLogs: (campaignId?: number, limit?: number) => Promise<EmailLog[]>;
    };

    // Email API
    email: {
        testSmtp: (smtpConfig: SmtpConfig) => Promise<TestResult>;
        testAllSmtps: () => Promise<SmtpTestResult[]>;
        sendSingle: (emailData: EmailData, smtpId: number) => Promise<any>;
        sendTest: (smtpId: number, testEmail: string) => Promise<any>;
        addToQueue: (emails: EmailData[], campaignId?: number) => Promise<{ success: boolean }>;
        pauseQueue: () => Promise<{ success: boolean }>;
        resumeQueue: () => Promise<{ success: boolean }>;
        clearQueue: () => Promise<{ success: boolean }>;
        getQueueStatus: () => Promise<QueueStatus>;
    };

    // File API
    files: {
        selectListsDirectory: () => Promise<FileDialogResult>;
        setListsDirectory: (directory: string) => Promise<{ success: boolean }>;
        getListsDirectory: () => Promise<string>;
        getEmailLists: () => Promise<EmailList[]>;
        readEmails: (filename: string) => Promise<EmailContact[]>;
        saveEmailList: (filename: string, emails: EmailContact[], format?: string) => Promise<string>;
        deleteEmailList: (filename: string) => Promise<boolean>;
        clearAllLists: () => Promise<boolean>;
        mergeLists: (filenames: string[], outputFilename: string, format?: string) => Promise<string>;
        validateAndCleanList: (filename: string) => Promise<ValidationResult>;
        filterEmailsByDomain: (emails: EmailContact[], domains: string[], exclude?: boolean) => Promise<EmailContact[]>;
        selectAndImport: () => Promise<FileDialogResult>;
    };

    // Window API
    windows: {
        openSettings: () => Promise<any>;
        openSmtpManager: () => Promise<any>;
        openEmailLists: () => Promise<any>;
        openTestSmtps: () => Promise<any>;
        openLoadSmtps: () => Promise<any>;
        openCampaign: (campaignId?: number) => Promise<any>;
        openStatistics: () => Promise<any>;
        closeModal: (windowId: string) => Promise<boolean>;
        getModal: (windowId: string) => Promise<{ id: string; isOpen: boolean } | null>;
        sendToModal: (windowId: string, channel: string, data: any) => Promise<boolean>;
    };    // Menu event listeners
    onMenuNewCampaign: (callback: () => void) => void;
    onMenuSaveCampaign: (callback: () => void) => void;
    onMenuClearLists: (callback: () => void) => void;
    onMenuClearSmtps: (callback: () => void) => void;
    onMenuLoadSmtps: (callback: () => void) => void;
    onMenuTestSmtps: (callback: () => void) => void;
    onMenuOpenSettings: (callback: () => void) => void;

    // Window event listeners
    onWindowMaximized: (callback: () => void) => void;
    onWindowUnmaximized: (callback: () => void) => void;

    // Generic event listener
    on: (channel: string, callback: () => void) => void;

    // Cleanup
    removeAllListeners: (channel: string) => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };

