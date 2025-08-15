import { useCallback, useEffect, useRef, useState } from 'react';
import type { EmailCampaign, EmailSendLog, SmtpConfig } from '../types';
import { useEmailLists } from './index';

export interface SequentialSenderState {
    isActive: boolean;
    isPaused: boolean;
    currentListIndex: number;
    completedLists: string[];
    currentList?: {
        id: string;
        name: string;
        progress: number;
        sent: number;
        failed: number;
        total: number;
    };
    globalStats: {
        totalLists: number;
        completedLists: number;
        totalEmails: number;
        totalSent: number;
        totalFailed: number;
    };
    logs: EmailSendLog[];
    currentEmail?: string;
    emailsPerSecond: number;
    estimatedTimeRemaining: number;
}

export const useSequentialEmailSender = () => {
    const { lists, deleteList, refetch } = useEmailLists();
    const [state, setState] = useState<SequentialSenderState>({
        isActive: false,
        isPaused: false,
        currentListIndex: 0,
        completedLists: [],
        globalStats: {
            totalLists: 0,
            completedLists: 0,
            totalEmails: 0,
            totalSent: 0,
            totalFailed: 0,
        },
        logs: [],
        emailsPerSecond: 0,
        estimatedTimeRemaining: 0,
    });

    const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const emailQueueRef = useRef<string[]>([]);
    const currentSmtpIndexRef = useRef(0);

    // Terminal-style log function
    const addLog = useCallback((type: 'info' | 'success' | 'error' | 'warning', message: string, email?: string) => {
        const newLog: EmailSendLog = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type,
            message,
            email,
        };

        setState(prev => ({
            ...prev,
            logs: [newLog, ...prev.logs].slice(0, 1000) // Keep last 1000 logs
        }));

        // Also log to console for debugging
        const timestamp = newLog.timestamp.toLocaleTimeString();
        const logPrefix = `[${timestamp}] [${type.toUpperCase()}]`;
        const logMessage = email ? `${message} → ${email}` : message;

        switch (type) {
            case 'error':
                console.error(`${logPrefix} ${logMessage}`);
                break;
            case 'warning':
                console.warn(`${logPrefix} ${logMessage}`);
                break;
            case 'success':
                console.log(`%c${logPrefix} ${logMessage}`, 'color: #22c55e');
                break;
            default:
                console.log(`%c${logPrefix} ${logMessage}`, 'color: #3b82f6');
        }
    }, []);

    // Simulate email sending
    const sendEmail = useCallback(async (email: string, smtp: SmtpConfig): Promise<boolean> => {
        // Random delay to simulate real sending
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

        // 90% success rate simulation
        const success = Math.random() > 0.1;

        if (success) {
            addLog('success', `Email enviado com sucesso via ${smtp.name}`, email);
        } else {
            addLog('error', `Falha no envio via ${smtp.name}`, email);
        }

        return success;
    }, [addLog]);

    // Process current list
    const processCurrentList = useCallback(async () => {
        if (!campaign || state.isPaused) return;

        const currentList = lists[state.currentListIndex];
        if (!currentList) {
            addLog('warning', 'Nenhuma lista disponível para processamento');
            return;
        }

        const activeSmtps = smtpConfigs.filter(smtp => smtp.isActive && smtp.status !== 'failed');
        if (activeSmtps.length === 0) {
            addLog('error', 'Nenhum SMTP ativo disponível');
            return;
        }

        // Initialize queue if empty
        if (emailQueueRef.current.length === 0) {
            emailQueueRef.current = [...currentList.emails];
            addLog('info', `Iniciando processamento da lista: ${currentList.name} (${currentList.emails.length} emails)`);
        }

        // Process emails
        const email = emailQueueRef.current.shift();
        if (!email) {
            // List completed
            addLog('success', `Lista ${currentList.name} concluída!`);

            // Update completed lists
            setState(prev => ({
                ...prev,
                completedLists: [...prev.completedLists, currentList.id],
                globalStats: {
                    ...prev.globalStats,
                    completedLists: prev.globalStats.completedLists + 1,
                }
            }));

            // Remove completed list file
            try {
                await deleteList(currentList.id);
                await refetch();
                addLog('info', `Arquivo da lista ${currentList.name} removido automaticamente`);
            } catch (error) {
                addLog('error', `Erro ao remover lista ${currentList.name}: ${error}`);
            }

            // Move to next list
            if (state.currentListIndex < lists.length - 1) {
                setState(prev => ({
                    ...prev,
                    currentListIndex: prev.currentListIndex + 1
                }));
                emailQueueRef.current = []; // Reset queue for next list
                addLog('info', 'Avançando para próxima lista...');
            } else {
                // All lists completed
                stopSending();
                addLog('success', '🎉 Todas as listas foram processadas com sucesso!');
            }
            return;
        }

        // Send email
        setState(prev => ({
            ...prev,
            currentEmail: email
        }));

        const smtp = activeSmtps[currentSmtpIndexRef.current % activeSmtps.length];
        currentSmtpIndexRef.current++;

        const success = await sendEmail(email, smtp);

        // Update stats
        setState(prev => {
            const newState = { ...prev };

            if (success) {
                newState.globalStats.totalSent++;
                if (newState.currentList) {
                    newState.currentList.sent++;
                }
            } else {
                newState.globalStats.totalFailed++;
                if (newState.currentList) {
                    newState.currentList.failed++;
                }
            }

            // Update current list progress
            const currentList = lists[state.currentListIndex];
            if (currentList && newState.currentList) {
                const processed = newState.currentList.sent + newState.currentList.failed;
                newState.currentList.progress = (processed / currentList.emails.length) * 100;
            }

            // Calculate emails per second
            if (startTime) {
                const elapsedSeconds = (new Date().getTime() - startTime.getTime()) / 1000;
                newState.emailsPerSecond = newState.globalStats.totalSent / Math.max(elapsedSeconds, 1);

                // Estimate time remaining
                const remainingEmails = emailQueueRef.current.length;
                if (newState.emailsPerSecond > 0) {
                    newState.estimatedTimeRemaining = remainingEmails / newState.emailsPerSecond;
                }
            }

            return newState;
        });

    }, [campaign, state.isPaused, state.currentListIndex, lists, smtpConfigs, addLog, deleteList, refetch, sendEmail, startTime]);

    // Start sending
    const startSending = useCallback(async (campaignData: EmailCampaign, configs: SmtpConfig[]) => {
        if (lists.length === 0) {
            addLog('error', 'Nenhuma lista de email disponível');
            return;
        }

        setCampaign(campaignData);
        setSmtpConfigs(configs);
        setStartTime(new Date());

        const totalEmails = lists.reduce((sum, list) => sum + list.emails.length, 0);

        setState(prev => ({
            ...prev,
            isActive: true,
            isPaused: false,
            currentListIndex: 0,
            completedLists: [],
            currentList: {
                id: lists[0].id,
                name: lists[0].name,
                progress: 0,
                sent: 0,
                failed: 0,
                total: lists[0].emails.length,
            },
            globalStats: {
                totalLists: lists.length,
                completedLists: 0,
                totalEmails,
                totalSent: 0,
                totalFailed: 0,
            }
        }));

        addLog('info', `🚀 Iniciando envio sequencial para ${lists.length} listas (${totalEmails} emails total)`);

        // Start processing interval
        intervalRef.current = setInterval(processCurrentList, 1000);
    }, [lists, addLog, processCurrentList]);

    // Pause sending
    const pauseSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: true }));
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        addLog('warning', '⏸️ Envio pausado');
    }, [addLog]);

    // Resume sending
    const resumeSending = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: false }));
        intervalRef.current = setInterval(processCurrentList, 1000);
        addLog('info', '▶️ Envio retomado');
    }, [addLog, processCurrentList]);

    // Stop sending
    const stopSending = useCallback(() => {
        setState(prev => ({
            ...prev,
            isActive: false,
            isPaused: false,
            currentEmail: undefined
        }));

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        emailQueueRef.current = [];
        currentSmtpIndexRef.current = 0;

        addLog('warning', '🛑 Envio interrompido');
    }, [addLog]);

    // Update current list when index changes
    useEffect(() => {
        if (state.isActive && lists.length > 0) {
            const currentList = lists[state.currentListIndex];
            if (currentList) {
                setState(prev => ({
                    ...prev,
                    currentList: {
                        id: currentList.id,
                        name: currentList.name,
                        progress: 0,
                        sent: 0,
                        failed: 0,
                        total: currentList.emails.length,
                    }
                }));
            }
        }
    }, [state.currentListIndex, state.isActive, lists]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Can send validation
    const canSend = useCallback((campaignData: EmailCampaign, configs: SmtpConfig[], emailLists: any[]) => {
        return !!(
            campaignData.subject?.trim() &&
            campaignData.sender?.trim() &&
            campaignData.htmlContent?.trim() &&
            emailLists.length > 0 &&
            configs.some(smtp => smtp.isActive)
        );
    }, []);

    return {
        state,
        startSending,
        pauseSending,
        resumeSending,
        stopSending,
        canSend
    };
};
