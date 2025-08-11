import { Edit, FileText, Mail, Plus, Settings, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import EmailListModal from '../components/modals/EmailListModal';
import { useEmailLists, useTxtFileCheck } from '../hooks';
import type { EmailList } from '../types';

const EmailListsPage: React.FC = () => {
    const { lists, loading, createList, updateList, deleteList } = useEmailLists();
    const { txtFileStatus, loading: checkingFiles, checkTxtFiles } = useTxtFileCheck();
    const [showModal, setShowModal] = useState(false);
    const [editingList, setEditingList] = useState<EmailList | null>(null);

    const handleSaveList = (data: Partial<EmailList>) => {
        if (editingList) {
            updateList(editingList.id, data);
        } else if (data.name && data.emails) {
            createList({ name: data.name, emails: data.emails });
        }
        setEditingList(null);
    };

    const handleEditList = (list: EmailList) => {
        setEditingList(list);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingList(null);
    };

    return (
        <div className="flex-1 p-6 vscode-page">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--vscode-text)' }}>
                        📧 Email Lists
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--vscode-text-muted)' }}>
                        Manage your email lists and recipients
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New List
                </button>
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
                        <div className="space-y-3">
                            <button
                                onClick={checkTxtFiles}
                                className="btn-primary"
                            >
                                Atualizar
                            </button>
                            <p className="text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                Coloque arquivos .txt no diretório configurado e clique em atualizar
                            </p>
                        </div>
                    </div>
                </div>
            ) : lists.length === 0 ? (
                <div className="vscode-panel">
                    <div className="text-center py-12">
                        <Mail className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--vscode-text-muted)' }} />
                        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--vscode-text)' }}>No email lists yet</h3>
                        <p className="mb-6" style={{ color: 'var(--vscode-text-muted)' }}>Get started by creating your first email list</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Email List
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
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Emails
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Updated
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--vscode-text-muted)' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--vscode-border)' }}>
                                {lists.map(list => (
                                    <tr key={list.id} className="vscode-item-hover">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: 'var(--vscode-text)' }}>
                                                        {list.name}
                                                    </div>
                                                    {list.emails.length > 0 && (
                                                        <div className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--vscode-text-muted)' }}>
                                                            {list.emails.slice(0, 2).join(', ')}
                                                            {list.emails.length > 2 && ` +${list.emails.length - 2} more`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                                                background: 'var(--vscode-accent)25',
                                                color: 'var(--vscode-accent)'
                                            }}>
                                                {list.emails.length}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {list.createdAt.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {list.updatedAt.toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditList(list)}
                                                    className="vscode-button-icon"
                                                    title="Edit list"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteList(list.id)}
                                                    className="vscode-button-icon text-red-400 hover:text-red-300"
                                                    title="Delete list"
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

            <EmailListModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSave={handleSaveList}
                editingList={editingList}
            />
        </div>
    );
};

export default EmailListsPage;
