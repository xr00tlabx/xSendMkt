import { AlertCircle, CheckCircle, Edit, Plus, Server, Trash2 } from 'lucide-react';
import React from 'react';
import { useSmtpConfigs } from '../hooks';

const SmtpConfigPage: React.FC = () => {
    const { configs, loading, updateConfig } = useSmtpConfigs();

    const handleToggleActive = async (id: string, active: boolean) => {
        try {
            await updateConfig(id, { isActive: active });
        } catch (error) {
            console.error('Failed to update SMTP config:', error);
        }
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
                <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SMTP Server
                </button>
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
                        <button className="btn-primary">
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
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`} style={{
                                                background: config.secure ? 'var(--vscode-success)25' : 'var(--vscode-warning)25',
                                                color: config.secure ? 'var(--vscode-success)' : 'var(--vscode-warning)'
                                            }}>
                                                {config.secure ? 'TLS/SSL' : 'Plain'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                                            {config.username}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="vscode-button-icon"
                                                    title="Edit server"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="vscode-button-icon text-red-400 hover:text-red-300"
                                                    title="Delete server"
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
        </div>
    );
};

export default SmtpConfigPage;
