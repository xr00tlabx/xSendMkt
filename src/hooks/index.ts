import { useEffect, useState } from 'react';
import { apiService } from '../services';
import type { EmailCampaign, EmailList, SmtpConfig, TxtFileCheck } from '../types';

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

    const fetchLists = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getEmailLists();
            setLists(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch email lists');
        } finally {
            setLoading(false);
        }
    };

    const createList = async (data: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>) => {
        setLoading(true);
        setError(null);
        try {
            const newList = await apiService.createEmailList(data);
            setLists(prev => [...prev, newList]);
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
            const updatedList = await apiService.updateEmailList(id, data);
            setLists(prev => prev.map(list => list.id === id ? updatedList : list));
            return updatedList;
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete email list');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

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
            setConfigs(data);
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
            const newConfig = await apiService.createSmtpConfig(data);
            setConfigs(prev => [...prev, newConfig]);
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
            const updatedConfig = await apiService.updateSmtpConfig(id, data);
            setConfigs(prev => prev.map(config => config.id === id ? updatedConfig : config));
            return updatedConfig;
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
            await apiService.deleteSmtpConfig(id);
            setConfigs(prev => prev.filter(config => config.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete SMTP config');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return {
        configs,
        loading,
        error,
        createConfig,
        updateConfig,
        deleteConfig,
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
            const data = await apiService.getCampaigns();
            setCampaigns(data);
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
            const newCampaign = await apiService.createCampaign(data);
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
            const updatedCampaign = await apiService.updateCampaign(id, data);
            setCampaigns(prev => prev.map(campaign => campaign.id === id ? updatedCampaign : campaign));
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
            const updatedCampaign = await apiService.sendCampaign(id);
            setCampaigns(prev => prev.map(campaign => campaign.id === id ? updatedCampaign : campaign));
            return updatedCampaign;
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
            const updatedCampaign = await apiService.pauseCampaign(id);
            setCampaigns(prev => prev.map(campaign => campaign.id === id ? updatedCampaign : campaign));
            return updatedCampaign;
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
