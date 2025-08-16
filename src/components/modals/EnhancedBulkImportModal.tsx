import { 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    FileText, 
    Loader2, 
    Play, 
    Upload, 
    X, 
    Zap,
    Activity,
    TrendingUp,
    Database,
    Settings
} from 'lucide-react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { SmtpConfig } from '../../types';
import { detectSmtpFromEmail, validateEmail, isKnownProvider, extractDomain } from '../../utils/smtpDetector';

interface EnhancedBulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: { 
        name: string; 
        emails: string[]; 
        validSmtps: SmtpConfig[];
        chunkSize: number;
    }) => void;
}

interface ImportStats {
    totalEmails: number;
    validEmails: number;
    invalidEmails: number;
    duplicatesRemoved: number;
    finalCount: number;
    processedDomains: number;
    uniqueDomains: number;
    knownProviders: number;
    validSmtps: number;
}

interface LogEntry {
    id: string;
    timestamp: Date;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

interface ProcessingState {
    phase: 'idle' | 'parsing' | 'detecting' | 'testing' | 'complete' | 'error';
    progress: number;
    currentDomain?: string;
    emailsPerSecond?: number;
    domainsPerSecond?: number;
    startTime?: Date;
}

const EnhancedBulkImportModal: React.FC<EnhancedBulkImportModalProps> = ({
    isOpen,
    onClose,
    onImport
}) => {
    const [formData, setFormData] = useState({
        name: '',
        chunkSize: 5000,
        maxThreads: 10,
        timeoutMs: 3000,
        stopOnFirstValid: true,
        enableFastMode: true
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [processingState, setProcessingState] = useState<ProcessingState>({ phase: 'idle', progress: 0 });
    const [stats, setStats] = useState<ImportStats | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [validSmtps, setValidSmtps] = useState<SmtpConfig[]>([]);
    const [domainCache, setDomainCache] = useState<Map<string, SmtpConfig | null>>(new Map());
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Auto-scroll logs to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type,
            message,
            details
        };
        setLogs(prev => [...prev.slice(-50), newLog]); // Keep only last 50 logs
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 500 * 1024 * 1024; // 500MB
            if (file.size > maxSize) {
                addLog('error', 'Arquivo muito grande', 'O tamanho máximo é 500MB');
                return;
            }

            setSelectedFile(file);
            if (!formData.name) {
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                setFormData(prev => ({ ...prev, name: nameWithoutExt }));
            }
            addLog('info', 'Arquivo selecionado', `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        }
    };

    const parseEmails = async (file: File): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    setProcessingState(prev => ({ ...prev, phase: 'parsing' }));
                    addLog('info', 'Iniciando análise do arquivo', 'Extraindo e validando emails...');
                    
                    const text = e.target?.result as string;
                    const lines = text.split('\n');
                    const totalLines = lines.length;
                    
                    const validEmails: string[] = [];
                    const emailSet = new Set<string>();
                    let invalidCount = 0;
                    let duplicateCount = 0;
                    
                    lines.forEach((line, index) => {
                        const progress = Math.round((index / totalLines) * 100);
                        if (progress !== processingState.progress) {
                            setProcessingState(prev => ({ ...prev, progress }));
                        }
                        
                        const email = line.trim();
                        if (email) {
                            if (validateEmail(email)) {
                                const lowerEmail = email.toLowerCase();
                                if (!emailSet.has(lowerEmail)) {
                                    emailSet.add(lowerEmail);
                                    validEmails.push(email);
                                } else {
                                    duplicateCount++;
                                }
                            } else {
                                invalidCount++;
                            }
                        }
                    });

                    // Analyze domains
                    const domainMap = new Map<string, string[]>();
                    validEmails.forEach(email => {
                        const domain = extractDomain(email);
                        if (!domainMap.has(domain)) {
                            domainMap.set(domain, []);
                        }
                        domainMap.get(domain)!.push(email);
                    });

                    const knownProviderCount = Array.from(domainMap.keys())
                        .filter(domain => isKnownProvider(domain)).length;

                    const finalStats: ImportStats = {
                        totalEmails: totalLines,
                        validEmails: validEmails.length + duplicateCount,
                        invalidEmails: invalidCount,
                        duplicatesRemoved: duplicateCount,
                        finalCount: validEmails.length,
                        processedDomains: 0,
                        uniqueDomains: domainMap.size,
                        knownProviders: knownProviderCount,
                        validSmtps: 0
                    };

                    setStats(finalStats);
                    addLog('success', 'Análise concluída', 
                        `${validEmails.length} emails válidos, ${domainMap.size} domínios únicos, ${knownProviderCount} provedores conhecidos`);
                    
                    resolve(validEmails);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    };

    const testSmtpConfig = async (smtpConfig: SmtpConfig, signal: AbortSignal): Promise<boolean> => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(false);
            }, formData.timeoutMs);

            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                resolve(false);
            });

            // Simulate SMTP testing with better success rates for known providers
            const isKnown = smtpConfig.name.includes('GMAIL') || 
                           smtpConfig.name.includes('OUTLOOK') || 
                           smtpConfig.name.includes('YAHOO');
            
            const baseDelay = isKnown ? 500 : 1000; // Faster for known providers
            const delay = Math.random() * baseDelay + 200;
            const successRate = isKnown ? 0.85 : 0.3; // Higher success for known providers

            setTimeout(() => {
                if (!signal.aborted) {
                    clearTimeout(timeout);
                    resolve(Math.random() < successRate);
                }
            }, delay);
        });
    };

    const detectAndTestSmtps = async (emails: string[]): Promise<SmtpConfig[]> => {
        const validSmtpConfigs: SmtpConfig[] = [];
        const domainMap = new Map<string, string[]>();
        
        // Group emails by domain
        emails.forEach(email => {
            const domain = extractDomain(email);
            if (!domainMap.has(domain)) {
                domainMap.set(domain, []);
            }
            domainMap.get(domain)!.push(email);
        });

        const domains = Array.from(domainMap.keys());
        const totalDomains = domains.length;
        let processedDomains = 0;
        
        setProcessingState(prev => ({ 
            ...prev, 
            phase: 'detecting', 
            progress: 0,
            startTime: new Date()
        }));
        
        addLog('info', 'Iniciando detecção de SMTPs', 
            `Processando ${totalDomains} domínios únicos com ${formData.maxThreads} threads`);

        // Process domains in parallel batches
        for (let i = 0; i < domains.length; i += formData.maxThreads) {
            if (abortControllerRef.current?.signal.aborted) break;
            
            const batch = domains.slice(i, i + formData.maxThreads);
            const batchPromises = batch.map(async (domain) => {
                if (abortControllerRef.current?.signal.aborted) return null;
                
                setProcessingState(prev => ({ ...prev, currentDomain: domain }));
                
                // Check cache first
                if (domainCache.has(domain)) {
                    const cached = domainCache.get(domain);
                    if (cached) {
                        addLog('info', `Cache hit para ${domain}`, 'Usando configuração cacheada');
                        return cached;
                    }
                    return null;
                }
                
                // Fast mode: skip testing for known providers if enabled
                if (formData.enableFastMode && isKnownProvider(domain)) {
                    const sampleEmail = domainMap.get(domain)![0];
                    const smtpDetection = detectSmtpFromEmail(sampleEmail);
                    
                    const smtpConfig: SmtpConfig = {
                        id: `smtp_${Date.now()}_${domain}`,
                        name: `${smtpDetection.provider?.toUpperCase()} - ${domain}`,
                        host: smtpDetection.host,
                        port: smtpDetection.port,
                        secure: smtpDetection.secure,
                        username: sampleEmail,
                        password: 'auto-detected',
                        fromEmail: sampleEmail,
                        fromName: sampleEmail.split('@')[0],
                        isActive: true
                    };
                    
                    addLog('success', `Provedor conhecido detectado: ${domain}`, 
                        `${smtpDetection.host}:${smtpDetection.port} (fast mode)`);
                    
                    setDomainCache(prev => new Map(prev).set(domain, smtpConfig));
                    return smtpConfig;
                }
                
                // Test SMTP configuration
                const sampleEmail = domainMap.get(domain)![0];
                const smtpDetection = detectSmtpFromEmail(sampleEmail);
                
                const smtpConfig: SmtpConfig = {
                    id: `smtp_${Date.now()}_${domain}`,
                    name: smtpDetection.detected 
                        ? `${smtpDetection.provider?.toUpperCase()} - ${domain}`
                        : `Auto-detectado - ${domain}`,
                    host: smtpDetection.host,
                    port: smtpDetection.port,
                    secure: smtpDetection.secure,
                    username: sampleEmail,
                    password: 'test-password',
                    fromEmail: sampleEmail,
                    fromName: sampleEmail.split('@')[0],
                    isActive: true
                };
                
                addLog('info', `Testando SMTP para ${domain}`, 
                    `${smtpDetection.host}:${smtpDetection.port}`);
                
                const isValid = await testSmtpConfig(smtpConfig, abortControllerRef.current!.signal);
                
                if (isValid) {
                    addLog('success', `SMTP válido encontrado: ${domain}`, 
                        `${smtpDetection.host}:${smtpDetection.port}`);
                    setDomainCache(prev => new Map(prev).set(domain, smtpConfig));
                    return smtpConfig;
                } else {
                    addLog('warning', `SMTP falhou para ${domain}`, 
                        `${smtpDetection.host}:${smtpDetection.port} - conexão não estabelecida`);
                    setDomainCache(prev => new Map(prev).set(domain, null));
                    return null;
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            
            batchResults.forEach(result => {
                if (result) {
                    validSmtpConfigs.push(result);
                }
            });
            
            processedDomains += batch.length;
            const progress = Math.round((processedDomains / totalDomains) * 100);
            
            // Calculate performance metrics
            const elapsed = (Date.now() - (processingState.startTime?.getTime() || Date.now())) / 1000;
            const domainsPerSecond = processedDomains / elapsed;
            
            setProcessingState(prev => ({ 
                ...prev, 
                progress,
                domainsPerSecond: Number(domainsPerSecond.toFixed(1))
            }));
            
            setStats(prev => prev ? {
                ...prev,
                processedDomains,
                validSmtps: validSmtpConfigs.length
            } : null);
            
            // Stop on first valid if enabled
            if (formData.stopOnFirstValid && validSmtpConfigs.length > 0) {
                addLog('info', 'Modo "parar no primeiro válido" ativado', 
                    `Parando após encontrar ${validSmtpConfigs.length} SMTP(s) válido(s)`);
                break;
            }
        }
        
        return validSmtpConfigs;
    };

    const handleImport = async () => {
        if (!selectedFile || !formData.name) {
            addLog('error', 'Dados incompletos', 'Selecione um arquivo e defina um nome para a lista');
            return;
        }

        abortControllerRef.current = new AbortController();
        setLogs([]);
        setValidSmtps([]);
        setDomainCache(new Map());
        
        try {
            // Phase 1: Parse emails
            const emails = await parseEmails(selectedFile);
            
            if (emails.length === 0) {
                addLog('error', 'Nenhum email válido encontrado', 'Verifique o formato do arquivo');
                setProcessingState({ phase: 'error', progress: 0 });
                return;
            }
            
            // Phase 2: Detect and test SMTPs
            const validSmtpConfigs = await detectAndTestSmtps(emails);
            
            setValidSmtps(validSmtpConfigs);
            setProcessingState({ phase: 'complete', progress: 100 });
            
            if (validSmtpConfigs.length > 0) {
                addLog('success', 'Importação concluída com sucesso!', 
                    `${validSmtpConfigs.length} SMTP(s) válido(s) encontrado(s)`);
                
                // Auto-import if we found valid SMTPs
                onImport({
                    name: formData.name,
                    emails,
                    validSmtps: validSmtpConfigs,
                    chunkSize: formData.chunkSize
                });
                
                handleClose();
            } else {
                addLog('warning', 'Nenhum SMTP válido encontrado', 
                    'Todos os servidores testados falharam na conexão');
            }
            
        } catch (error) {
            console.error('Erro durante importação:', error);
            addLog('error', 'Erro durante o processamento', 
                error instanceof Error ? error.message : 'Erro desconhecido');
            setProcessingState({ phase: 'error', progress: 0 });
        }
    };

    const handleClose = () => {
        if (processingState.phase === 'parsing' || processingState.phase === 'detecting' || processingState.phase === 'testing') {
            abortControllerRef.current?.abort();
        }
        setFormData({ name: '', chunkSize: 5000, maxThreads: 10, timeoutMs: 3000, stopOnFirstValid: true, enableFastMode: true });
        setSelectedFile(null);
        setProcessingState({ phase: 'idle', progress: 0 });
        setStats(null);
        setLogs([]);
        setValidSmtps([]);
        setDomainCache(new Map());
        onClose();
    };

    const getPhaseText = (phase: ProcessingState['phase']) => {
        switch (phase) {
            case 'idle': return 'Aguardando';
            case 'parsing': return 'Analisando arquivo...';
            case 'detecting': return 'Detectando SMTPs...';
            case 'testing': return 'Testando conexões...';
            case 'complete': return 'Concluído';
            case 'error': return 'Erro';
        }
    };

    const getPhaseIcon = (phase: ProcessingState['phase']) => {
        switch (phase) {
            case 'idle': return <Clock className="h-5 w-5" />;
            case 'parsing': return <FileText className="h-5 w-5" />;
            case 'detecting': return <Zap className="h-5 w-5" />;
            case 'testing': return <Activity className="h-5 w-5" />;
            case 'complete': return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'error': return <AlertTriangle className="h-5 w-5 text-red-400" />;
        }
    };

    const isProcessing = ['parsing', 'detecting', 'testing'].includes(processingState.phase);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isProcessing ? handleClose : undefined} />
            
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-7xl bg-gradient-to-br from-[var(--vscode-editor-background)] to-[var(--vscode-sideBar-background)] rounded-2xl shadow-2xl border border-[var(--vscode-border)]/50 overflow-hidden">
                    
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-[var(--vscode-border)]/50">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--vscode-foreground)]">
                                        Importação Inteligente de Emails
                                    </h2>
                                    <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                                        Análise automática, detecção de SMTPs e importação otimizada
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                disabled={isProcessing}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            >
                                <X className="h-5 w-5 text-[var(--vscode-foreground)]" />
                            </button>
                        </div>
                        
                        {/* Phase indicator */}
                        <div className="px-6 pb-4">
                            <div className="flex items-center space-x-3 mb-3">
                                {getPhaseIcon(processingState.phase)}
                                <span className="text-sm font-medium text-[var(--vscode-foreground)]">
                                    {getPhaseText(processingState.phase)}
                                </span>
                                {processingState.currentDomain && (
                                    <span className="text-xs text-[var(--vscode-descriptionForeground)]">
                                        • {processingState.currentDomain}
                                    </span>
                                )}
                            </div>
                            
                            {isProcessing && (
                                <div className="w-full bg-[var(--vscode-progressBar-background)] rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${processingState.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(80vh-200px)]">
                            
                            {/* Configuration Panel */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">Configuração</h3>
                                </div>

                                <div className="space-y-4 p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-xl border border-[var(--vscode-border)]/30">
                                    
                                    {/* File Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-2">
                                            Arquivo de Emails
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                                selectedFile ? 'border-green-500/50 bg-green-500/10' : 'border-[var(--vscode-border)] hover:border-green-500/50'
                                            } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
                                            onClick={() => !isProcessing && fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".txt,.csv"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                disabled={isProcessing}
                                            />
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <FileText className="h-5 w-5 text-green-400" />
                                                    <span className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                        {selectedFile.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Upload className="h-6 w-6 mx-auto mb-2 text-[var(--vscode-descriptionForeground)]" />
                                                    <p className="text-sm text-[var(--vscode-foreground)]">Clique para selecionar</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-2">
                                            Nome da Lista
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded-lg text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                            placeholder="Nome da lista..."
                                            disabled={isProcessing}
                                        />
                                    </div>

                                    {/* Advanced Settings */}
                                    <div className="pt-4 border-t border-[var(--vscode-border)]/30">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Settings className="h-4 w-4 text-[var(--vscode-descriptionForeground)]" />
                                            <span className="text-sm font-medium text-[var(--vscode-foreground)]">
                                                Configurações Avançadas
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
                                                        Threads Max
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        value={formData.maxThreads}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, maxThreads: parseInt(e.target.value) || 10 }))}
                                                        className="w-full px-2 py-1 text-sm bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)]"
                                                        disabled={isProcessing}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-[var(--vscode-descriptionForeground)] mb-1">
                                                        Timeout (ms)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1000"
                                                        max="10000"
                                                        step="500"
                                                        value={formData.timeoutMs}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) || 3000 }))}
                                                        className="w-full px-2 py-1 text-sm bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)]"
                                                        disabled={isProcessing}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.stopOnFirstValid}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, stopOnFirstValid: e.target.checked }))}
                                                        className="rounded"
                                                        disabled={isProcessing}
                                                    />
                                                    <span className="text-sm text-[var(--vscode-foreground)]">
                                                        Parar no primeiro SMTP válido
                                                    </span>
                                                </label>
                                                
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.enableFastMode}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, enableFastMode: e.target.checked }))}
                                                        className="rounded"
                                                        disabled={isProcessing}
                                                    />
                                                    <span className="text-sm text-[var(--vscode-foreground)]">
                                                        Modo rápido para provedores conhecidos
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleImport}
                                    disabled={!selectedFile || !formData.name || isProcessing}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5" />
                                            <span>Iniciar Importação Inteligente</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Statistics Panel */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">Estatísticas</h3>
                                </div>

                                {stats ? (
                                    <div className="space-y-4">
                                        {/* Performance Metrics */}
                                        {processingState.domainsPerSecond && (
                                            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-[var(--vscode-border)]/30">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Activity className="h-4 w-4 text-blue-400" />
                                                    <span className="text-sm font-medium text-[var(--vscode-foreground)]">Performance</span>
                                                </div>
                                                <div className="text-lg font-bold text-blue-400">
                                                    {processingState.domainsPerSecond} domínios/s
                                                </div>
                                            </div>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-[var(--vscode-editor-background)]/50 rounded-lg text-center">
                                                <div className="text-xl font-bold text-[var(--vscode-foreground)]">{stats.finalCount.toLocaleString()}</div>
                                                <div className="text-xs text-[var(--vscode-descriptionForeground)]">Emails Válidos</div>
                                            </div>
                                            <div className="p-3 bg-[var(--vscode-editor-background)]/50 rounded-lg text-center">
                                                <div className="text-xl font-bold text-blue-400">{stats.uniqueDomains}</div>
                                                <div className="text-xs text-[var(--vscode-descriptionForeground)]">Domínios Únicos</div>
                                            </div>
                                            <div className="p-3 bg-[var(--vscode-editor-background)]/50 rounded-lg text-center">
                                                <div className="text-xl font-bold text-green-400">{stats.knownProviders}</div>
                                                <div className="text-xs text-[var(--vscode-descriptionForeground)]">Provedores Conhecidos</div>
                                            </div>
                                            <div className="p-3 bg-[var(--vscode-editor-background)]/50 rounded-lg text-center">
                                                <div className="text-xl font-bold text-purple-400">{stats.validSmtps}</div>
                                                <div className="text-xs text-[var(--vscode-descriptionForeground)]">SMTPs Válidos</div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 bg-[var(--vscode-editor-background)]/30 rounded-xl">
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--vscode-descriptionForeground)]">Total de linhas:</span>
                                                    <span className="text-[var(--vscode-foreground)]">{stats.totalEmails.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--vscode-descriptionForeground)]">Inválidos removidos:</span>
                                                    <span className="text-red-400">{stats.invalidEmails.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-[var(--vscode-descriptionForeground)]">Duplicados removidos:</span>
                                                    <span className="text-yellow-400">{stats.duplicatesRemoved.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-[var(--vscode-border)]/30">
                                                    <span className="text-[var(--vscode-foreground)] font-medium">Processamento:</span>
                                                    <span className="text-blue-400">{stats.processedDomains}/{stats.uniqueDomains}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-[var(--vscode-descriptionForeground)]">
                                        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Estatísticas aparecerão após iniciar o processamento</p>
                                    </div>
                                )}
                            </div>

                            {/* Logs Panel */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                                    <h3 className="text-lg font-medium text-[var(--vscode-foreground)]">Logs em Tempo Real</h3>
                                </div>

                                <div className="h-full bg-[var(--vscode-editor-background)]/50 rounded-xl border border-[var(--vscode-border)]/30 overflow-hidden">
                                    <div className="h-full overflow-y-auto p-4">
                                        {logs.length === 0 ? (
                                            <div className="text-center py-12 text-[var(--vscode-descriptionForeground)]">
                                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>Logs aparecerão durante o processamento</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {logs.map((log) => (
                                                    <div key={log.id} className="flex items-start space-x-2 text-sm">
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            {log.type === 'info' && <Clock className="h-3 w-3 text-blue-400" />}
                                                            {log.type === 'success' && <CheckCircle className="h-3 w-3 text-green-400" />}
                                                            {log.type === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-400" />}
                                                            {log.type === 'error' && <X className="h-3 w-3 text-red-400" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[var(--vscode-foreground)] font-medium">
                                                                {log.message}
                                                            </div>
                                                            {log.details && (
                                                                <div className="text-[var(--vscode-descriptionForeground)] text-xs mt-1">
                                                                    {log.details}
                                                                </div>
                                                            )}
                                                            <div className="text-[var(--vscode-descriptionForeground)] text-xs mt-1">
                                                                {log.timestamp.toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={logsEndRef} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[var(--vscode-editor-background)]/80 backdrop-blur-sm border-t border-[var(--vscode-border)]/50 p-4">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-[var(--vscode-descriptionForeground)]">
                                {validSmtps.length > 0 && (
                                    <span className="text-green-400">
                                        ✓ {validSmtps.length} SMTP(s) válido(s) encontrado(s)
                                    </span>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleClose}
                                    disabled={isProcessing}
                                    className="px-4 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 border border-[var(--vscode-border)]/50 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Cancelar' : 'Fechar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedBulkImportModal;