import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { SmtpConfig } from '../../types';

interface LoadSmtpsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (smtps: SmtpConfig[]) => void;
}

const LoadSmtpsModalSimple: React.FC<LoadSmtpsModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [emailsText, setEmailsText] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleLoad = async () => {
        if (!emailsText.trim()) {
            alert('Por favor, cole seus emails primeiro');
            return;
        }

        setProcessing(true);
        const lines = emailsText.split('\n').filter(line => line.trim());
        const smtps: SmtpConfig[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
                const [email, password] = trimmed.split('|').map(s => s.trim());
                
                if (!email || !password) continue;

                const domain = email.split('@')[1];
                
                const smtp: SmtpConfig = {
                    id: `smtp_${Date.now()}_${Math.random()}`,
                    name: email,
                    host: `smtp.${domain}`,
                    port: 587,
                    secure: false,
                    username: email,
                    password: password,
                    fromEmail: email,
                    fromName: email.split('@')[0],
                    isActive: true
                };

                smtps.push(smtp);
            } catch (error) {
                console.warn('Erro ao processar linha:', line, error);
            }
        }

        setProcessing(false);
        
        if (smtps.length > 0) {
            onLoad(smtps);
            setEmailsText('');
            onClose();
            alert(`✅ ${smtps.length} emails importados com sucesso!`);
        } else {
            alert('❌ Nenhum email válido encontrado. Use o formato: email|senha');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="fixed inset-0 bg-black/60" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-[var(--vscode-editor-background)] rounded-xl border border-[var(--vscode-border)] shadow-2xl">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Upload className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold" style={{ color: 'var(--vscode-text)' }}>
                                        Importar Emails
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Cole seus emails no formato simples
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                            >
                                <X className="h-5 w-5" style={{ color: 'var(--vscode-text)' }} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm block mb-2" style={{ color: 'var(--vscode-text-muted)' }}>
                                    Cole seus emails (um por linha no formato: email|senha)
                                </label>
                                <textarea
                                    value={emailsText}
                                    onChange={(e) => setEmailsText(e.target.value)}
                                    placeholder="exemplo@gmail.com|minhasenha123
outro@outlook.com|outrasenha456
mais@yahoo.com|senha789"
                                    rows={12}
                                    className="w-full px-4 py-3 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded-xl text-[var(--vscode-input-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 font-mono text-sm"
                                    disabled={processing}
                                />
                            </div>
                            
                            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                <h4 className="text-sm font-medium text-blue-400 mb-2">💡 Formato Simples</h4>
                                <div className="text-xs space-y-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                    <div>• Use o formato: <code className="bg-blue-500/20 px-1 rounded">email|senha</code></div>
                                    <div>• Um email por linha</div>
                                    <div>• Configuração SMTP será detectada automaticamente</div>
                                    <div>• Suporta Gmail, Outlook, Yahoo e outros provedores</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={onClose}
                                disabled={processing}
                                className="px-6 py-2 text-[var(--vscode-foreground)] hover:bg-white/10 rounded-lg transition-all duration-200 border border-[var(--vscode-border)]/50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLoad}
                                disabled={processing || !emailsText.trim()}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Importando...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Importar Emails</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadSmtpsModalSimple;