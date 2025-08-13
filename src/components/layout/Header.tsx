import React, { useEffect, useState } from 'react';
import { notifyEmailListsUpdate } from '../../hooks';
import type { AppSettings } from '../../types';
import { ConfirmModal, SettingsModal } from '../modals';

const Header: React.FC = () => {
    const [showClearListsModal, setShowClearListsModal] = useState(false);
    const [showClearSmtpsModal, setShowClearSmtpsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    useEffect(() => {
        // Listen to Electron menu events
        const handleMenuEvents = () => {
            // Check if we're in Electron environment
            if (typeof window !== 'undefined' && window.electronAPI) {
                console.log('Setting up Electron menu listeners...');

                window.electronAPI.on('menu-clear-lists', () => {
                    console.log('Menu clear lists triggered');
                    setShowClearListsModal(true);
                });

                window.electronAPI.on('menu-clear-smtps', () => {
                    console.log('Menu clear smtps triggered');
                    setShowClearSmtpsModal(true);
                });

                window.electronAPI.on('menu-open-settings', () => {
                    console.log('Menu settings triggered');
                    setShowSettingsModal(true);
                });
            } else {
                console.log('ElectronAPI not available, retrying in 100ms...');
                setTimeout(handleMenuEvents, 100);
            }
        };

        handleMenuEvents();

        // Cleanup listeners on unmount
        return () => {
            if (typeof window !== 'undefined' && window.electronAPI) {
                window.electronAPI.removeAllListeners('menu-clear-lists');
                window.electronAPI.removeAllListeners('menu-clear-smtps');
                window.electronAPI.removeAllListeners('menu-open-settings');
            }
        };
    }, []);

    const handleClearLists = async () => {
        try {
            // Limpar listas do localStorage
            localStorage.removeItem('emailLists');

            // Limpar arquivos físicos via Electron
            const success = await window.electronAPI?.files?.clearAllLists();

            if (success) {
                console.log('Todas as listas foram zeradas com sucesso');
                setShowClearListsModal(false);
                // Notificar outros componentes sobre a atualização
                notifyEmailListsUpdate();
                window.location.reload();
            } else {
                throw new Error('Falha ao limpar arquivos de listas');
            }
        } catch (error) {
            console.error('Erro ao zerar listas:', error);
            alert(`Erro ao zerar listas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            setShowClearListsModal(false);
        }
    };

    const handleClearSmtps = () => {
        localStorage.removeItem('smtpConfigs');
        setShowClearSmtpsModal(false);
        window.location.reload();
    };

    const handleSaveSettings = (settings: AppSettings) => {
        // Settings are already saved in the modal
        console.log('Settings saved:', settings);
    };

    return (
        <>
            <header className="vscode-panel border-b" style={{ borderBottomColor: 'var(--vscode-border)' }}>
                {/* You can add header content here if needed */}
            </header>

            {/* Modals */}
            <ConfirmModal
                isOpen={showClearListsModal}
                onClose={() => setShowClearListsModal(false)}
                onConfirm={handleClearLists}
                title="Confirmar Limpeza"
                message="Tem certeza que deseja zerar todas as listas de emails? Esta ação não pode ser desfeita."
                confirmText="Zerar Listas"
                cancelText="Cancelar"
                variant="danger"
            />

            <ConfirmModal
                isOpen={showClearSmtpsModal}
                onClose={() => setShowClearSmtpsModal(false)}
                onConfirm={handleClearSmtps}
                title="Confirmar Limpeza"
                message="Tem certeza que deseja zerar todos os SMTPs? Esta ação não pode ser desfeita."
                confirmText="Zerar SMTPs"
                cancelText="Cancelar"
                variant="danger"
            />

            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                onSave={handleSaveSettings}
            />
        </>
    );
};

export default Header;
