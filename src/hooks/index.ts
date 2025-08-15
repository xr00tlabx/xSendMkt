import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services';
import type { EmailCampaign, EmailList, SmtpConfig, TxtFileCheck } from '../types';
import type { Campaign } from '../types/electron';

// Função utilitária para notificar atualizações de listas
export const notifyEmailListsUpdate = () => {
    console.log('📢 Disparando evento emailListsUpdated...');
    const event = new CustomEvent('emailListsUpdated');
    window.dispatchEvent(event);
    // Also notify Electron main to broadcast to all windows (e.g., main + modals)
    try {
        window.electronAPI?.notifyEmailListsUpdated?.();
    } catch { }
    console.log('✅ Evento emailListsUpdated disparado');
};

// Função utilitária para notificar atualizações de SMTPs
export const notifySmtpConfigsUpdate = () => {
    console.log('📢 Disparando evento smtpConfigsUpdated...');
    const event = new CustomEvent('smtpConfigsUpdated');
    window.dispatchEvent(event);
    // Também notifica o processo principal para broadcast entre janelas
    try {
        // Preload pode não ter esses métodos em versões antigas
        // então protegemos com try/catch
        // @ts-ignore
        window.electronAPI?.notifySmtpConfigsUpdated?.();
    } catch { }
    console.log('✅ Evento smtpConfigsUpdated disparado');
};

// Export the new email sender hook
export { useEmailSender } from './useEmailSender';

export const useTxtFileCheck = () => {
    const [txtFileStatus, setTxtFileStatus] = useState<TxtFileCheck>({
        hasDirectory: false,
        hasTxtFiles: false,
        message: 'Verificando...'
    });
    const [loading, setLoading] = useState(false);

    const checkTxtFiles = async () => {
        setLoading(true);
        try {
            const result = await apiService.checkTxtFiles();
            setTxtFileStatus(result);
        } catch (error) {
            setTxtFileStatus({
                hasDirectory: false,
                hasTxtFiles: false,
                message: 'Erro ao verificar arquivos de lista'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTxtFiles();
    }, []);

    return { txtFileStatus, loading, checkTxtFiles };
};

export const useEmailLists = () => {
    const [lists, setLists] = useState<EmailList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getEmailLists();
            console.log('Carregando listas do backend:', data);
            // Convert from electron EmailList[] to app EmailList[]
            const convertedLists = data.map(list => ({
                id: list.name, // Use name as ID
                name: list.name,
                emails: Array(list.emailCount).fill(''), // Create array with correct length for count
                createdAt: list.modified,
                updatedAt: list.modified
            }));
            console.log('Listas convertidas:', convertedLists);
            setLists(convertedLists);
        } catch (err) {
            console.error('Erro ao buscar listas:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch email lists');
        } finally {
            setLoading(false);
        }
    }, []); // Array vazio para que a função não mude entre renders

    const createList = async (data: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>) => {
        setLoading(true);
        setError(null);
        try {
            const newId = await apiService.createEmailList(data);
            const newList: EmailList = {
                id: newId,
                name: data.name,
                emails: data.emails,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setLists(prev => [...prev, newList]);
            // Notificar outros componentes
            notifyEmailListsUpdate();
            return newList;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create email list');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateList = async (id: string, data: Partial<EmailList>) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.updateEmailList(id, data);
            setLists(prev => prev.map(list => 
                list.id === id ? { ...list, ...data, updatedAt: new Date() } : list
            ));
            // Notificar outros componentes
            notifyEmailListsUpdate();
            return { ...data, id, updatedAt: new Date() } as EmailList;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update email list');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteList = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.deleteEmailList(id);
            setLists(prev => prev.filter(list => list.id !== id));
            // Notificar outros componentes
            notifyEmailListsUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete email list');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();

        // Escutar eventos de atualização de listas (intra-window)
        const handleListsUpdate = () => {
            console.log('🔄 Evento emailListsUpdated recebido, recarregando listas...');
            fetchLists();
        };
        window.addEventListener('emailListsUpdated', handleListsUpdate);

        // Escutar broadcast do processo principal (cross-window)
        const handleIpcListsUpdate = () => {
            console.log('🛰️ IPC ui:email-lists-updated recebido, recarregando listas...');
            fetchLists();
        };
        window.electronAPI?.onEmailListsUpdated?.(handleIpcListsUpdate);

        return () => {
            window.removeEventListener('emailListsUpdated', handleListsUpdate);
            // removeAllListeners only if available; otherwise ignore
            try { window.electronAPI?.removeAllListeners?.('ui:email-lists-updated'); } catch { }
        };
    }, [fetchLists]); // fetchLists agora é uma dependência estável

    return {
        lists,
        loading,
        error,
        createList,
        updateList,
        deleteList,
        refetch: fetchLists
    };
};

export const useSmtpConfigs = () => {
    const [configs, setConfigs] = useState<SmtpConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfigs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getSmtpConfigs();
            // Convert from electron SmtpConfig[] to app SmtpConfig[]
            const convertedConfigs: SmtpConfig[] = data.map((config: any) => ({
                id: config.id?.toString() || '',
                name: config.name,
                host: config.host,
                port: config.port,
                secure: !!config.secure,
                username: config.username,
                password: config.password,
                fromEmail: config.from_email || '',
                fromName: config.from_name || '',
                isActive: config.is_active || false
            }));
            setConfigs(convertedConfigs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch SMTP configs');
        } finally {
            setLoading(false);
        }
    };

    const createConfig = async (data: Omit<SmtpConfig, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            // Map to electron schema
            const payload = {
                name: data.name,
                host: data.host,
                port: data.port,
                secure: data.secure,
                username: data.username,
                password: data.password,
                from_email: data.fromEmail,
                from_name: data.fromName,
                is_active: data.isActive
            };
            const newId = await apiService.createSmtpConfig(payload);
            const newConfig: SmtpConfig = { ...data, id: newId.toString() };
            setConfigs(prev => [...prev, newConfig]);
            // Notificar Sidebar e outras telas
            notifySmtpConfigsUpdate();
            return newConfig;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create SMTP config');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (id: string, data: Partial<SmtpConfig>) => {
        setLoading(true);
        setError(null);
        try {
            // Map partial to electron schema
            const payload: any = {};
            if (data.name !== undefined) payload.name = data.name;
            if (data.host !== undefined) payload.host = data.host;
            if (data.port !== undefined) payload.port = data.port;
            if (data.secure !== undefined) payload.secure = data.secure;
            if (data.username !== undefined) payload.username = data.username;
            if (data.password !== undefined) payload.password = data.password;
            if (data.fromEmail !== undefined) payload.from_email = data.fromEmail;
            if (data.fromName !== undefined) payload.from_name = data.fromName;
            if (data.isActive !== undefined) payload.is_active = data.isActive;

            const success = await apiService.updateSmtpConfig(parseInt(id), payload);
            if (success) {
                setConfigs(prev => prev.map(config =>
                    config.id === id ? { ...config, ...data } as SmtpConfig : config
                ));
                // Notificar Sidebar e outras telas
                notifySmtpConfigsUpdate();
                return { ...data, id } as SmtpConfig;
            }
            throw new Error('Update failed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update SMTP config');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteConfig = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.deleteSmtpConfig(parseInt(id));
            setConfigs(prev => prev.filter(config => config.id !== id));
            // Notificar Sidebar e outras telas
            notifySmtpConfigsUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete SMTP config');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const testConfig = async (config: SmtpConfig) => {
        try {
            const payload = {
                name: config.name,
                host: config.host,
                port: config.port,
                secure: config.secure,
                username: config.username,
                password: config.password,
                from_email: config.fromEmail,
                from_name: config.fromName,
                is_active: config.isActive
            };
            // Get timeout setting and apply client-side safety net as well
            const timeoutSetting = await apiService.getSetting('smtp_timeout_ms');
            const timeoutMs = parseInt((timeoutSetting as any) || '10000', 10);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const result = await apiService.testSmtp(payload);
                clearTimeout(timeout);
                return result;
            } catch (err) {
                clearTimeout(timeout);
                throw err;
            }
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchConfigs();

        // Escutar eventos de atualização de SMTPs (intra-window)
        const handleSmtpsUpdate = () => {
            console.log('🔄 Evento smtpConfigsUpdated recebido, recarregando SMTPs...');
            fetchConfigs();
        };
        window.addEventListener('smtpConfigsUpdated', handleSmtpsUpdate);

        // Escutar broadcast do processo principal (cross-window)
        const handleIpcSmtpsUpdate = () => {
            console.log('🛰️ IPC ui:smtp-configs-updated recebido, recarregando SMTPs...');
            // @ts-ignore
            fetchConfigs();
        };
        try {
            // @ts-ignore
            window.electronAPI?.onSmtpConfigsUpdated?.(handleIpcSmtpsUpdate);
        } catch { }

        return () => {
            window.removeEventListener('smtpConfigsUpdated', handleSmtpsUpdate);
            try {
                // @ts-ignore
                window.electronAPI?.removeAllListeners?.('ui:smtp-configs-updated');
            } catch { }
        };
    }, []);

    return {
        configs,
        loading,
        error,
        createConfig,
        updateConfig,
        deleteConfig,
        testConfig,
        refetch: fetchConfigs
    };
};

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const data: Campaign[] = await apiService.getCampaigns();
            // Convert Campaign[] to EmailCampaign[]
            const convertedCampaigns: EmailCampaign[] = data.map(campaign => {
                // Map status from Campaign to EmailCampaign
                let status: 'draft' | 'sending' | 'paused' | 'completed' | 'failed' = 'draft';
                if (campaign.status === 'sent') status = 'completed';
                else if (campaign.status === 'draft' || campaign.status === 'sending' || 
                         campaign.status === 'paused' || campaign.status === 'failed') {
                    status = campaign.status;
                }

                return {
                    id: campaign.id?.toString() || '',
                    subject: campaign.subject,
                    sender: campaign.name, // Use name as sender
                    htmlContent: campaign.html_content,
                    selectedLists: [], // Will need to be populated separately
                    status,
                    totalEmails: campaign.total_emails || 0,
                    sentEmails: campaign.sent_emails || 0,
                    failedEmails: campaign.failed_emails || 0,
                    createdAt: campaign.created_at ? new Date(campaign.created_at) : new Date(),
                    updatedAt: campaign.updated_at ? new Date(campaign.updated_at) : new Date()
                };
            });
            setCampaigns(convertedCampaigns);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async (data: Omit<EmailCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
        setLoading(true);
        setError(null);
        try {
            // Convert EmailCampaign to Campaign format for API
            const campaignData: Campaign = {
                name: data.sender,
                subject: data.subject,
                html_content: data.htmlContent,
                status: data.status === 'completed' ? 'sent' : data.status
            };
            const newId = await apiService.createCampaign(campaignData);
            const newCampaign: EmailCampaign = {
                ...data,
                id: newId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setCampaigns(prev => [...prev, newCampaign]);
            return newCampaign;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCampaign = async (id: string, data: Partial<EmailCampaign>) => {
        setLoading(true);
        setError(null);
        try {
            // Convert partial EmailCampaign to Campaign format for API
            const campaignData: Partial<Campaign> = {};
            if (data.sender) campaignData.name = data.sender;
            if (data.subject) campaignData.subject = data.subject;
            if (data.htmlContent) campaignData.html_content = data.htmlContent;
            if (data.status) {
                campaignData.status = data.status === 'completed' ? 'sent' : data.status;
            }

            await apiService.updateCampaign(parseInt(id), campaignData);
            const updatedCampaign = { ...data, id, updatedAt: new Date() } as EmailCampaign;
            setCampaigns(prev => prev.map(campaign => 
                campaign.id === id ? { ...campaign, ...updatedCampaign } : campaign
            ));
            return updatedCampaign;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update campaign');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendCampaign = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.sendCampaign(parseInt(id));
            setCampaigns(prev => prev.map(campaign => 
                campaign.id === id ? { ...campaign, status: 'sending' as const, updatedAt: new Date() } : campaign
            ));
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send campaign');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const pauseCampaign = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiService.pauseCampaign(parseInt(id));
            setCampaigns(prev => prev.map(campaign => 
                campaign.id === id ? { ...campaign, status: 'paused' as const, updatedAt: new Date() } : campaign
            ));
            return null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to pause campaign');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    return {
        campaigns,
        loading,
        error,
        createCampaign,
        updateCampaign,
        sendCampaign,
        pauseCampaign,
        refetch: fetchCampaigns
    };
};
