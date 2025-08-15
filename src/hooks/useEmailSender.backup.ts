import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services';
import type { EmailCampaign, EmailSendLog, SmtpConfig, SmtpUsageTracker } from '../types';

export interface EmailSenderState {
    isActive: boolean;
    isPaused: boolean;
    progress: number;
    currentEmail: string;
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
    logs: EmailSendLog[];
    smtpUsage: SmtpUsageTracker[];
    estimatedTimeRemaining: number;
    emailsPerSecond: number;
    sendingSpeed: number; // emails per second (configurable)
}

export interface EmailSenderConfig {
    sendingSpeed: number; // emails per second
    retryFailedEmails: boolean;
    maxRetries: number;
    smtpRotationMode: 'round-robin' | 'least-used' | 'random';
}

export const useEmailSender = () => {
    const [state, setState] = useState<EmailSenderState>({
        isActive: false,
        isPaused: false,
        progress: 0,
        currentEmail: '',
        totalEmails: 0,
        sentEmails: 0,
        failedEmails: 0,
        logs: [],
        smtpUsage: [],
        estimatedTimeRemaining: 0,
        emailsPerSecond: 0,
        sendingSpeed: 1 // Default: 1 email per second
    });

    const [config, setConfig] = useState<EmailSenderConfig>({
        sendingSpeed: 1,
        retryFailedEmails: false,
        maxRetries: 3,
        smtpRotationMode: 'least-used'
    });

    const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
    const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
    const [sendingInterval, setSendingInterval] = useState<NodeJS.Timeout | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // Função para obter o próximo SMTP disponível
    const getNextAvailableSmtp = useCallback((): SmtpConfig | null => {
        const now = new Date();

        // Filtrar SMTPs ativos e não em standby
        const availableSmtps = smtpConfigs.filter(smtp => {
            if (!smtp.isActive) return false;
            if (smtp.standbyUntil && smtp.standbyUntil > now) return false;
            return true;
        });

        if (availableSmtps.length === 0) {
            return null;
        }

        // Ordenar por último uso (menos usado primeiro)
        availableSmtps.sort((a, b) => {
            const aLastUsed = a.lastUsed || new Date(0);
            const bLastUsed = b.lastUsed || new Date(0);
            return aLastUsed.getTime() - bLastUsed.getTime();
        });

        return availableSmtps[0];
    }, [smtpConfigs]);

    // Função para colocar SMTP em standby
    const putSmtpInStandby = useCallback((smtpId: string, error: string) => {
        setSmtpConfigs(prev => prev.map(smtp => {
            if (smtp.id === smtpId) {
                const failureCount = (smtp.failureCount || 0) + 1;
                const standbyMinutes = Math.min(failureCount * 5, 60); // Max 1 hora
                const standbyUntil = new Date(Date.now() + standbyMinutes * 60 * 1000);

                return {
                    ...smtp,
                    status: 'standby' as const,
                    failureCount,
                    standbyUntil,
                    lastError: error
                };
            }
            return smtp;
        }));

        // Adicionar log
        addLog({
            type: 'warning',
            message: `SMTP ${smtpId} colocado em standby por falha: ${error}`,
            smtpId
        });
    }, []);

    // Função para adicionar log
    const addLog = useCallback((log: Omit<EmailSendLog, 'id' | 'timestamp'>) => {
        const newLog: EmailSendLog = {
            id: Date.now().toString(),
            timestamp: new Date(),
            ...log
        };

        setState(prev => ({
            ...prev,
            logs: [newLog, ...prev.logs].slice(0, 1000) // Manter apenas os últimos 1000 logs
        }));
    }, []);

    // Função para enviar um email
    const sendSingleEmail = useCallback(async (email: string, smtp: SmtpConfig): Promise<boolean> => {
        try {
            if (!currentCampaign) return false;

            setState(prev => ({ ...prev, currentEmail: email }));

            // Log para debug
            console.log('🚀 Enviando email:', {
                email,
                smtpId: smtp.id,
                smtpName: smtp.name,
                subject: currentCampaign.subject
            });

            // Usar a API do Electron para enviar email (mesma que usamos para testar SMTPs)
            const emailData = {
                to: email,
                subject: currentCampaign.subject,
                html: currentCampaign.htmlContent,
                text: currentCampaign.htmlContent.replace(/<[^>]*>/g, ''), // Remove HTML tags para texto
                campaignId: parseInt(currentCampaign.id) || undefined
            };

            // Verificar se a API está disponível
            if (!window.electronAPI?.email?.sendSingle) {
                throw new Error('API de envio de email não disponível');
            }

            const result = await window.electronAPI.email.sendSingle(emailData, parseInt(smtp.id));

            console.log('📧 Resultado do envio:', result);

            // Verificar se o envio foi bem-sucedido
            const success = result && (result.success !== false);

            if (success) {
                // Atualizar SMTP como usado com sucesso
                setSmtpConfigs(prev => prev.map(s =>
                    s.id === smtp.id
                        ? { ...s, lastUsed: new Date(), status: 'active' as const, failureCount: 0 }
                        : s
                ));

                setState(prev => ({
                    ...prev,
                    sentEmails: prev.sentEmails + 1,
                    progress: ((prev.sentEmails + 1) / prev.totalEmails) * 100
                }));

                addLog({
                    type: 'success',
                    message: `✅ Email enviado para ${email}`,
                    email,
                    smtpId: smtp.id
                });

                return true;
            } else {
                throw new Error(result?.error || result?.message || 'Falha no envio');
            }
        } catch (error) {
            console.error('❌ Erro ao enviar email:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

            // Colocar SMTP em standby
            putSmtpInStandby(smtp.id, errorMessage);

            setState(prev => ({
                ...prev,
                failedEmails: prev.failedEmails + 1
            }));

            addLog({
                type: 'error',
                message: `❌ Falha ao enviar para ${email}: ${errorMessage}`,
                email,
                smtpId: smtp.id
            });

            return false;
        }
    }, [currentCampaign, putSmtpInStandby, addLog]);    // Função para buscar todas as listas disponíveis
    const getAllAvailableLists = useCallback(async (): Promise<string[]> => {
        try {
            const lists = await apiService.getEmailLists();
            return lists.map(list => list.name);
        } catch (error) {
            console.error('Erro ao buscar listas disponíveis:', error);
            return [];
        }
    }, []);

    // Função para buscar emails das listas selecionadas (modo automático)
    const getEmailsFromLists = useCallback(async (listIds?: string[]): Promise<string[]> => {
        try {
            const allEmails: string[] = [];

            // Se não há listas específicas, buscar todas as listas disponíveis
            const listsToProcess = listIds && listIds.length > 0 ? listIds : await getAllAvailableLists();

            for (const listId of listsToProcess) {
                // Buscar emails da lista usando a API
                const listName = listId.endsWith('.txt') ? listId : listId + '.txt';
                const emailContacts = await apiService.readEmailList(listName);
                const emails = emailContacts.map(contact => contact.email);
                allEmails.push(...emails);
            }

            // Remover duplicatas
            return [...new Set(allEmails)];
        } catch (error) {
            console.error('Erro ao buscar emails das listas:', error);
            return [];
        }
    }, [getAllAvailableLists]);

    // Função principal de envio
    const processSending = useCallback(async () => {
        if (!currentCampaign || state.isPaused) return;

        // Buscar emails - se não há listas selecionadas, usa todas as disponíveis
        const emailsToSend = await getEmailsFromLists(
            currentCampaign.selectedLists?.length > 0 ? currentCampaign.selectedLists : undefined
        );

        if (emailsToSend.length === 0) {
            addLog({ type: 'error', message: 'Nenhum email encontrado nas listas selecionadas' });
            setState(prev => ({ ...prev, isActive: false }));
            return;
        }

        // Atualizar total de emails se necessário
        if (state.totalEmails !== emailsToSend.length) {
            setState(prev => ({ ...prev, totalEmails: emailsToSend.length }));
        }

        const remainingEmails = emailsToSend.slice(state.sentEmails + state.failedEmails);

        if (remainingEmails.length === 0) {
            // Envio completo
            setState(prev => ({ ...prev, isActive: false, progress: 100 }));
            addLog({ type: 'info', message: 'Campanha finalizada' });
            if (sendingInterval) {
                clearInterval(sendingInterval);
                setSendingInterval(null);
            }
            return;
        }

        const nextEmail = remainingEmails[0];
        const nextSmtp = getNextAvailableSmtp();

        if (!nextSmtp) {
            addLog({
                type: 'warning',
                message: 'Nenhum SMTP disponível. Aguardando...'
            });
            return;
        }

        await sendSingleEmail(nextEmail, nextSmtp);

        // Calcular estatísticas
        const elapsed = startTime ? (Date.now() - startTime.getTime()) / 1000 : 1;
        const emailsPerSecond = state.sentEmails / elapsed;
        const remainingCount = remainingEmails.length - 1;
        const estimatedTimeRemaining = remainingCount / (emailsPerSecond || 1);

        setState(prev => ({
            ...prev,
            emailsPerSecond,
            estimatedTimeRemaining
        }));
    }, [currentCampaign, state.isPaused, state.sentEmails, state.failedEmails, state.totalEmails, getAllAvailableLists, getEmailsFromLists, getNextAvailableSmtp, sendSingleEmail, sendingInterval, startTime, addLog]);

    // Função para iniciar o envio
    const startSending = useCallback(async (campaign: EmailCampaign, smtps: SmtpConfig[]) => {
        try {
            console.log('🚀 Iniciando sistema de envio:', {
                campaign: campaign.subject,
                smtps: smtps.length,
                activeSmtps: smtps.filter(s => s.isActive).length
            });

            setCurrentCampaign(campaign);
            setSmtpConfigs(smtps);
            setStartTime(new Date());

            // Buscar total de emails disponíveis automaticamente
            const emailsToSend = await getEmailsFromLists(
                campaign.selectedLists?.length > 0 ? campaign.selectedLists : undefined
            );

            const totalEmails = emailsToSend.length;
            console.log('📧 Total de emails encontrados:', totalEmails);

            if (totalEmails === 0) {
                addLog({ type: 'error', message: 'Nenhum email encontrado para envio' });
                return;
            }

            setState(prev => ({
                ...prev,
                isActive: true,
                isPaused: false,
                totalEmails,
                sentEmails: 0,
                failedEmails: 0,
                progress: 0,
                logs: [],
                sendingSpeed: config.sendingSpeed
            }));

            addLog({
                type: 'info',
                message: `🚀 Iniciando envio da campanha "${campaign.subject}" para ${totalEmails} emails`
            });

            // Configurar intervalo de envio baseado na velocidade configurada
            const intervalMs = 1000 / config.sendingSpeed; // Convert speed to milliseconds
            console.log('⏱️ Intervalo entre envios:', intervalMs, 'ms');

            const interval = setInterval(processSending, intervalMs);
            setSendingInterval(interval);
        } catch (error) {
            console.error('❌ Erro ao iniciar envio:', error);
            addLog({
                type: 'error',
                message: `Erro ao iniciar envio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            });
        }
    }, [processSending, addLog, config.sendingSpeed, getEmailsFromLists]);

    // Função para pausar o envio
    const pauseSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: true }));
        addLog({ type: 'warning', message: 'Envio pausado' });
    }, [addLog]);

    // Função para retomar o envio
    const resumeSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: false }));
        addLog({ type: 'info', message: 'Envio retomado' });
    }, [addLog]);

    // Função para parar o envio
    const stopSending = useCallback(() => {
        if (sendingInterval) {
            clearInterval(sendingInterval);
            setSendingInterval(null);
        }

        setState(prev => ({ ...prev, isActive: false, isPaused: false }));
        setCurrentCampaign(null);
        addLog({ type: 'warning', message: 'Envio interrompido' });
    }, [sendingInterval, addLog]);

    // Função para verificar e recuperar SMTPs do standby
    const checkStandbySmtps = useCallback(() => {
        const now = new Date();

        setSmtpConfigs(prev => prev.map(smtp => {
            if (smtp.status === 'standby' && smtp.standbyUntil && smtp.standbyUntil <= now) {
                addLog({
                    type: 'info',
                    message: `SMTP ${smtp.name} recuperado do standby`,
                    smtpId: smtp.id
                });

                return {
                    ...smtp,
                    status: 'active' as const,
                    standbyUntil: undefined
                };
            }
            return smtp;
        }));
    }, [addLog]);

    // Carregar configurações salvas
    useEffect(() => {
        const savedConfig = localStorage.getItem('emailSenderConfig');
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                setConfig(prev => ({ ...prev, ...parsedConfig }));
            } catch (error) {
                console.error('Erro ao carregar configurações salvas:', error);
            }
        }
    }, []);

    // Salvar configurações quando mudarem
    useEffect(() => {
        localStorage.setItem('emailSenderConfig', JSON.stringify(config));
    }, [config]);

    // Verificar SMTPs em standby a cada 30 segundos
    useEffect(() => {
        if (!state.isActive) return;

        const standbyCheckInterval = setInterval(checkStandbySmtps, 30000);

        return () => {
            clearInterval(standbyCheckInterval);
        };
    }, [state.isActive, checkStandbySmtps]);

    // Cleanup no unmount
    useEffect(() => {
        return () => {
            if (sendingInterval) {
                clearInterval(sendingInterval);
            }
        };
    }, [sendingInterval]);

    // Função para verificar se a API do Electron está disponível
    const checkElectronAPI = useCallback((): boolean => {
        const available = !!(window.electronAPI?.email?.sendSingle);
        if (!available) {
            addLog({
                type: 'error',
                message: 'API do Electron não está disponível. Verifique se a aplicação está rodando no Electron.'
            });
        }
        return available;
    }, [addLog]);

    // Verificar condições para habilitar o botão de envio
    const canSend = useCallback((campaign: EmailCampaign, smtps: SmtpConfig[], availableLists: any[]) => {
        console.log('🔍 Verificando condições para envio:', {
            subject: campaign.subject?.trim(),
            sender: campaign.sender?.trim(),
            htmlContent: campaign.htmlContent?.trim().substring(0, 50) + '...',
            availableLists: availableLists.length,
            activeSmtps: smtps.filter(smtp => smtp.isActive).length,
            isActive: state.isActive,
            electronAPI: !!window.electronAPI?.email?.sendSingle
        });

        const hasSubject = campaign.subject?.trim() !== '';
        const hasSender = campaign.sender?.trim() !== '';
        const hasContent = campaign.htmlContent?.trim() !== '';
        const hasAvailableLists = availableLists?.length > 0;
        const hasActiveSmtps = smtps.some(smtp => smtp.isActive);
        const notSending = !state.isActive;
        const hasElectronAPI = checkElectronAPI();

        console.log('📋 Condições detalhadas:', {
            hasSubject,
            hasSender,
            hasContent,
            hasAvailableLists,
            hasActiveSmtps,
            notSending,
            hasElectronAPI
        });

        const canSendResult = hasSubject && hasSender && hasContent && hasAvailableLists && hasActiveSmtps && notSending && hasElectronAPI;
        console.log('✅ Pode enviar?', canSendResult);

        return canSendResult;
    }, [state.isActive]);

    return {
        state,
        config,
        setConfig,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        canSend,
        addLog
    };
};
