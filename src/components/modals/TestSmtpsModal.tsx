import { CheckCircle, Clock, Loader2, Play, X, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { SmtpConfig } from '../../types';

interface SmtpTestResult {
    smtp: SmtpConfig;
    status: 'pending' | 'testing' | 'success' | 'failed';
    responseTime?: number;
    error?: string;
}

interface TestSmtpsModalProps {
    isOpen: boolean;
    onClose: () => void;
    smtps: SmtpConfig[];
}

const TestSmtpsModal: React.FC<TestSmtpsModalProps> = ({ isOpen, onClose, smtps }) => {
    const [testResults, setTestResults] = useState<SmtpTestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [testEmail, setTestEmail] = useState('test@exemplo.com');
    const [threads, setThreads] = useState(5);

    const testSmtp = async (smtp: SmtpConfig): Promise<SmtpTestResult> => {
        return new Promise((resolve) => {
            // Simulate SMTP test delay
            const delay = Math.random() * 4000 + 2000; // 2-6 seconds
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% success rate
                resolve({
                    smtp,
                    status: success ? 'success' : 'failed',
                    responseTime: success ? Math.floor(Math.random() * 3000 + 500) : undefined,
                    error: success ? undefined : getRandomError()
                });
            }, delay);
        });
    };

    const getRandomError = (): string => {
        const errors = [
            'Authentication failed',
            'Connection timeout',
            'SMTP server not responding',
            'Invalid credentials',
            'SSL handshake failed',
            'Server rejected connection',
            'Port not accessible'
        ];
        return errors[Math.floor(Math.random() * errors.length)];
    };

    const runTests = async () => {
        if (smtps.length === 0) return;

        setIsRunning(true);
        const initialResults: SmtpTestResult[] = smtps.map(smtp => ({
            smtp,
            status: 'pending'
        }));
        setTestResults(initialResults);

        // Test SMTPs in batches based on threads setting
        const results: SmtpTestResult[] = [...initialResults];

        for (let i = 0; i < smtps.length; i += threads) {
            const batch = smtps.slice(i, i + threads);
            const batchIndexes = batch.map((_, batchIndex) => i + batchIndex);

            // Set status to testing for current batch
            batchIndexes.forEach(index => {
                results[index] = { ...results[index], status: 'testing' };
            });
            setTestResults([...results]);

            // Run tests for current batch
            const batchResults = await Promise.all(batch.map(testSmtp));

            // Update results
            batchResults.forEach((result, batchIndex) => {
                const actualIndex = i + batchIndex;
                results[actualIndex] = result;
            });
            setTestResults([...results]);
        }

        setIsRunning(false);
    };

    const getStatusIcon = (status: SmtpTestResult['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-gray-400" />;
            case 'testing':
                return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-400" />;
        }
    };

    const getStatusText = (status: SmtpTestResult['status']) => {
        switch (status) {
            case 'pending':
                return 'Aguardando';
            case 'testing':
                return 'Testando...';
            case 'success':
                return 'Sucesso';
            case 'failed':
                return 'Falhou';
        }
    };

    const getStatusColor = (status: SmtpTestResult['status']) => {
        switch (status) {
            case 'pending':
                return 'text-gray-400';
            case 'testing':
                return 'text-blue-400';
            case 'success':
                return 'text-green-400';
            case 'failed':
                return 'text-red-400';
        }
    };

    const successCount = testResults.filter(r => r.status === 'success').length;
    const failedCount = testResults.filter(r => r.status === 'failed').length;
    const completedCount = successCount + failedCount;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-6xl bg-gradient-to-br from-[var(--vscode-editor-background)] to-[var(--vscode-sideBar-background)] rounded-2xl shadow-2xl border border-[var(--vscode-border)]/50 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-[var(--vscode-border)]/50">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Play className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[var(--vscode-foreground)]">
                                        Testar SMTPs
                                    </h2>
                                    {testResults.length > 0 && (
                                        <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                                            Progresso: {completedCount}/{smtps.length} completados
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                                <X className="h-5 w-5 text-[var(--vscode-foreground)]" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        {testResults.length > 0 && smtps.length > 0 && (
                            <div className="px-6 pb-4">
                                <div className="w-full bg-[var(--vscode-progressBar-background)] rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                                        style={{ width: `${(completedCount / smtps.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-b from-transparent to-[var(--vscode-sideBar-background)]/20">
                        {/* Test Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-[var(--vscode-border)]/30 backdrop-blur-sm">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-2">
                                    Email de Teste
                                </label>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--vscode-foreground)] mb-2">
                                    Threads Simultâneas
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={threads}
                                    onChange={(e) => setThreads(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 bg-[var(--vscode-input-background)]/80 border border-[var(--vscode-input-border)]/50 rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={runTests}
                                    disabled={isRunning || smtps.length === 0}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                                >
                                    {isRunning ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Play className="h-5 w-5" />
                                    )}
                                    <span className="font-medium">{isRunning ? 'Testando...' : 'Iniciar Testes'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        {testResults.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-[var(--vscode-border)]/30">
                                    <div className="text-3xl font-bold text-[var(--vscode-foreground)] mb-1">{smtps.length}</div>
                                    <div className="text-sm text-[var(--vscode-descriptionForeground)]">Total</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-green-500/20">
                                    <div className="text-3xl font-bold text-green-400 mb-1">{successCount}</div>
                                    <div className="text-sm text-[var(--vscode-descriptionForeground)]">Sucessos</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-red-500/20">
                                    <div className="text-3xl font-bold text-red-400 mb-1">{failedCount}</div>
                                    <div className="text-sm text-[var(--vscode-descriptionForeground)]">Falhas</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-blue-500/20">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {completedCount > 0 ? Math.round((successCount / completedCount) * 100) : 0}%
                                    </div>
                                    <div className="text-sm text-[var(--vscode-descriptionForeground)]">Taxa de Sucesso</div>
                                </div>
                            </div>
                        )}

                        {/* Results */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-[var(--vscode-foreground)] flex items-center space-x-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                <span>Resultados dos Testes</span>
                            </h3>

                            {smtps.length === 0 ? (
                                <div className="text-center py-16 px-8">
                                    <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                                        <Play className="w-full h-full text-[var(--vscode-descriptionForeground)]" />
                                    </div>
                                    <p className="text-[var(--vscode-descriptionForeground)] text-lg">Nenhum SMTP disponível para teste</p>
                                </div>
                            ) : testResults.length === 0 ? (
                                <div className="text-center py-16 px-8">
                                    <div className="w-24 h-24 mx-auto mb-6 opacity-20">
                                        <Play className="w-full h-full text-[var(--vscode-descriptionForeground)]" />
                                    </div>
                                    <p className="text-[var(--vscode-descriptionForeground)] text-lg mb-2">Pronto para iniciar os testes</p>
                                    <p className="text-sm text-[var(--vscode-descriptionForeground)]">Clique em "Iniciar Testes" para começar</p>
                                </div>
                            ) : (
                                <div className="bg-[var(--vscode-editor-background)]/50 backdrop-blur-sm border border-[var(--vscode-border)]/30 rounded-2xl overflow-hidden">
                                    <div className="max-h-96 overflow-y-auto">
                                        {testResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className={`px-6 py-4 border-b border-[var(--vscode-border)]/20 last:border-b-0 hover:bg-white/5 transition-all duration-200 ${result.status === 'testing' ? 'bg-blue-500/5 border-l-4 border-l-blue-500' :
                                                        result.status === 'success' ? 'hover:bg-green-500/5' :
                                                            result.status === 'failed' ? 'hover:bg-red-500/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <div className="text-sm font-medium text-[var(--vscode-foreground)] truncate">
                                                                {result.smtp.host}:{result.smtp.port}
                                                            </div>
                                                            <div className={`px-2 py-1 text-xs rounded-full border ${result.smtp.secure
                                                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                                                }`}>
                                                                {result.smtp.secure ? 'SSL' : 'TLS/STARTTLS'}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-[var(--vscode-descriptionForeground)] mb-1">
                                                            {result.smtp.username}
                                                        </div>
                                                        {result.error && (
                                                            <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 mt-2">
                                                                {result.error}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 ml-4">
                                                        {result.responseTime && (
                                                            <div className="text-center">
                                                                <div className="text-xs text-[var(--vscode-descriptionForeground)]">Tempo</div>
                                                                <div className="text-sm font-mono text-[var(--vscode-foreground)]">
                                                                    {result.responseTime}ms
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center space-x-2">
                                                            {getStatusIcon(result.status)}
                                                            <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                                                                {getStatusText(result.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[var(--vscode-editor-background)]/80 backdrop-blur-sm border-t border-[var(--vscode-border)]/50 p-6">
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 border border-[var(--vscode-border)]/50"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestSmtpsModal;
