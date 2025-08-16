import {
  Edit, Loader2, Mail, Plus, TestTube, Trash2, Upload, Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { SimpleEmailImportModal } from '../components/modals';
import { useSmtpConfigs } from '../hooks';
import type { SmtpConfig } from '../types';

const SmtpConfigPage: React.FC = () => {
  const { configs, loading, createConfig, deleteConfig, testConfig, refetch } = useSmtpConfigs();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSimpleImportModal, setShowSimpleImportModal] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);

    // Simple Add Modal State
    const [addForm, setAddForm] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [addTesting, setAddTesting] = useState(false);

    // Simple Bulk Import State
    const [bulkText, setBulkText] = useState('');
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, message: '' });

    const handleTestOne = async (cfg: SmtpConfig) => {
        setTestingId(cfg.id);
        try {
            const res = await testConfig(cfg);
            alert(res.success ? '✅ Conexão funcionando!' : `❌ Falha: ${res.message}`);
        } catch (e: any) {
            alert(`❌ Erro: ${e?.message || e}`);
        } finally {
            setTestingId(null);
        }
    };

    const handleAddSingle = async () => {
        if (!addForm.email || !addForm.password) {
            alert('Por favor, preencha email e senha');
            return;
        }

        setAddTesting(true);
        try {
            const domain = addForm.email.split('@')[1];
            const config: Omit<SmtpConfig, 'id'> = {
                name: addForm.name || `${addForm.email}`,
                host: `smtp.${domain}`,
                port: 587,
                secure: false,
                username: addForm.email,
                password: addForm.password,
                fromEmail: addForm.email,
                fromName: addForm.name || addForm.email.split('@')[0],
                isActive: true
            };

            await createConfig(config);
            setAddForm({ email: '', password: '', name: '' });
            setShowAddModal(false);
            refetch();
            alert('✅ Email adicionado com sucesso!');
        } catch (error) {
            alert(`❌ Erro ao adicionar: ${error}`);
        } finally {
            setAddTesting(false);
        }
    };

    const handleBulkImport = async () => {
        if (!bulkText.trim()) {
            alert('Por favor, cole seus emails primeiro');
            return;
        }

        setBulkProcessing(true);
        const lines = bulkText.split('\n').filter(line => line.trim());
        setBulkProgress({ current: 0, total: lines.length, message: 'Iniciando...' });

        let success = 0;
        let failed = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            setBulkProgress({ current: i + 1, total: lines.length, message: `Processando: ${line}` });

            try {
                // Parse email|password format
                const [email, password] = line.split('|').map(s => s.trim());
                
                if (!email || !password) {
                    failed++;
                    continue;
                }

                const domain = email.split('@')[1];
                const config: Omit<SmtpConfig, 'id'> = {
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

                await createConfig(config);
                success++;
            } catch {
                failed++;
            }

            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setBulkProcessing(false);
        setBulkText('');
        setShowBulkModal(false);
        refetch();
        alert(`✅ Importação concluída!\n${success} adicionados, ${failed} falharam`);
    };

  const handleSimpleImport = async (data: {
    name: string;
    emails: string[];
    validSmtps: SmtpConfig[];
    chunkSize: number;
  }) => {
    try {
      // Importar as configurações SMTP detectadas
      let imported = 0;
      for (const smtpConfig of data.validSmtps) {
        try {
          await createConfig(smtpConfig);
          imported++;
        } catch (error) {
          console.error('Erro ao criar config SMTP:', error);
        }
      }

      // Também salvar os emails como lista se necessário
      if (data.emails.length > 0) {
        try {
          await window.electronAPI?.files?.saveEmailListChunked(
            data.name,
            data.emails.map(email => ({ email, name: email.split('@')[0] })),
            data.chunkSize,
            'txt'
          );
        } catch (error) {
          console.error('Erro ao salvar emails:', error);
        }
      }

      setShowSimpleImportModal(false);
      refetch();

      alert(
        `✅ Importação inteligente concluída!\n` +
        `📧 ${data.emails.length} emails processados\n` +
        `🔧 ${imported} configurações SMTP adicionadas\n` +
        `📁 Lista "${data.name}" salva`
      );
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar dados. Verifique o console para mais detalhes.');
    }
  };

    return (
        <div className="flex-1 p-6 vscode-page">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--vscode-text)' }}>
                        📧 Meus Emails
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                        Gerencie seus emails para envio
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        className="btn-secondary"
                        onClick={() => setShowBulkModal(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Vários
                    </button>
                    <button 
              className="bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] px-4 py-2 rounded transition-colors flex items-center"
              onClick={() => setShowSimpleImportModal(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Importação Inteligente
            </button>
            <button 
                        className="btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Email
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="vscode-panel flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" style={{ color: 'var(--vscode-text-muted)' }} />
                    <span style={{ color: 'var(--vscode-text-muted)' }}>Carregando emails...</span>
                </div>
            ) : configs.length === 0 ? (
                <div className="vscode-panel text-center py-16">
                    <Mail className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--vscode-text-muted)' }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>
                        Nenhum email configurado
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--vscode-text-muted)' }}>
                        Adicione seu primeiro email para começar a enviar
                    </p>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeiro Email
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {configs.map(config => (
                        <div key={config.id} className="vscode-panel">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                                    <div>
                                        <div className="font-medium" style={{ color: 'var(--vscode-text)' }}>
                                            {config.fromEmail || config.username}
                                        </div>
                                        <div className="text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {config.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="vscode-button-icon"
                                        title="Testar email"
                                        onClick={() => handleTestOne(config)}
                                        disabled={testingId === config.id}
                                    >
                                        {testingId === config.id ? 
                                            <Loader2 className="h-4 w-4 animate-spin" /> : 
                                            <TestTube className="h-4 w-4" />
                                        }
                                    </button>
                                    <button
                                        className="vscode-button-icon"
                                        title="Editar"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="vscode-button-icon text-red-400 hover:text-red-300"
                                        title="Remover"
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja remover este email?')) {
                                                deleteConfig(config.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Single Email Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-md bg-[var(--vscode-editor-background)] rounded-xl border border-[var(--vscode-border)] shadow-2xl">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--vscode-text)' }}>
                                    Adicionar Email
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                            Email
                                        </label>
                                        <input 
                                            type="email"
                                            className="vscode-input w-full" 
                                            placeholder="seu@email.com"
                                            value={addForm.email}
                                            onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                            Senha
                                        </label>
                                        <input 
                                            type="password"
                                            className="vscode-input w-full" 
                                            placeholder="sua senha"
                                            value={addForm.password}
                                            onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                            Nome (opcional)
                                        </label>
                                        <input 
                                            className="vscode-input w-full" 
                                            placeholder="Seu Nome"
                                            value={addForm.name}
                                            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={addTesting}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={handleAddSingle}
                                        disabled={addTesting}
                                    >
                                        {addTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setShowBulkModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-2xl bg-[var(--vscode-editor-background)] rounded-xl border border-[var(--vscode-border)] shadow-2xl">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--vscode-text)' }}>
                                    Importar Vários Emails
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm block mb-2" style={{ color: 'var(--vscode-text-muted)' }}>
                                            Cole seus emails no formato: email|senha
                                        </label>
                                        <textarea
                                            className="vscode-input w-full h-48 font-mono text-sm"
                                            placeholder="exemplo@gmail.com|minhasenha123
outro@outlook.com|outrasenha456
mais@yahoo.com|senha789"
                                            value={bulkText}
                                            onChange={e => setBulkText(e.target.value)}
                                            disabled={bulkProcessing}
                                        />
                                    </div>

                                    {bulkProcessing && (
                                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm" style={{ color: 'var(--vscode-text)' }}>
                                                    Progresso: {bulkProgress.current}/{bulkProgress.total}
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                    {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-blue-400">
                                                {bulkProgress.message}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => setShowBulkModal(false)}
                                        disabled={bulkProcessing}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={handleBulkImport}
                                        disabled={bulkProcessing || !bulkText.trim()}
                                    >
                                        {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Importar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        {/* Simple Email Import Modal */}
        <SimpleEmailImportModal
          isOpen={showSimpleImportModal}
          onClose={() => setShowSimpleImportModal(false)}
          onImport={handleSimpleImport}
        />
        </div>
    );
};

export default SmtpConfigPage;
