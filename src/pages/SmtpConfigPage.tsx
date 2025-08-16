import {
    Activity, AlertCircle, AlertTriangle, BarChart3, CheckCircle, Clock, Database,
    Edit, Loader2, Mail, Play, Plus, Rocket, Server, Settings, TestTube, Trash2,
    X, Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { useSmtpConfigs } from '../hooks';
import type { SmtpConfig } from '../types';
import { detectSmtpWithCustomSubdomains } from '../utils/smtpDetector';

const SmtpConfigPage: React.FC = () => {
    const { configs, loading, updateConfig, createConfig, deleteConfig, testConfig, refetch } = useSmtpConfigs();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [testingAll, setTestingAll] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);

    // Bulk add state
    const [bulkText, setBulkText] = useState('');
    const [bulkPreview, setBulkPreview] = useState<Array<Omit<SmtpConfig, 'id'>>>();
    const [bulkErrors, setBulkErrors] = useState<string[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Advanced import settings - OTIMIZADO para velocidade máxima
    const [bulkSettings, setBulkSettings] = useState({
        threads: 20, // Aumentado para 20 threads para máxima paralelização
        timeout: 6000, // Timeout ainda mais reduzido para 6s para ser mais rápido
        retryPorts: [587, 465], // Apenas portas modernas, sem 25 e 2525
        domainValidationTimeout: 2000, // Timeout mais agressivo para validação de domínio (2s)
        enableDomainCache: true, // Cache de validação de domínio
        batchSize: 30, // Tamanho do lote aumentado para 30
        enableFastMode: true // Modo rápido que pula validações desnecessárias
    });

    // Real-time progress tracking
    const [bulkProgress, setBulkProgress] = useState({
        current: 0,
        total: 0,
        currentEmail: '',
        logs: [] as Array<{ time: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }>
    });

    // Configurações carregadas para otimização
    const [appSettings, setAppSettings] = useState({
        providerBlockList: [] as string[],
        smtpSubdomains: [] as string[],
        validSmtpConfigs: new Map<string, { host: string; port: number; secure: boolean }>(),
        // NOVA: Cache de validação de domínio para evitar re-validações
        domainValidationCache: new Map<string, { valid: boolean; timestamp: number; error?: string }>(),
        // NOVA: Cache de estatísticas de performance
        performanceStats: {
            totalValidated: 0,
            cacheHits: 0,
            averageTimePerEmail: 0
        }
    });

    // Carregar configurações do banco ao inicializar
    React.useEffect(() => {
        loadAppSettings();
        loadValidSmtpConfigs();
    }, []);

    const loadAppSettings = async () => {
        try {
            const blockList = await window.electronAPI?.database?.getSetting('provider_block_list') || '';
            const subdomains = await window.electronAPI?.database?.getSetting('smtp_subdomains') || '';

            setAppSettings(prev => ({
                ...prev,
                providerBlockList: blockList.split('\n').map((s: string) => s.trim().toLowerCase()).filter(Boolean),
                smtpSubdomains: subdomains.split('\n').map((s: string) => s.trim()).filter(Boolean)
            }));
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    };

    const loadValidSmtpConfigs = async () => {
        try {
            // Cache local básico para providers conhecidos (temporário)
            const validConfigs = new Map<string, { host: string; port: number; secure: boolean }>();

            // Adicionar configurações conhecidas dos providers mais comuns (fallback)
            const fallbackConfigs = {
                'uol.com.br': { host: 'smtp.uol.com.br', port: 587, secure: false },
                'bol.com.br': { host: 'smtp.bol.com.br', port: 587, secure: false },
                'terra.com.br': { host: 'smtp.terra.com.br', port: 587, secure: false },
                'gmail.com': { host: 'smtp.gmail.com', port: 587, secure: false },
                'outlook.com': { host: 'smtp-mail.outlook.com', port: 587, secure: false },
                'hotmail.com': { host: 'smtp-mail.outlook.com', port: 587, secure: false },
                'live.com': { host: 'smtp-mail.outlook.com', port: 587, secure: false },
                'yahoo.com': { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
                'zoho.com': { host: 'smtp.zoho.com', port: 587, secure: false },
                'icloud.com': { host: 'smtp.mail.me.com', port: 587, secure: false }
            };

            Object.entries(fallbackConfigs).forEach(([domain, config]) => {
                validConfigs.set(domain, config);
            });

            setAppSettings(prev => ({
                ...prev,
                validSmtpConfigs: validConfigs
            }));

            addLog(`⚡ Cache SMTP básico inicializado com ${validConfigs.size} configurações`, 'success');
        } catch (error) {
            console.error('Erro ao carregar configurações SMTP válidas:', error);
            addLog(`❌ Erro ao carregar cache SMTP: ${error}`, 'error');
        }
    };

    // Edit modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editForm, setEditForm] = useState<Omit<SmtpConfig, 'id'>>({
        name: '', host: '', port: 587, secure: false, username: '', password: '', fromEmail: '', fromName: '', isActive: true
    });

    const handleToggleActive = async (id: string, active: boolean) => {
        try {
            await updateConfig(id, { isActive: active });
        } catch (error) {
            console.error('Failed to update SMTP config:', error);
        }
    };

    const handleOpenAdd = () => {
        setBulkText('');
        setBulkPreview(undefined);
        setBulkErrors([]);
        setIsAddOpen(true);
    };

    const handleEditClick = (cfg: SmtpConfig) => {
        setEditId(cfg.id);
        setEditForm({
            name: cfg.name,
            host: cfg.host,
            port: cfg.port,
            secure: !!cfg.secure,
            username: cfg.username,
            password: cfg.password,
            fromEmail: cfg.fromEmail,
            fromName: cfg.fromName,
            isActive: cfg.isActive
        });
        setIsEditOpen(true);
    };

    // Função para extrair email e senha de forma inteligente de qualquer texto
    const extractEmailPassword = (line: string): { email?: string; password?: string; extracted: boolean } => {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = line.match(emailRegex);

        if (!emailMatch) {
            return { extracted: false };
        }

        const email = emailMatch[0];

        // Remove o email da linha para encontrar a senha
        const lineWithoutEmail = line.replace(email, '').trim();

        // Padrões para encontrar a senha (remove separadores comuns)
        const cleanLine = lineWithoutEmail
            .replace(/^[|:;,\s\t-]+/, '') // Remove separadores no início
            .replace(/[|:;,\s\t-]+$/, '') // Remove separadores no final
            .split(/[|:;,\s\t]+/) // Divide por separadores
            .filter(part => part.length > 0);

        // A senha é geralmente a primeira parte não vazia após o email
        const password = cleanLine[0];

        if (password && password.length > 0) {
            return { email, password, extracted: true };
        }

        return { email, extracted: false };
    };

    // Parse textarea lines with intelligent email/password extraction
    // Função auxiliar para verificar se um domínio está na block list
    const isEmailDomainBlocked = (email: string): boolean => {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return false;

        return appSettings.providerBlockList.includes(domain) ||
            appSettings.providerBlockList.some(blocked => {
                // Verificar subdomínios tradicionais (ex: mail.yahoo.com)
                if (domain.endsWith('.' + blocked)) {
                    return true;
                }
                // Verificar variações nacionais (ex: yahoo.com.mx -> yahoo.com)
                const blockedBase = blocked.split('.')[0]; // 'yahoo' de 'yahoo.com'
                const domainParts = domain.split('.');

                if (domainParts[0] === blockedBase) {
                    const lastPart = domainParts[domainParts.length - 1];
                    const secondLastPart = domainParts[domainParts.length - 2];

                    // Padrões como .com.mx, .co.uk, .com.br
                    if (lastPart.length === 2 && secondLastPart === 'com') {
                        return true;
                    }
                }
                return false;
            });
    };

    const parseBulk = (text: string) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const preview: Array<Omit<SmtpConfig, 'id'>> = [];
        const errors: string[] = [];
        const extracted: Array<{ email: string; password: string }> = [];

        lines.forEach((line, idx) => {
            try {
                let email: string = '';
                let password: string = '';
                let host: string = '';
                let port: number = 587;
                let secure: boolean = false;
                let processed = false;

                // Tentar formato padrão primeiro
                if (line.includes('|')) {
                    const parts = line.split('|').map(p => p.trim());

                    if (parts.length === 2 && /^\S+@\S+\.\S+$/.test(parts[0])) {
                        // Formato: email|senha
                        [email, password] = parts;
                        const domain = email.split('@')[1].toLowerCase();
                        host = `smtp.${domain}`;
                        port = 587;
                        secure = false;
                        processed = true;
                    } else if (parts.length >= 4 && /^\S+@\S+\.\S+$/.test(parts[2])) {
                        // Formato: host|porta|email|senha
                        const [hostPart, portStr, emailPart, passwordPart] = parts;
                        host = hostPart;
                        port = Number(portStr);
                        email = emailPart;
                        password = passwordPart;
                        secure = port === 465;

                        if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
                            processed = false;
                        } else {
                            processed = true;
                        }
                    }
                } else if (line.includes(':')) {
                    const parts = line.split(':').map(p => p.trim());
                    if (parts.length === 2 && /^\S+@\S+\.\S+$/.test(parts[0])) {
                        // Formato: email:senha
                        [email, password] = parts;
                        const domain = email.split('@')[1].toLowerCase();
                        host = `smtp.${domain}`;
                        port = 587;
                        secure = false;
                        processed = true;
                    }
                }

                // Se não conseguiu processar com formato padrão, tentar extração inteligente
                if (!processed) {
                    const extraction = extractEmailPassword(line);
                    if (extraction.extracted && extraction.email && extraction.password) {
                        email = extraction.email;
                        password = extraction.password;

                        // Verificar block list também para emails extraídos
                        if (isEmailDomainBlocked(email)) {
                            errors.push(`Linha ${idx + 1}: 🚫 Email extraído ${email} - provedor está na block list`);
                            return;
                        }

                        extracted.push({ email, password });

                        const domain = email.split('@')[1].toLowerCase();

                        host = `smtp.${domain}`;
                        port = 587;
                        secure = false;
                        processed = true;
                    } else {
                        // Mesmo se não conseguir extrair senha, guardar o email para possível teste
                        if (extraction.email) {
                            // Verificar block list mesmo para emails sem senha
                            if (isEmailDomainBlocked(extraction.email)) {
                                errors.push(`Linha ${idx + 1}: 🚫 Email ${extraction.email} - provedor está na block list`);
                                return;
                            }

                            extracted.push({ email: extraction.email, password: extraction.password || '' });
                            errors.push(`Linha ${idx + 1}: formato inválido, mas email encontrado: ${extraction.email}`);
                        } else {
                            errors.push(`Linha ${idx + 1}: formato inválido e nenhum email encontrado`);
                        }
                        return;
                    }
                }

                if (!email || !password) {
                    errors.push(`Linha ${idx + 1}: email ou senha vazia`);
                    return;
                }

                // VERIFICAÇÃO DA BLOCK LIST no parseBulk
                const domain = email.split('@')[1].toLowerCase();
                if (isEmailDomainBlocked(email)) {
                    errors.push(`Linha ${idx + 1}: 🚫 Provedor ${domain} está na block list - rejeitado`);
                    return; // Não adicionar à preview
                }

                const local = email.split('@')[0];

                preview.push({
                    name: `${local}@${domain} (auto-detectar)`,
                    host,
                    port,
                    secure,
                    username: email,
                    password,
                    fromEmail: email,
                    fromName: local,
                    isActive: true
                });
            } catch (error) {
                // Mesmo com erro, tentar extrair email e senha
                const extraction = extractEmailPassword(line);
                if (extraction.email) {
                    extracted.push({ email: extraction.email, password: extraction.password || '' });
                    errors.push(`Linha ${idx + 1}: erro ao processar, mas email encontrado: ${extraction.email}`);
                } else {
                    errors.push(`Linha ${idx + 1}: erro ao processar linha`);
                }
            }
        });

        setBulkPreview(preview);
        setBulkErrors(errors);

        // Armazenar emails/senhas extraídas para uso no teste
        (window as any).extractedCredentials = extracted;
    };

    const handleBulkChange = (val: string) => {
        setBulkText(val);
        if (val.trim().length === 0) {
            setBulkPreview(undefined);
            setBulkErrors([]);
            return;
        }
        parseBulk(val);
    };

    const handleTestOne = async (cfg: SmtpConfig) => {
        setTestingId(cfg.id);
        try {
            const res = await testConfig(cfg);
            alert(res.success ? 'Conexão OK' : `Falhou: ${res.message}`);
        } catch (e: any) {
            alert(`Falhou: ${e?.message || e}`);
        } finally {
            setTestingId(null);
        }
    };

    const handleTestAll = async () => {
        setTestingAll(true);
        try {
            const results = await window.electronAPI.email.testAllSmtps();
            const ok = results.filter(r => r.success).length;
            alert(`Testes concluídos: ${ok}/${results.length} OK`);
            await refetch();
        } catch (e) {
            console.error(e);
            alert('Erro ao testar todos');
        } finally {
            setTestingAll(false);
        }
    };

    const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setBulkProgress(prev => ({
            ...prev,
            logs: [...prev.logs.slice(-49), { time, message, type }]
        }));
    };

    // Função para validar se o domínio está online
    // NOVA: Função otimizada para validação de domínio com cache
    const validateDomainOptimized = async (domain: string): Promise<{ valid: boolean; error?: string; fromCache?: boolean }> => {
        // FAST MODE: Para domínios conhecidos/grandes provedores, assumir que estão online sem validação
        const knownGoodDomains = [
            'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'live.com', 
            'icloud.com', 'protonmail.com', 'zoho.com', 'aol.com', 'fastmail.com',
            'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com',
            'msn.com', 'ymail.com', 'googlemail.com', 'me.com', 'mac.com'
        ];

        if (bulkSettings.enableFastMode && knownGoodDomains.includes(domain)) {
            const result = { valid: true, fromCache: true };
            
            // Salvar no cache sem validação real
            if (bulkSettings.enableDomainCache) {
                setAppSettings(prev => {
                    const newCache = new Map(prev.domainValidationCache);
                    newCache.set(domain, { ...result, timestamp: Date.now() });
                    return { ...prev, domainValidationCache: newCache };
                });
            }
            
            return result;
        }

        // Verificar cache primeiro
        if (bulkSettings.enableDomainCache && appSettings.domainValidationCache.has(domain)) {
            const cached = appSettings.domainValidationCache.get(domain)!;
            const cacheAge = Date.now() - cached.timestamp;
            
            // Cache válido por 10 minutos
            if (cacheAge < 10 * 60 * 1000) {
                setAppSettings(prev => ({
                    ...prev,
                    performanceStats: {
                        ...prev.performanceStats,
                        cacheHits: prev.performanceStats.cacheHits + 1
                    }
                }));
                return { valid: cached.valid, error: cached.error, fromCache: true };
            }
        }

        // Lista de domínios problemáticos comuns - rejeição imediata
        const problematicDomains = [
            'example.com', 'test.com', 'demo.com', 'sample.com',
            'localhost', '127.0.0.1', 'invalid.com', 'fake.com'
        ];

        if (problematicDomains.includes(domain)) {
            const result = { valid: false, error: `Domínio ${domain} é conhecido por não ter configuração SMTP válida` };
            
            // Salvar no cache
            if (bulkSettings.enableDomainCache) {
                setAppSettings(prev => {
                    const newCache = new Map(prev.domainValidationCache);
                    newCache.set(domain, { ...result, timestamp: Date.now() });
                    return { ...prev, domainValidationCache: newCache };
                });
            }
            
            return result;
        }

        // Para outros domínios, fazer validação muito leve (apenas DNS com timeout agressivo)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), bulkSettings.domainValidationTimeout);

            await fetch(`https://${domain}`, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal 
            });
            
            clearTimeout(timeoutId);
            
            const result = { valid: true };
            
            // Salvar no cache
            if (bulkSettings.enableDomainCache) {
                setAppSettings(prev => {
                    const newCache = new Map(prev.domainValidationCache);
                    newCache.set(domain, { ...result, timestamp: Date.now() });
                    return { ...prev, domainValidationCache: newCache };
                });
            }
            
            return result;
        } catch (error: any) {
            const result = { valid: false, error: `Domínio ${domain} parece estar offline: ${error.message}` };
            
            // Salvar no cache
            if (bulkSettings.enableDomainCache) {
                setAppSettings(prev => {
                    const newCache = new Map(prev.domainValidationCache);
                    newCache.set(domain, { ...result, timestamp: Date.now() });
                    return { ...prev, domainValidationCache: newCache };
                });
            }
            
            return result;
        }
    };

    // Legacy domain validation function (kept for backward compatibility)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validateDomainOnline = async (domain: string): Promise<{ online: boolean; error?: string }> => {
        try {
            addLog(`🌐 Verificando conectividade do domínio ${domain}...`, 'info');

            // Tentar múltiplas validações
            const validations = [
                // 1. Teste de DNS básico
                checkDnsResolution(domain),
                // 2. Teste de ping HTTP/HTTPS
                checkHttpConnectivity(domain),
                // 3. Teste de conectividade TCP na porta 80/443
                checkBasicConnectivity(domain),
                // 4. Teste específico de servidor SMTP
                checkSmtpServerAvailability(domain)
            ];

            const results = await Promise.allSettled(validations);
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

            if (successCount > 0) {
                addLog(`✅ Domínio ${domain} está online (${successCount}/4 testes passaram)`, 'success');
                return { online: true };
            } else {
                const errors = results
                    .filter(r => r.status === 'rejected')
                    .map(r => (r as PromiseRejectedResult).reason?.message || 'Erro desconhecido');

                addLog(`❌ Domínio ${domain} parece estar offline`, 'warning');
                return { online: false, error: `Falha nos testes: ${errors.join(', ')}` };
            }
        } catch (error: any) {
            addLog(`💥 Erro ao verificar domínio ${domain}: ${error.message}`, 'error');
            return { online: false, error: error.message };
        }
    };

    // Função para verificar disponibilidade do servidor SMTP
    const checkSmtpServerAvailability = async (domain: string): Promise<boolean> => {
        const smtpHosts = [
            `smtp.${domain}`,
            `mail.${domain}`,
            `mx.${domain}`,
            domain // Às vezes o próprio domínio é o servidor SMTP
        ];

        for (const host of smtpHosts) {
            try {
                addLog(`🔍 Verificando servidor SMTP ${host}...`, 'info');

                // Simular uma conexão TCP básica usando fetch com timeout muito baixo
                // Isso não vai conectar realmente no SMTP, mas vai verificar se o host responde
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);

                await fetch(`https://${host}`, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                addLog(`✅ Servidor SMTP ${host} respondeu`, 'success');
                return true;
            } catch (error) {
                // Não é necessariamente um erro, apenas continue tentando
                addLog(`⚠️ Servidor SMTP ${host} não respondeu na porta 443/80`, 'warning');
            }
        }

        // Se chegou até aqui, nenhum servidor SMTP comum respondeu
        // Mas isso não significa que não existe, apenas que não responde em HTTP/HTTPS
        addLog(`🔍 Servidores SMTP comuns não respondem em HTTP, mas podem estar ativos na porta 587/465`, 'info');
        return true; // Permitir continuar o teste mesmo assim
    };

    // Função para testar resolução DNS
    const checkDnsResolution = async (domain: string): Promise<boolean> => {
        try {
            // Usar fetch para testar se o domínio resolve
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch(`https://${domain}`, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal 
            });

            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            // Mesmo com erro de CORS, se chegou até aqui o DNS resolveu
            return true;
        }
    };

    // Função para testar conectividade HTTP/HTTPS
    const checkHttpConnectivity = async (domain: string): Promise<boolean> => {
        const urls = [`https://${domain}`, `http://${domain}`];

        for (const url of urls) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                return true;
            } catch (error) {
                // Continue tentando próxima URL
            }
        }
        return false;
    };

    // Função para testar conectividade básica
    const checkBasicConnectivity = async (domain: string): Promise<boolean> => {
        try {
            // Usar uma técnica de imagem para testar conectividade
            return new Promise((resolve) => {
                const img = new Image();
                const timeout = setTimeout(() => {
                    resolve(false);
                }, 3000);

                img.onload = img.onerror = () => {
                    clearTimeout(timeout);
                    resolve(true); // Qualquer resposta indica que o domínio está acessível
                };

                img.src = `https://${domain}/favicon.ico?${Date.now()}`;
            });
        } catch {
            return false;
        }
    };

    // Função para validar configurações de email antes de testar SMTP - OTIMIZADA
    const validateEmailAndDomain = async (email: string): Promise<{ valid: boolean; domain?: string; error?: string; blocked?: boolean }> => {
        try {
            // Validar formato do email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { valid: false, error: 'Formato de email inválido' };
            }

            const domain = email.split('@')[1].toLowerCase();

            // Validar se o domínio não está vazio
            if (!domain) {
                return { valid: false, error: 'Domínio não encontrado no email' };
            }

            // NOVA VALIDAÇÃO: Verificar block list de provedores
            addLog(`🔍 Verificando domain '${domain}' contra block list (${appSettings.providerBlockList.length} itens)`, 'info');

            // Debug: mostrar alguns itens da block list
            if (appSettings.providerBlockList.length > 0) {
                addLog(`📋 Block list inclui: ${appSettings.providerBlockList.slice(0, 3).join(', ')}...`, 'info');
            } else {
                addLog(`⚠️ Block list está vazia! Carregando configurações...`, 'warning');
                await loadAppSettings(); // Tentar recarregar se estiver vazia
            }

            // Verificar se domínio ou domínio pai está na block list
            const isBlocked = appSettings.providerBlockList.includes(domain) ||
                appSettings.providerBlockList.some(blocked => {
                    // Verificar subdomínios tradicionais (ex: mail.yahoo.com)
                    if (domain.endsWith('.' + blocked)) {
                        return true;
                    }
                    // Verificar variações nacionais (ex: yahoo.com.mx -> yahoo.com, gmail.com.br -> gmail.com)
                    const blockedBase = blocked.split('.')[0]; // 'yahoo' de 'yahoo.com'
                    const domainParts = domain.split('.');

                    // Se o domínio começa com o mesmo nome base do bloqueado
                    if (domainParts[0] === blockedBase) {
                        // Verificar se é uma variação nacional (termina com código de país)
                        const lastPart = domainParts[domainParts.length - 1];
                        const secondLastPart = domainParts[domainParts.length - 2];

                        // Padrões como .com.mx, .co.uk, .com.br
                        if (lastPart.length === 2 && secondLastPart === 'com') {
                            addLog(`🔍 Detectado variação nacional: ${domain} -> bloquear como ${blocked}`, 'info');
                            return true;
                        }
                    }
                    return false;
                });

            if (isBlocked) {
                addLog(`🚫 Provedor ${domain} está na block list - rejeitado`, 'warning');
                return {
                    valid: false,
                    domain,
                    blocked: true,
                    error: `Provedor ${domain} está bloqueado (provedor gratuito na block list)`
                };
            } else {
                addLog(`✅ Domínio ${domain} não está na block list - prosseguindo`, 'info');
            }

            // Lista de domínios problemáticos comuns que podem não ter SMTP configurado
            const problematicDomains = [
                'example.com', 'test.com', 'demo.com', 'sample.com',
                'localhost', '127.0.0.1', 'invalid.com', 'fake.com'
            ];

            if (problematicDomains.includes(domain)) {
                addLog(`⚠️ Domínio ${domain} está na lista de domínios problemáticos`, 'warning');
                return { valid: false, error: `Domínio ${domain} é conhecido por não ter configuração SMTP válida` };
            }

            // OTIMIZAÇÃO: Verificar configuração SMTP conhecida em cache local
            if (appSettings.validSmtpConfigs.has(domain)) {
                addLog(`⚡ Configuração SMTP para ${domain} encontrada em cache local`, 'success');
                return { valid: true, domain };
            }

            // Para domínios corporativos/personalizados, usar validação otimizada
            const domainCheck = await validateDomainOptimized(domain);
            if (!domainCheck.valid) {
                if (domainCheck.fromCache) {
                    addLog(`⚡ Domínio ${domain} rejeitado (cache): ${domainCheck.error}`, 'warning');
                } else {
                    addLog(`❌ Domínio ${domain} offline: ${domainCheck.error}`, 'error');
                }
                return {
                    valid: false,
                    domain,
                    error: domainCheck.error 
                };
            }

            if (domainCheck.fromCache) {
                addLog(`⚡ Domínio ${domain} validado via cache`, 'info');
            } else {
                addLog(`✅ Domínio ${domain} validado online`, 'success');
            }

            return { valid: true, domain };
        } catch (error: any) {
            return { valid: false, error: error.message };
        }
    }; const testSmtpWithRetries = async (email: string, password: string): Promise<{ success: boolean; config?: Omit<SmtpConfig, 'id'>; error?: string }> => {
        addLog(`🔍 Iniciando validação de ${email}...`, 'info');

        try {
            // NOVA VALIDAÇÃO: Verificar email e domínio (inclui block list)
            const validation = await validateEmailAndDomain(email);
            if (!validation.valid) {
                if (validation.blocked) {
                    addLog(`🚫 Email ${email} bloqueado (provedor na block list)`, 'error');
                } else {
                    addLog(`❌ Validação falhou para ${email}: ${validation.error}`, 'error');
                }
                return { success: false, error: validation.error };
            }

            const domain = validation.domain!;
            addLog(`✅ Email e domínio validados para ${email}`, 'success');

            // OTIMIZAÇÃO: Verificar se já temos configuração válida em cache local
            if (appSettings.validSmtpConfigs.has(domain)) {
                const cachedConfig = appSettings.validSmtpConfigs.get(domain)!;
                addLog(`⚡ Usando configuração em cache para ${domain}`, 'info');

                const config: Omit<SmtpConfig, 'id'> = {
                    name: `${domain} - ${email} (cache)`,
                    host: cachedConfig.host,
                    port: cachedConfig.port,
                    secure: cachedConfig.secure,
                    username: email,
                    password,
                    fromEmail: email,
                    fromName: email.split('@')[0],
                    isActive: true
                };

                // Testar a configuração em cache rapidamente (timeout reduzido)
                addLog(`🔧 Testando configuração em cache ${cachedConfig.host}:${cachedConfig.port}...`, 'info');
                try {
                    const test = await Promise.race([
                        testConfig({ id: 'temp', ...config }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), bulkSettings.timeout / 2) // Timeout reduzido para cache
                        )
                    ]) as any;

                    if (test?.success) {
                        addLog(`✅ Sucesso com configuração em cache ${cachedConfig.host}:${cachedConfig.port}`, 'success');
                        return { success: true, config };
                    }
                } catch (error: any) {
                    addLog(`⚠️ Cache falhou (timeout rápido), tentando detecção automática: ${error.message}`, 'warning');
                }
            }

            addLog(`🔧 Iniciando detecção automática para ${email}...`, 'info');

            // Detectar configurações conhecidas (otimizado - apenas portas modernas)
            const detectedConfigs = await detectSmtpWithCustomSubdomains(email);

            // OTIMIZAÇÃO: Se modo rápido está ativo e temos cache de domínio, usar apenas primeira configuração
            const configsToTest = bulkSettings.enableFastMode && appSettings.validSmtpConfigs.has(domain) 
                ? detectedConfigs.slice(0, 1) // Testar apenas primeira configuração
                : detectedConfigs;

            // Se não detectou nenhuma, cria configurações apenas com portas modernas
            if (configsToTest.length === 0) {
                const portsToTry = bulkSettings.enableFastMode 
                    ? [587] // Modo rápido: apenas porta 587
                    : bulkSettings.retryPorts;
                
                for (const port of portsToTry) {
                    configsToTest.push({
                        host: `smtp.${domain}`,
                        port,
                        secure: port === 465,
                        detected: false,
                        provider: `Auto-${port}`
                    });
                }
            }

            // Testar cada configuração (paralelizado quando possível)
            for (const detected of configsToTest) {
                const config: Omit<SmtpConfig, 'id'> = {
                    name: `${detected.provider} - ${email}`,
                    host: detected.host,
                    port: detected.port,
                    secure: detected.secure,
                    username: email,
                    password,
                    fromEmail: email,
                    fromName: email.split('@')[0],
                    isActive: true
                };

                addLog(`⚡ Tentando ${detected.host}:${detected.port} (${detected.secure ? 'SSL' : 'TLS'})`, 'info');

                try {
                    const test = await Promise.race([
                        testConfig({ id: 'temp', ...config }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), bulkSettings.timeout)
                        )
                    ]) as any;

                    if (test?.success) {
                        addLog(`✅ Sucesso com ${detected.host}:${detected.port}`, 'success');

                        // OTIMIZAÇÃO: Salvar configuração válida em cache local para próximas vezes
                        const cacheConfig = { host: detected.host, port: detected.port, secure: detected.secure };
                        setAppSettings(prev => {
                            const newValidConfigs = new Map(prev.validSmtpConfigs);
                            newValidConfigs.set(domain, cacheConfig);
                            return { ...prev, validSmtpConfigs: newValidConfigs };
                        });

                        return { success: true, config };
                    }
                } catch (error: any) {
                    addLog(`❌ Falhou ${detected.host}:${detected.port} - ${error.message}`, 'warning');
                }
            }

            addLog(`🚫 Todas as tentativas falharam para ${email}`, 'error');
            return { success: false, error: 'Todas as configurações testadas falharam' };

        } catch (error: any) {
            addLog(`💥 Erro crítico para ${email}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    };

    const handleBulkTestAndSave = async () => {
        // Verificar se temos dados para processar
        const hasPreview = bulkPreview && bulkPreview.length > 0;
        const extractedCreds = (window as any).extractedCredentials || [];
        const hasExtracted = extractedCreds.length > 0;

        if (!hasPreview && !hasExtracted) {
            addLog('❌ Nenhum dado válido para processar', 'error');
            return;
        }

        setBulkProcessing(true);

        // Se não temos preview mas temos emails extraídos, processar apenas eles
        if (!hasPreview && hasExtracted) {
            setBulkProgress({
                current: 0,
                total: extractedCreds.length,
                currentEmail: '',
                logs: []
            });

            addLog(`🚀 Iniciando teste de ${extractedCreds.length} emails extraídos`, 'info');
            addLog(`⚠️ Usando extração inteligente devido a erros de formato`, 'warning');

            try {
                let ok = 0, fail = 0, dup = 0;
                const existing = new Set(configs.map(c => `${c.host}|${c.port}|${(c.username || '').toLowerCase()}`));

                for (const cred of extractedCreds) {
                    setBulkProgress(prev => ({ ...prev, current: prev.current + 1, currentEmail: cred.email }));

                    if (!cred.email || !cred.password) {
                        fail++;
                        addLog(`❌ ${cred.email || 'email desconhecido'}: Email ou senha vazios`, 'error');
                        continue;
                    }

                    const domain = cred.email.split('@')[1]?.toLowerCase() || '';

                    // Verificar block list ANTES de criar o SMTP
                    if (isEmailDomainBlocked(cred.email)) {
                        fail++;
                        addLog(`🚫 ${cred.email}: Provedor ${domain} está na block list - rejeitado`, 'warning');
                        continue;
                    }

                    const smtpHost = `smtp.${domain}`;
                    const key = `${smtpHost}|587|${cred.email.toLowerCase()}`;

                    if (existing.has(key)) {
                        dup++;
                        addLog(`⚠️ ${cred.email}: Já existe (ignorado)`, 'warning');
                        continue;
                    }

                    // Tentar detectar configuração SMTP automaticamente
                    try {
                        addLog(`🔍 ${cred.email}: Testando configuração automática...`, 'info');

                        // Criar configuração usando função do hook
                        const newConfig: Omit<SmtpConfig, 'id'> = {
                            name: `${cred.email} (auto-detectado)`,
                            host: smtpHost,
                            port: 587,
                            secure: false,
                            username: cred.email,
                            password: cred.password,
                            fromEmail: cred.email,
                            fromName: cred.email.split('@')[0],
                            isActive: true
                        };

                        await createConfig(newConfig);
                        existing.add(key);
                        ok++;
                        addLog(`✅ ${cred.email}: Adicionado com sucesso`, 'success');

                    } catch (error) {
                        fail++;
                        addLog(`❌ ${cred.email}: Erro ao testar - ${error}`, 'error');
                    }
                }

                addLog(`🎯 Resultado: ${ok} OK, ${fail} falhas, ${dup} duplicados`, 'info');
                setBulkProcessing(false);

                if (ok > 0) {
                    refetch();
                }

                return;
            } catch (error) {
                addLog(`❌ Erro geral: ${error}`, 'error');
                setBulkProcessing(false);
                return;
            }
        }

        // Verificar se bulkPreview existe antes de usar
        if (!bulkPreview) {
            addLog('❌ Erro interno: preview não disponível', 'error');
            setBulkProcessing(false);
            return;
        }

        // Processar preview normal
        setBulkProgress({
            current: 0,
            total: bulkPreview.length,
            currentEmail: '',
            logs: []
        });

        addLog(`🚀 Iniciando teste de ${bulkPreview.length} emails com ${bulkSettings.threads} threads`, 'info');
        addLog(`⏱️ Timeout por teste: ${bulkSettings.timeout}ms | Domínio: ${bulkSettings.domainValidationTimeout}ms`, 'info');
        addLog(`🔧 Lote: ${bulkSettings.batchSize} | Cache: ${bulkSettings.enableDomainCache ? 'ON' : 'OFF'} | Fast: ${bulkSettings.enableFastMode ? 'ON' : 'OFF'}`, 'info');

        try {
            let ok = 0, fail = 0, dup = 0;
            const results: Array<{ key: string; status: 'ok' | 'fail' | 'dup'; message?: string }> = [];
            const existing = new Set(configs.map(c => `${c.host}|${c.port}|${(c.username || '').toLowerCase()}`));

            // Processa em lotes usando threads simultâneas
            const emailsToProcess = bulkPreview.filter(cfg =>
                cfg.host.startsWith('smtp.') && cfg.name.includes('(auto-detectar)')
            );

            const manualConfigs = bulkPreview.filter(cfg =>
                !(cfg.host.startsWith('smtp.') && cfg.name.includes('(auto-detectar)'))
            );

            // Processa configurações manuais primeiro (são mais rápidas)
            for (const cfg of manualConfigs) {
                const key = `${cfg.host}|${cfg.port}|${(cfg.username || '').toLowerCase()}`;
                setBulkProgress(prev => ({ ...prev, current: prev.current + 1, currentEmail: cfg.username }));

                if (existing.has(key)) {
                    dup++;
                    results.push({ key, status: 'dup', message: 'Duplicado. Ignorado.' });
                    continue;
                }

                try {
                    const test = await testConfig({ id: 'temp', ...cfg });
                    if (test?.success) {
                        await createConfig(cfg);
                        existing.add(key);
                        ok++;
                        results.push({ key, status: 'ok', message: 'Conexão OK e salvo.' });
                        addLog(`✅ Configuração manual salva: ${cfg.host}:${cfg.port}`, 'success');
                    } else {
                        fail++;
                        results.push({ key, status: 'fail', message: test?.message || 'Falha na verificação' });
                    }
                } catch (err: any) {
                    fail++;
                    results.push({ key, status: 'fail', message: err?.message || String(err) });
                }
            }

            // NOVA OTIMIZAÇÃO: Agrupar emails por domínio para reduzir validações redundantes
            const emailsByDomain = new Map<string, typeof emailsToProcess>();
            for (const cfg of emailsToProcess) {
                const domain = cfg.username?.split('@')[1]?.toLowerCase();
                if (domain) {
                    if (!emailsByDomain.has(domain)) {
                        emailsByDomain.set(domain, []);
                    }
                    emailsByDomain.get(domain)!.push(cfg);
                }
            }

            addLog(`📊 ${emailsToProcess.length} emails agrupados em ${emailsByDomain.size} domínios únicos`, 'info');

            // Processar por domínio para maximizar cache hits
            const batchSize = bulkSettings.batchSize || bulkSettings.threads;
            const domainKeys = Array.from(emailsByDomain.keys());
            
            for (let i = 0; i < domainKeys.length; i += batchSize) {
                const domainBatch = domainKeys.slice(i, i + batchSize);
                
                const batchPromises = domainBatch.map(async (domain) => {
                    const domainEmails = emailsByDomain.get(domain)!;
                    const domainResults: Array<{ key: string; status: 'ok' | 'fail' | 'dup'; message?: string }> = [];
                    
                    // Validar domínio uma vez para todos os emails do domínio
                    const domainValidation = await validateDomainOptimized(domain);
                    
                    if (!domainValidation.valid && !domainValidation.fromCache) {
                        // Se domínio é inválido (e não está em cache), marcar todos os emails deste domínio como falha
                        for (const cfg of domainEmails) {
                            setBulkProgress(prev => ({ ...prev, current: prev.current + 1 }));
                            domainResults.push({
                                key: cfg.username,
                                status: 'fail',
                                message: `Domínio inválido: ${domainValidation.error}`
                            });
                        }
                        return domainResults;
                    }

                    // Processar emails do domínio em paralelo
                    const emailPromises = domainEmails.map(async (cfg) => {
                        setBulkProgress(prev => ({ ...prev, currentEmail: cfg.username }));

                        const result = await testSmtpWithRetries(cfg.username, cfg.password);

                        setBulkProgress(prev => ({ ...prev, current: prev.current + 1 }));

                        if (result.success && result.config) {
                            const key = `${result.config.host}|${result.config.port}|${(result.config.username || '').toLowerCase()}`;

                            if (!existing.has(key)) {
                                await createConfig(result.config);
                                existing.add(key);
                                return { key, status: 'ok' as const, message: 'Conexão OK e salvo.' };
                            } else {
                                return { key, status: 'dup' as const, message: 'Duplicado. Ignorado.' };
                            }
                        } else {
                            return { key: cfg.username, status: 'fail' as const, message: result.error || 'Falha na conexão' };
                        }
                    });

                    const emailResults = await Promise.all(emailPromises);
                    domainResults.push(...emailResults);
                    
                    return domainResults;
                });

                const batchResults = await Promise.all(batchPromises);
                batchResults.flat().forEach(result => {
                    results.push(result);
                    if (result.status === 'ok') ok++;
                    else if (result.status === 'fail') fail++;
                    else if (result.status === 'dup') dup++;
                });

                // OTIMIZAÇÃO: Cleanup de memória após cada lote + força GC
                if (global.gc) {
                    global.gc();
                }
                
                // OTIMIZAÇÃO: Limpar referências para objetos grandes
                batchResults.length = 0;
                
                // OTIMIZAÇÃO: Throttle progress updates para reduzir overhead
                if (i % 5 === 0 || i >= domainKeys.length - batchSize) {
                    // Permitir UI updates apenas a cada 5 lotes ou no final
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

            await refetch();
            
            // OTIMIZAÇÃO: Calcular e exibir estatísticas de performance
            const endTime = Date.now();
            const totalTime = endTime - (bulkProgress.logs[0]?.time ? new Date(bulkProgress.logs[0].time).getTime() : endTime);
            const totalEmails = ok + fail + dup;
            const emailsPerSecond = totalEmails > 0 ? (totalEmails / (totalTime / 1000)).toFixed(1) : '0';
            const cacheHitRate = appSettings.performanceStats.cacheHits > 0 ? 
                ((appSettings.performanceStats.cacheHits / totalEmails) * 100).toFixed(1) : '0';

            addLog(`🎉 Importação concluída! ✅ ${ok} | ❌ ${fail} | 📋 ${dup}`, 'success');
            addLog(`📊 Performance: ${emailsPerSecond} emails/seg | Cache: ${cacheHitRate}% | Tempo: ${(totalTime/1000).toFixed(1)}s`, 'info');
            
            // Atualizar estatísticas de performance
            setAppSettings(prev => ({
                ...prev,
                performanceStats: {
                    totalValidated: prev.performanceStats.totalValidated + totalEmails,
                    cacheHits: prev.performanceStats.cacheHits,
                    averageTimePerEmail: totalTime / totalEmails
                }
            }));

            // OTIMIZAÇÃO: Cleanup de memória após processamento
            if (global.gc) {
                global.gc();
            }

        } catch (e) {
            console.error(e);
            addLog(`💥 Erro geral na importação: ${e}`, 'error');
        } finally {
            setBulkProcessing(false);
            setBulkProgress(prev => ({ ...prev, currentEmail: 'Concluído' }));
        }
    }; const handleEditTest = async () => {
        if (!editId) return;
        try {
            const toTest: SmtpConfig = { id: editId, ...editForm } as SmtpConfig;
            const res = await testConfig(toTest);
            alert(res.success ? 'Conexão OK' : `Falhou: ${res.message}`);
        } catch (e: any) {
            alert(`Falhou: ${e?.message || e}`);
        }
    };

    const handleEditSave = async () => {
        if (!editId) return;
        setSavingEdit(true);
        try {
            const computedName = (editForm.name && editForm.name.trim().length > 0)
                ? editForm.name.trim()
                : `${(editForm.fromName || editForm.username.split('@')[0]).trim()}@${editForm.host.trim()}:${editForm.port}`;
            const payload: Partial<SmtpConfig> = {
                ...editForm,
                name: computedName,
                secure: editForm.port === 465 ? true : editForm.secure
            };
            await updateConfig(editId, payload);
            await refetch();
            setIsEditOpen(false);
            setEditId(null);
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar alterações');
        } finally {
            setSavingEdit(false);
        }
    };

    const handleExportSmtps = () => {
        if (!configs || configs.length === 0) {
            alert('Nenhum SMTP para exportar');
            return;
        }
        const lines = configs.map(c => `${c.host}|${c.port}|${c.username}|${c.password || ''}`);
        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const fname = `smtps-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.txt`;
        a.href = url;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 p-6 vscode-page">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--vscode-text)' }}>
                        🔧 SMTP Configuration
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                        Manage your email sending servers
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="btn-secondary" onClick={handleExportSmtps} disabled={configs.length === 0} title="Exportar SMTPs">
                        Exportar
                    </button>
                    <button className="btn-secondary" onClick={handleTestAll} disabled={testingAll || configs.length === 0} title="Testar todos os SMTPs">
                        {testingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                        Testar todos
                    </button>
                    <button className="btn-primary" onClick={handleOpenAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add SMTP Server
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="vscode-panel">
                    <div className="animate-pulse p-4">
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="h-4 rounded w-4" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-1/4" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-32" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-20" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-24" style={{ background: 'var(--vscode-surface)' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : configs.length === 0 ? (
                <div className="vscode-panel">
                    <div className="text-center py-12">
                        <Server className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--vscode-text-muted)' }} />
                        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>No SMTP servers configured</h3>
                        <p className="mb-6" style={{ color: 'var(--vscode-text-muted)' }}>Add your first SMTP server to start sending emails</p>
                            <button className="btn-primary" onClick={handleOpenAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add SMTP Server
                        </button>
                    </div>
                </div>
            ) : (
                <div className="vscode-panel">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: 'var(--vscode-border)' }}>
                            <thead style={{ background: 'var(--vscode-surface)' }}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Server
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Port
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Security
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--vscode-border)' }}>
                                {configs.map(config => (
                                    <tr key={config.id} className="vscode-item-hover">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleToggleActive(config.id, !config.isActive)}
                                                    className="flex items-center"
                                                >
                                                    {config.isActive ? (
                                                        <CheckCircle className="h-5 w-5" style={{ color: 'var(--vscode-success)' }} />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--vscode-text-muted)' }} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium" style={{ color: 'var(--vscode-text)' }}>
                                                {config.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text)' }}>
                                            {config.host}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text)' }}>
                                            {config.port}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                                style={{
                                                    background: (config.secure || config.port === 465) ? 'var(--vscode-success)25' : 'var(--vscode-accent)25',
                                                    color: (config.secure || config.port === 465) ? 'var(--vscode-success)' : 'var(--vscode-accent)'
                                                }}
                                            >
                                                {(config.secure || config.port === 465) ? 'SSL' : 'STARTTLS'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {config.username}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="vscode-button-icon"
                                                    title="Test connection"
                                                    onClick={() => handleTestOne(config)}
                                                    disabled={testingId === config.id}
                                                >
                                                    {testingId === config.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    className="vscode-button-icon"
                                                    title="Edit server"
                                                    onClick={() => handleEditClick(config)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="vscode-button-icon text-red-400 hover:text-red-300"
                                                    title="Delete server"
                                                    onClick={() => deleteConfig(config.id).catch(() => alert('Erro ao deletar'))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit SMTP Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setIsEditOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative w-full max-w-2xl rounded-xl border shadow-2xl"
                            style={{ borderColor: 'var(--vscode-border)', backgroundColor: 'var(--vscode-editor-background, #111827)' }}
                        >
                            <div className="p-4 border-b" style={{ borderColor: 'var(--vscode-border)' }}>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--vscode-text)' }}>Editar SMTP</h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>Host</label>
                                    <input className="vscode-input w-full" value={editForm.host} onChange={e => setEditForm(f => ({ ...f, host: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>Porta</label>
                                    <input type="number" className="vscode-input w-full" value={editForm.port} onChange={e => setEditForm(f => ({ ...f, port: Number(e.target.value) }))} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>Usuário (email)</label>
                                    <input className="vscode-input w-full" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>Senha</label>
                                    <input type="password" className="vscode-input w-full" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>From Email</label>
                                    <input className="vscode-input w-full" value={editForm.fromEmail} onChange={e => setEditForm(f => ({ ...f, fromEmail: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>From Name</label>
                                    <input className="vscode-input w-full" value={editForm.fromName} onChange={e => setEditForm(f => ({ ...f, fromName: e.target.value }))} />
                                </div>
                                <div className="flex items-center space-x-3 md:col-span-2">
                                    <label className="flex items-center text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                        <input type="checkbox" className="mr-2" checked={editForm.secure || editForm.port === 465} onChange={e => setEditForm(f => ({ ...f, secure: e.target.checked }))} />
                                        SSL (porta 465)
                                    </label>
                                    <label className="flex items-center text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                        <input type="checkbox" className="mr-2" checked={editForm.isActive} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} />
                                        Ativo
                                    </label>
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end space-x-2" style={{ borderColor: 'var(--vscode-border)' }}>
                                <button className="btn-secondary" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                                <button className="btn-secondary" onClick={handleEditTest}>Testar</button>
                                <button className="btn-primary" onClick={handleEditSave} disabled={savingEdit}>{savingEdit ? 'Salvando...' : 'Salvar'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Responsive Bulk SMTP Import Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
                    <div className="flex min-h-full items-start justify-center p-4 py-8">
                        <div
                            className="relative w-full max-w-7xl rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                            style={{ borderColor: 'var(--vscode-border)', backgroundColor: 'var(--vscode-editor-background)' }}
                        >
                            {/* Enhanced Header */}
                            <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-600/15 backdrop-blur-sm" style={{ borderColor: 'var(--vscode-border)' }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                            <Server className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                Importação Inteligente de SMTPs
                                            </h3>
                                            <p className="text-sm mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                                Teste automático com múltiplas configurações, portas e extração inteligente
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsAddOpen(false)}
                                        className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-110"
                                        style={{ color: 'var(--vscode-text-muted)' }}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-0">
                                {/* Main Input Section */}
                                <div className="xl:col-span-3 p-6 space-y-6">
                                    {/* Advanced Settings Panel */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Zap className="h-4 w-4 text-blue-400" />
                                                Threads Simultâneas
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={bulkSettings.threads}
                                                onChange={(e) => setBulkSettings(prev => ({ ...prev, threads: Number(e.target.value) }))}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-blue-500/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                style={{
                                                    backgroundColor: 'var(--vscode-input-background)',
                                                    color: 'var(--vscode-text)'
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Clock className="h-4 w-4 text-purple-400" />
                                                Timeout (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="5000"
                                                max="60000"
                                                step="1000"
                                                value={bulkSettings.timeout}
                                                onChange={(e) => setBulkSettings(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                                style={{
                                                    backgroundColor: 'var(--vscode-input-background)',
                                                    color: 'var(--vscode-text)'
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Settings className="h-4 w-4 text-cyan-400" />
                                                Portas para Teste
                                            </label>
                                            <input
                                                type="text"
                                                value={bulkSettings.retryPorts.join(', ')}
                                                onChange={(e) => {
                                                    const ports = e.target.value.split(',').map(p => Number(p.trim())).filter(p => !isNaN(p));
                                                    setBulkSettings(prev => ({ ...prev, retryPorts: ports }));
                                                }}
                                                placeholder="587, 465, 25, 2525"
                                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                                style={{
                                                    backgroundColor: 'var(--vscode-input-background)',
                                                    color: 'var(--vscode-text)'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* NEW: Performance Optimization Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-gradient-to-br from-green-500/8 to-blue-500/8 rounded-2xl border border-green-500/20 backdrop-blur-sm">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Rocket className="h-4 w-4 text-green-400" />
                                                Tamanho do Lote
                                            </label>
                                            <input
                                                type="number"
                                                min="5"
                                                max="50"
                                                value={bulkSettings.batchSize}
                                                onChange={(e) => setBulkSettings(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                                style={{
                                                    backgroundColor: 'var(--vscode-input-background)',
                                                    color: 'var(--vscode-text)'
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Database className="h-4 w-4 text-blue-400" />
                                                Cache de Domínio (ms)
                                            </label>
                                            <input
                                                type="number"
                                                min="1000"
                                                max="10000"
                                                step="500"
                                                value={bulkSettings.domainValidationTimeout}
                                                onChange={(e) => setBulkSettings(prev => ({ ...prev, domainValidationTimeout: Number(e.target.value) }))}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-blue-500/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                style={{
                                                    backgroundColor: 'var(--vscode-input-background)',
                                                    color: 'var(--vscode-text)'
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <CheckCircle className="h-4 w-4 text-cyan-400" />
                                                Otimizações
                                            </label>
                                            <div className="space-y-1">
                                                <label className="flex items-center text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="mr-2" 
                                                        checked={bulkSettings.enableDomainCache} 
                                                        onChange={(e) => setBulkSettings(prev => ({ ...prev, enableDomainCache: e.target.checked }))} 
                                                    />
                                                    Cache de Domínio
                                                </label>
                                                <label className="flex items-center text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="mr-2" 
                                                        checked={bulkSettings.enableFastMode} 
                                                        onChange={(e) => setBulkSettings(prev => ({ ...prev, enableFastMode: e.target.checked }))} 
                                                    />
                                                    Modo Rápido (pula validação)
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Input Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                <Mail className="h-5 w-5 text-green-400" />
                                                Lista de Emails
                                            </label>
                                            <div className="flex items-center space-x-4 text-xs">
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/30"></div>
                                                    email|senha
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/30"></div>
                                                    email:senha
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/30"></div>
                                                    host|porta|email|senha
                                                </span>
                                            </div>
                                        </div>

                                        <textarea
                                            className="w-full h-80 px-5 py-4 text-sm rounded-2xl border-2 border-dashed border-gray-500/30 font-mono resize-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                                            style={{
                                                backgroundColor: 'var(--vscode-input-background)',
                                                color: 'var(--vscode-text)'
                                            }}
                                            placeholder="📧 Cole seus emails aqui...

Formatos suportados:
• user@gmail.com|mypassword123
• admin@outlook.com:senha123  
• smtp.customserver.com|587|contact@domain.com|secretpass

🤖 Extração inteligente ativa - funciona mesmo com dados malformados!"
                                            value={bulkText}
                                            onChange={(e) => handleBulkChange(e.target.value)}
                                        />
                                    </div>

                                    {/* Real-time Logs Section */}
                                    {(bulkProgress.logs.length > 0 || bulkProcessing) && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                                    <Activity className="h-5 w-5 text-yellow-400" />
                                                    Logs em Tempo Real
                                                </h4>
                                                {bulkProcessing && (
                                                    <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                                                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                                        <span style={{ color: 'var(--vscode-text)' }}>
                                                            {bulkProgress.current}/{bulkProgress.total}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="h-48 bg-black/40 rounded-2xl border border-gray-500/20 overflow-hidden">
                                                <div className="h-full overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                                    {bulkProgress.logs.slice(-50).map((log, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex text-xs font-mono leading-relaxed ${log.type === 'success' ? 'text-green-400' :
                                                                log.type === 'error' ? 'text-red-400' :
                                                                    log.type === 'warning' ? 'text-yellow-400' :
                                                                        'text-gray-300'
                                                                }`}
                                                        >
                                                            <span className="w-20 flex-shrink-0 opacity-60 font-medium">{log.time}</span>
                                                            <span className="flex-1">{log.message}</span>
                                                        </div>
                                                    ))}
                                                    {bulkProcessing && (
                                                        <div className="flex text-xs font-mono text-blue-400 animate-pulse">
                                                            <span className="w-20 flex-shrink-0 opacity-60">
                                                                {new Date().toLocaleTimeString()}
                                                            </span>
                                                            <span className="flex items-center gap-2">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Processando: {bulkProgress.currentEmail}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Sidebar */}
                                <div className="xl:col-span-1 bg-gray-900/20 border-l border-gray-500/20 p-6 space-y-6">
                                    {/* Progress Indicator */}
                                    {bulkProcessing && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 shadow-lg mb-3">
                                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                                </div>
                                                <h4 className="text-sm font-semibold" style={{ color: 'var(--vscode-text)' }}>
                                                    Processando
                                                </h4>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    <span>Progresso</span>
                                                    <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-full transition-all duration-500 ease-out"
                                                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                    <div style={{ color: 'var(--vscode-text)' }}>Testando</div>
                                                    <div className="text-blue-400 font-mono truncate">{bulkProgress.currentEmail}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Statistics Panel */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--vscode-text)' }}>
                                            <BarChart3 className="h-4 w-4 text-purple-400" />
                                            Estatísticas
                                        </h4>

                                        {!bulkPreview || bulkPreview.length === 0 ? (
                                            <div className="p-4 bg-gray-500/10 rounded-xl border border-gray-500/20 text-center">
                                                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: 'var(--vscode-text-muted)' }} />
                                                <p className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    Cole emails para ver estatísticas
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                                                        <div className="text-xl font-bold text-blue-400">{bulkPreview.length}</div>
                                                        <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Total</div>
                                                    </div>
                                                    <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                                                        <div className="text-xl font-bold text-green-400">
                                                            {bulkPreview.filter(p => p.name.includes('(auto-detectar)')).length}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Auto</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-center">
                                                        <div className="text-xl font-bold text-purple-400">
                                                            {bulkPreview.filter(p => !p.name.includes('(auto-detectar)')).length}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Manual</div>
                                                    </div>
                                                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-center">
                                                        <div className="text-xl font-bold text-yellow-400">
                                                            {(window as any).extractedCredentials?.length || 0}
                                                        </div>
                                                        <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Extraído</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {bulkErrors.length > 0 && (
                                            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                                    <div className="text-xs font-semibold text-red-400">
                                                        {bulkErrors.length} Aviso(s)
                                                    </div>
                                                </div>
                                                <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                                    {bulkErrors.slice(0, 5).map((err, i) => (
                                                        <div key={i} className="text-red-300 opacity-90">
                                                            • {err.length > 50 ? err.substring(0, 50) + '...' : err}
                                                        </div>
                                                    ))}
                                                    {bulkErrors.length > 5 && (
                                                        <div className="text-red-400 font-medium">
                                                            + {bulkErrors.length - 5} mais avisos
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Footer */}
                            <div className="px-6 py-5 border-t bg-gradient-to-r from-gray-900/20 to-gray-800/20 backdrop-blur-sm" style={{ borderColor: 'var(--vscode-border)' }}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="text-xs flex items-center gap-2" style={{ color: 'var(--vscode-text-muted)' }}>
                                        {bulkProcessing ? (
                                            <>
                                                <Zap className="h-4 w-4 text-yellow-400" />
                                                <span>Processando com {bulkSettings.threads} threads simultâneas</span>
                                            </>
                                        ) : (
                                            <>
                                                <Settings className="h-4 w-4 text-blue-400" />
                                                <span>
                                                    {bulkSettings.threads} threads • {bulkSettings.timeout}ms timeout •
                                                    {bulkSettings.retryPorts.length} portas • 
                                                    Lote: {bulkSettings.batchSize} • Cache: {bulkSettings.enableDomainCache ? 'ON' : 'OFF'} • 
                                                    Fast: {bulkSettings.enableFastMode ? 'ON' : 'OFF'}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            className="px-5 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                            style={{
                                                borderColor: 'var(--vscode-border)',
                                                color: 'var(--vscode-text-muted)',
                                                backgroundColor: 'var(--vscode-button-secondaryBackground)'
                                            }}
                                            onClick={() => setIsAddOpen(false)}
                                            disabled={bulkProcessing}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="px-8 py-2.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 font-semibold"
                                            onClick={handleBulkTestAndSave}
                                            disabled={bulkProcessing || (!bulkPreview || bulkPreview.length === 0) && !(window as any).extractedCredentials?.length}
                                        >
                                            {bulkProcessing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    <Rocket className="h-4 w-4" />
                                                    Testar e Importar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmtpConfigPage;
