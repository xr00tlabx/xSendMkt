import { AlertCircle, CheckCircle, Edit, Loader2, Play, Plus, Server, TestTube, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useSmtpConfigs } from '../hooks';
import type { SmtpConfig } from '../types';
import { LoadSmtpsModal, TestSmtpsModal } from '../components/modals';

const SmtpConfigPage: React.FC = () => {
    const { configs, loading, updateConfig, createConfig, deleteConfig, testConfig, refetch } = useSmtpConfigs();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [testingAll, setTestingAll] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    
    // Modal states for Load and Test SMTPs
    const [showLoadSmtpsModal, setShowLoadSmtpsModal] = useState(false);
    const [showTestSmtpsModal, setShowTestSmtpsModal] = useState(false);

    // Bulk add state
    const [bulkText, setBulkText] = useState('');
    const [bulkPreview, setBulkPreview] = useState<Array<Omit<SmtpConfig, 'id'>>>();
    const [bulkErrors, setBulkErrors] = useState<string[]>([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [bulkResults, setBulkResults] = useState<Array<{ key: string; status: 'ok' | 'fail' | 'dup'; message?: string }>>([]);

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
        setBulkResults([]);
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

    // Parse textarea lines: host|port|email|senha (pipe only)
    const parseBulk = (text: string) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const preview: Array<Omit<SmtpConfig, 'id'>> = [];
        const errors: string[] = [];
        lines.forEach((line, idx) => {
            const parts = line.split('|');
            if (parts.length < 4) {
                errors.push(`Linha ${idx + 1}: formato esperado host|porta|email|senha`);
                return;
            }
            const [host, portStr, email, password] = parts.map(p => p.trim());
            const lineErrors: string[] = [];
            const port = Number(portStr);
            if (!host) lineErrors.push(`Linha ${idx + 1}: host vazio`);
            if (!Number.isInteger(port) || port < 1 || port > 65535) lineErrors.push(`Linha ${idx + 1}: porta inválida`);
            if (!/^\S+@\S+\.\S+$/.test(email)) lineErrors.push(`Linha ${idx + 1}: email inválido`);
            if (!password) lineErrors.push(`Linha ${idx + 1}: senha vazia`);
            if (lineErrors.length > 0) {
                errors.push(...lineErrors);
                return;
            }
            const local = email.split('@')[0];
            const secure = port === 465;
            preview.push({
                name: `${local}@${host}:${port}`,
                host,
                port,
                secure,
                username: email,
                password,
                fromEmail: email,
                fromName: local,
                isActive: true
            });
        });
        setBulkPreview(preview);
        setBulkErrors(errors);
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

    const handleLoadSmtps = (newSmtps: SmtpConfig[]) => {
        // Adicionar SMTPs importados
        newSmtps.forEach(async (smtp) => {
            try {
                await createConfig(smtp);
            } catch (error) {
                console.error('Erro ao adicionar SMTP:', error);
            }
        });
        setShowLoadSmtpsModal(false);
        refetch();
    };

    const handleBulkTestAndSave = async () => {
        if (!bulkPreview || bulkPreview.length === 0) return;
        setBulkProcessing(true);
        setBulkResults([]);
        try {
            let ok = 0, fail = 0, dup = 0;
            const results: Array<{ key: string; status: 'ok' | 'fail' | 'dup'; message?: string }> = [];
            const existing = new Set(configs.map(c => `${c.host}|${c.port}|${(c.username || '').toLowerCase()}`));
            for (const cfg of bulkPreview) {
                const key = `${cfg.host}|${cfg.port}|${(cfg.username || '').toLowerCase()}`;
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
                    } else {
                        fail++;
                        results.push({ key, status: 'fail', message: test?.message || 'Falha na verificação' });
                    }
                } catch (err: any) {
                    fail++;
                    results.push({ key, status: 'fail', message: err?.message || String(err) });
                }
            }
            setBulkResults(results);
            await refetch();
            alert(`Importação concluída:\n✓ Salvos: ${ok}\n✗ Falhas: ${fail}\n≡ Duplicados: ${dup}`);
            // Keep modal open so user can review detailed logs
        } catch (e) {
            console.error(e);
            alert('Erro ao processar importação');
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleEditTest = async () => {
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
                    <button 
                        className="btn-secondary" 
                        onClick={() => setShowLoadSmtpsModal(true)} 
                        title="Carregar SMTPs de arquivo ou texto"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Carregar SMTPs
                    </button>
                    <button 
                        className="btn-secondary" 
                        onClick={() => setShowTestSmtpsModal(true)} 
                        disabled={configs.length === 0} 
                        title="Testar SMTPs individualmente"
                    >
                        <TestTube className="h-4 w-4 mr-2" />
                        Testar SMTPs
                    </button>
                    <button className="btn-secondary" onClick={handleTestAll} disabled={testingAll || configs.length === 0} title="Testar todos os SMTPs">
                        {testingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
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

            {/* Add SMTP Modal (Bulk) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setIsAddOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div
                            className="relative w-full max-w-3xl rounded-xl border shadow-2xl"
                            style={{ borderColor: 'var(--vscode-border)', backgroundColor: 'var(--vscode-editor-background, #111827)' }}
                        >
                            <div className="p-4 border-b" style={{ borderColor: 'var(--vscode-border)' }}>
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--vscode-text)' }}>Adicionar SMTPs em Lote</h3>
                                <p className="text-xs mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                                    Padrão: host|porta|email|senha — um por linha
                                </p>
                            </div>
                            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs block mb-1" style={{ color: 'var(--vscode-text-muted)' }}>Lista de SMTPs</label>
                                    <textarea
                                        className="w-full h-64 vscode-input"
                                        placeholder={"smtp.exemplo.com|587|user@dominio.com|senha123\nmail.provedor.com|465|conta@provedor.com|senha456"}
                                        value={bulkText}
                                        onChange={(e) => handleBulkChange(e.target.value)}
                                    />
                                    <div className="mt-2 text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Dica: porta 465 será tratada como SSL; demais como STARTTLS.
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 rounded border" style={{ borderColor: 'var(--vscode-border)' }}>
                                        <div className="text-sm font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>Pré-visualização</div>
                                        {!bulkPreview || bulkPreview.length === 0 ? (
                                            <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Cole a lista para ver a prévia.</div>
                                        ) : (
                                            <div className="text-xs space-y-1" style={{ color: 'var(--vscode-text)' }}>
                                                <div>Válidos: {bulkPreview.length}</div>
                                                <div>Duplicados (serão ignorados): {
                                                    bulkPreview.filter(p => configs.some(c => c.host === p.host && c.port === p.port && c.username === p.username)).length
                                                }</div>
                                            </div>
                                        )}
                                        {bulkErrors.length > 0 && (
                                            <div className="mt-3 p-2 rounded border" style={{ borderColor: 'var(--vscode-border)', background: 'var(--vscode-errorForeground)10', color: 'var(--vscode-errorForeground)' }}>
                                                {bulkErrors.slice(0, 6).map((err, i) => (
                                                    <div key={i} className="text-xs">• {err}</div>
                                                ))}
                                                {bulkErrors.length > 6 && (
                                                    <div className="text-xs mt-1">+ {bulkErrors.length - 6} mais</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 rounded border" style={{ borderColor: 'var(--vscode-border)' }}>
                                        <div className="text-sm font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>Resultados</div>
                                        {bulkProcessing && (
                                            <div className="flex items-center text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Processando...
                                            </div>
                                        )}
                                        {!bulkProcessing && bulkResults.length === 0 && (
                                            <div className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>Sem resultados ainda.</div>
                                        )}
                                        {!bulkProcessing && bulkResults.length > 0 && (
                                            <div className="max-h-48 overflow-auto space-y-1">
                                                {bulkResults.map((r, i) => (
                                                    <div key={i} className="flex items-start text-xs">
                                                        {r.status === 'ok' ? (
                                                            <CheckCircle className="h-3.5 w-3.5 mr-2" style={{ color: 'var(--vscode-success)' }} />
                                                        ) : r.status === 'dup' ? (
                                                            <TestTube className="h-3.5 w-3.5 mr-2" style={{ color: 'var(--vscode-text-muted)' }} />
                                                        ) : (
                                                            <AlertCircle className="h-3.5 w-3.5 mr-2" style={{ color: 'var(--vscode-errorForeground)' }} />
                                                        )}
                                                        <div>
                                                            <div style={{ color: 'var(--vscode-text)' }}>{r.key.replace(/\|/g, ' | ')}</div>
                                                            {r.message && (
                                                                <div style={{ color: r.status === 'fail' ? 'var(--vscode-errorForeground)' : 'var(--vscode-text-muted)' }}>{r.message}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end space-x-2" style={{ borderColor: 'var(--vscode-border)' }}>
                                <button className="btn-secondary" onClick={() => setIsAddOpen(false)}>Cancelar</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleBulkTestAndSave}
                                    disabled={!bulkPreview || bulkPreview.length === 0 || bulkProcessing}
                                >
                                    {bulkProcessing ? 'Processando...' : 'Testar e Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modais */}
            <LoadSmtpsModal
                isOpen={showLoadSmtpsModal}
                onClose={() => setShowLoadSmtpsModal(false)}
                onLoad={handleLoadSmtps}
            />

            <TestSmtpsModal
                isOpen={showTestSmtpsModal}
                onClose={() => setShowTestSmtpsModal(false)}
                smtps={configs}
            />
        </div>
    );
};

export default SmtpConfigPage;
