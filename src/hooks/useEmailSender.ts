import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services';
import type { EmailCampaign, EmailSendLog, SmtpConfig } from '../types';

export interface EmailSenderState {
    isActive: boolean;
    isPaused: boolean;
    progress: number;
    currentEmail: string;
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
    logs: EmailSendLog[];
    emailsPerSecond: number;
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
        emailsPerSecond: 0
    });

    const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
    const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
    const [emailQueue, setEmailQueue] = useState<string[]>([]);
    const [currentSmtpIndex, setCurrentSmtpIndex] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);

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

    // Função para obter o próximo SMTP disponível
    const getNextAvailableSmtp = useCallback((): SmtpConfig | null => {
        const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive);
        
        if (activeSmtps.length === 0) {
            return null;
        }

        // Rotação simples round-robin
        const smtp = activeSmtps[currentSmtpIndex % activeSmtps.length];
        setCurrentSmtpIndex(prev => prev + 1);
        
        return smtp;
    }, [smtpConfigs, currentSmtpIndex]);

    // Função para enviar um email
    const sendSingleEmail = useCallback(async (email: string, smtp: SmtpConfig): Promise<boolean> => {
        try {
            if (!currentCampaign) return false;

            console.log('📧 Enviando email:', email, 'via SMTP:', smtp.name);

            // Atualizar estado
            setState(prev => ({ ...prev, currentEmail: email }));

            // Preparar dados do email
            const emailData = {
                to: email,
                subject: currentCampaign.subject,
                html: currentCampaign.htmlContent,
                text: currentCampaign.htmlContent.replace(/<[^>]*>/g, ''),
                campaignId: parseInt(currentCampaign.id) || undefined
            };

            // Verificar se a API está disponível
            if (!window.electronAPI?.email?.sendSingle) {
                throw new Error('API de envio não disponível');
            }

            // Enviar email
            const result = await window.electronAPI.email.sendSingle(emailData, parseInt(smtp.id));
            console.log('📧 Resultado:', result);

            if (result && result.success !== false) {
                // Sucesso
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
            
            setState(prev => ({
                ...prev,
                failedEmails: prev.failedEmails + 1
            }));

            addLog({
                type: 'error',
                message: `❌ Falha ao enviar para ${email}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                email,
                smtpId: smtp.id
            });

            return false;
        }
    }, [currentCampaign, addLog]);

    // Função para processar a fila de emails
    const processEmailQueue = useCallback(async () => {
        if (!state.isActive || state.isPaused || emailQueue.length === 0) {
            return;
        }

        console.log('🔄 Processando fila:', emailQueue.length, 'emails restantes');

        const nextEmail = emailQueue[0];
        const nextSmtp = getNextAvailableSmtp();

        if (!nextSmtp) {
            addLog({ type: 'warning', message: 'Nenhum SMTP disponível' });
            return;
        }

        // Enviar email
        await sendSingleEmail(nextEmail, nextSmtp);

        // Remover email da fila
        setEmailQueue(prev => prev.slice(1));

        // Calcular estatísticas
        if (startTime) {
            const elapsed = (Date.now() - startTime.getTime()) / 1000;
            const emailsPerSecond = state.sentEmails / elapsed;
            setState(prev => ({ ...prev, emailsPerSecond }));
        }

        // Verificar se terminou
        if (emailQueue.length <= 1) {
            setState(prev => ({ ...prev, isActive: false, progress: 100 }));
            addLog({ type: 'info', message: '🎉 Campanha finalizada!' });
        }
    }, [state.isActive, state.isPaused, emailQueue, getNextAvailableSmtp, sendSingleEmail, addLog, startTime, state.sentEmails]);

    // Processar a fila automaticamente
    useEffect(() => {
        if (state.isActive && !state.isPaused && emailQueue.length > 0) {
            const timer = setTimeout(processEmailQueue, 1000); // 1 email por segundo
            return () => clearTimeout(timer);
        }
    }, [state.isActive, state.isPaused, emailQueue.length, processEmailQueue]);

    // Função para buscar emails das listas
    const getEmailsFromLists = useCallback(async (): Promise<string[]> => {
        try {
            const lists = await apiService.getEmailLists();
            const allEmails: string[] = [];

            for (const list of lists) {
                try {
                    const listName = list.name.endsWith('.txt') ? list.name : list.name + '.txt';
                    const emailContacts = await apiService.readEmailList(listName);
                    const emails = emailContacts.map(contact => contact.email);
                    allEmails.push(...emails);
                } catch (error) {
                    console.warn('Erro ao ler lista:', list.name, error);
                }
            }

            return [...new Set(allEmails)]; // Remover duplicatas
        } catch (error) {
            console.error('Erro ao buscar emails:', error);
            return [];
        }
    }, []);

    // Função para iniciar o envio
    const startSending = useCallback(async (campaign: EmailCampaign, smtps: SmtpConfig[]) => {
        try {
            console.log('🚀 Iniciando envio...');

            // Buscar emails
            const emails = await getEmailsFromLists();
            console.log('📧 Emails encontrados:', emails.length);

            if (emails.length === 0) {
                addLog({ type: 'error', message: 'Nenhum email encontrado' });
                return;
            }

            // Configurar estado
            setCurrentCampaign(campaign);
            setSmtpConfigs(smtps);
            setEmailQueue(emails);
            setCurrentSmtpIndex(0);
            setStartTime(new Date());

            setState(prev => ({
                ...prev,
                isActive: true,
                isPaused: false,
                totalEmails: emails.length,
                sentEmails: 0,
                failedEmails: 0,
                progress: 0,
                logs: []
            }));

            addLog({
                type: 'info',
                message: `🚀 Iniciando envio para ${emails.length} emails`
            });

        } catch (error) {
            console.error('❌ Erro ao iniciar envio:', error);
            addLog({
                type: 'error',
                message: `Erro ao iniciar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            });
        }
    }, [getEmailsFromLists, addLog]);

    // Função para pausar
    const pauseSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: true }));
        addLog({ type: 'warning', message: '⏸️ Envio pausado' });
    }, [addLog]);

    // Função para retomar
    const resumeSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: false }));
        addLog({ type: 'info', message: '▶️ Envio retomado' });
    }, [addLog]);

    // Função para parar
    const stopSending = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false, isPaused: false }));
        setEmailQueue([]);
        addLog({ type: 'warning', message: '⏹️ Envio interrompido' });
    }, [addLog]);

    // Verificar se pode enviar
    const canSend = useCallback((campaign: EmailCampaign, smtps: SmtpConfig[], availableLists: any[]) => {
        return (
            campaign.subject?.trim() !== '' &&
            campaign.sender?.trim() !== '' &&
            campaign.htmlContent?.trim() !== '' &&
            availableLists.length > 0 &&
            smtps.some(smtp => smtp.isActive) &&
            !state.isActive &&
            !!window.electronAPI?.email?.sendSingle
        );
    }, [state.isActive]);

    return {
        state,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        canSend,
        addLog
    };
};
