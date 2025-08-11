import { Edit, FileText, Mail, RefreshCw, Settings, Trash2, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/modals';
import EmailListModal from '../components/modals/EmailListModal';
import ImportEmailListModal from '../components/modals/ImportEmailListModal';
import { notifyEmailListsUpdate, useEmailLists, useTxtFileCheck } from '../hooks';
import type { EmailList } from '../types';

const EmailListsPage: React.FC = () => {
    const { lists, loading, createList, updateList, deleteList, refetch } = useEmailLists();
    const { txtFileStatus, loading: checkingFiles, checkTxtFiles } = useTxtFileCheck();
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [editingList, setEditingList] = useState<EmailList | null>(null);

    // Teste direto do evento
    useEffect(() => {
        const handleListsUpdate = () => {
            console.log('🔔 EmailListsPage: Evento emailListsUpdated capturado diretamente!');
            console.log('🔔 EmailListsPage: Chamando refetch manual...');
            refetch();
        };

        window.addEventListener('emailListsUpdated', handleListsUpdate);

        return () => {
            window.removeEventListener('emailListsUpdated', handleListsUpdate);
        };
    }, [refetch]);

    const handleSaveList = (data: Partial<EmailList>) => {
        if (editingList) {
            updateList(editingList.id, data);
        } else if (data.name && data.emails) {
            createList({ name: data.name, emails: data.emails });
        }
        setEditingList(null);
    };

    const handleImportList = async (data: { name: string; emails: string[]; chunkSize: number }) => {
        try {
            console.log('handleImportList chamada com:', data);

            // Sempre usar a função chunked, mesmo para listas pequenas
            const result = await window.electronAPI?.files?.saveEmailListChunked(
                data.name,
                data.emails.map(email => ({ email, name: email.split('@')[0] })), // Converter para EmailContact[]
                data.chunkSize,
                'txt'
            );

            if (result && result.length > 0) {
                console.log(`Lista processada em ${result.length} arquivo(s):`);
                result.forEach(chunk => {
                    console.log(`- ${chunk.filename}: ${chunk.count} emails`);
                });

                // Atualizar a lista de arquivos
                await checkTxtFiles();

                // Notificar outros componentes sobre a atualização
                notifyEmailListsUpdate();

                // Mostrar mensagem de sucesso
                if (result.length === 1) {
                    alert(`Lista importada com sucesso!\nArquivo: ${result[0].filename} (${result[0].count} emails)`);
                } else {
                    alert(`Lista dividida em ${result.length} arquivos:\n${result.map(chunk => `${chunk.filename} (${chunk.count} emails)`).join('\n')}`);
                }
            } else {
                throw new Error('Falha ao salvar arquivos');
            }
        } catch (error) {
            console.error('Erro ao importar lista:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`Erro ao importar lista: ${errorMessage}`);
        }
    };

    const handleEditList = (list: EmailList) => {
        setEditingList(list);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingList(null);
    };

    const handleClearAllLists = async () => {
        try {
            const success = await window.electronAPI?.files?.clearAllLists();

            if (success) {
                console.log('Todas as listas foram zeradas com sucesso');
                setShowClearModal(false);
                // Recarregar a lista de arquivos
                await checkTxtFiles();
                // Notificar outros componentes sobre a atualização
                notifyEmailListsUpdate();
                alert('Todas as listas de email foram removidas com sucesso!');
            } else {
                throw new Error('Falha ao limpar arquivos de listas');
            }
        } catch (error) {
            console.error('Erro ao zerar listas:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`Erro ao zerar listas: ${errorMessage}`);
        } finally {
            setShowClearModal(false);
        }
    };

    return (
        <div className="flex-1 vscode-page">
            <div className="vscode-compact-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[var(--vscode-text)]">
                            📧 Gerenciar Listas de Email
                        </h1>
                        <p className="text-[var(--vscode-text-muted)]">
                            Importe e gerencie suas listas de emails
                            {lists.length > 0 && (
                                <span className="ml-2">
                                    • {lists.length} lista{lists.length !== 1 ? 's' : ''}
                                    • {lists.reduce((total, list) => total + list.emails.length, 0).toLocaleString()} emails total
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="btn-primary"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar Lista
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-secondary"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Nova Lista Manual
                        </button>
                        {lists.length > 0 && (
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="btn-danger"
                                title="Zerar todas as listas de email"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Zerar Listas
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading || checkingFiles ? (
                <div className="vscode-panel">
                    <div className="animate-pulse p-4">
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center space-x-3">
                                    <div className="h-4 rounded w-1/4" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-20" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-32" style={{ background: 'var(--vscode-surface)' }}></div>
                                    <div className="h-4 rounded w-16" style={{ background: 'var(--vscode-surface)' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : !txtFileStatus.hasDirectory ? (
                <div className="vscode-panel">
                    <div className="text-center py-12">
                        <Settings className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--vscode-text-muted)' }} />
                        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>Diretório não configurado</h3>
                        <p className="mb-6" style={{ color: 'var(--vscode-text-muted)' }}>{txtFileStatus.message}</p>
                        <button
                            onClick={() => window.location.href = '#/settings'}
                            className="btn-primary"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Ir para Configurações
                        </button>
                    </div>
                </div>
            ) : !txtFileStatus.hasTxtFiles ? (
                <div className="vscode-panel">
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--vscode-text-muted)' }} />
                        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>Nenhuma lista encontrada</h3>
                        <p className="mb-6" style={{ color: 'var(--vscode-text-muted)' }}>{txtFileStatus.message}</p>
                                <div className="space-y-2">
                            <button
                                onClick={checkTxtFiles}
                                className="btn-primary"
                            >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                Atualizar
                            </button>
                                    <p className="text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                Coloque arquivos .txt no diretório configurado e clique em atualizar
                            </p>
                        </div>
                    </div>
                </div>
            ) : lists.length === 0 ? (
                <div className="vscode-panel">
                                <div className="text-center py-8">
                                    <Mail className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--vscode-text-muted)' }} />
                                    <h3 className="text-base font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>Nenhuma lista criada ainda</h3>
                                    <p className="text-sm mb-4" style={{ color: 'var(--vscode-text-muted)' }}>Comece importando uma lista de emails ou criando uma manualmente</p>
                                    <div className="flex space-x-2 justify-center">
                                        <button
                                            onClick={() => setShowImportModal(true)}
                                            className="btn-primary"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Importar Lista
                                        </button>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="btn-secondary"
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Criar Manualmente
                                        </button>
                                    </div>
                    </div>
                </div>
            ) : (
                <div className="vscode-panel">
                    <div className="overflow-x-auto">
                                        <table className="vscode-table min-w-full divide-y">
                                            <thead>
                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                                        Nome
                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                        Emails
                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                                        Criado
                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                                        Atualizado
                                    </th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--vscode-border)' }}>
                                {lists.map(list => (
                                    <tr key={list.id} className="vscode-item-hover">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-xs font-medium" style={{ color: 'var(--vscode-text)' }}>
                                                        {list.name}
                                                    </div>
                                                    {list.emails.length > 0 && (
                                                        <div className="text-xs mt-1 truncate max-w-xs opacity-70" style={{ color: 'var(--vscode-text-muted)' }}>
                                                            {list.emails.slice(0, 2).join(', ')}
                                                            {list.emails.length > 2 && ` +${list.emails.length - 2} mais`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{
                                                background: 'var(--vscode-accent)25',
                                                color: 'var(--vscode-accent)'
                                            }}>
                                                {list.emails.length.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {list.createdAt.toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-3 py-2 text-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {list.updatedAt.toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-medium">
                                            <div className="flex justify-end space-x-1">
                                                <button
                                                    onClick={() => handleEditList(list)}
                                                    className="vscode-button-icon"
                                                    title="Editar lista"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => deleteList(list.id)}
                                                    className="vscode-button-icon text-red-400 hover:text-red-300"
                                                    title="Excluir lista"
                                                >
                                                    <Trash2 className="h-3 w-3" />
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

            <EmailListModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveList}
                editingList={editingList}
            />

            <ImportEmailListModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportList}
            />

            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearAllLists}
                title="Confirmar Limpeza"
                message="Tem certeza que deseja zerar todas as listas de emails? Esta ação removerá todos os arquivos de lista e não pode ser desfeita."
                confirmText="Zerar Listas"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default EmailListsPage;
