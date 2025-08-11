import { Code } from 'lucide-react';
import React from 'react';
import { apiConfig, toggleMockApi } from '../../services/apiConfig';

const Header: React.FC = () => {
    const handleToggleMock = () => {
        toggleMockApi(!apiConfig.useMock);
        window.location.reload(); // Reload to apply changes
    };

    return (
        <header className="vscode-panel border-b" style={{ borderBottomColor: 'var(--vscode-border)' }}>
            <div className="px-6">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-md" style={{ background: 'var(--vscode-accent)' }}>
                            <Code className="h-5 w-5 text-white" />
                        </div>
                        <span className="ml-3 text-lg font-semibold" style={{ color: 'var(--vscode-text)' }}>
                            xSendMkt
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 rounded-md" style={{
                            background: 'var(--vscode-input-bg)',
                            color: 'var(--vscode-text-muted)'
                        }}>
                            Email Marketing
                        </span>
                    </div>

                    {/* API Mode Toggle */}
                    <div className="flex items-center space-x-3">
                        <span className="text-sm" style={{ color: 'var(--vscode-text-muted)' }}>
                            API Mode:
                        </span>
                        <button
                            onClick={handleToggleMock}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${apiConfig.useMock
                                ? 'border-yellow-500/30 text-yellow-400'
                                : 'border-green-500/30 text-green-400'
                                }`}
                            style={{
                                background: apiConfig.useMock
                                    ? 'rgba(255, 204, 2, 0.1)'
                                    : 'rgba(78, 201, 176, 0.1)'
                            }}
                        >
                            {apiConfig.useMock ? '🧪 Mock' : '🚀 Live'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
