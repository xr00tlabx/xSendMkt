import { AlertTriangle, X } from 'lucide-react';
import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
}) => {
    if (!isOpen) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-[var(--vscode-symbolIcon-operatorDefault)]" />,
                    confirmButton: 'btn-danger'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-[var(--vscode-symbolIcon-functionDefault)]" />,
                    confirmButton: 'bg-[var(--vscode-symbolIcon-functionDefault)] hover:bg-[var(--vscode-hover)] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
                };
            default:
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-[var(--vscode-symbolIcon-numberDefault)]" />,
                    confirmButton: 'btn-primary'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--vscode-surface)] rounded-lg p-6 w-full max-w-md border border-[var(--vscode-border)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {styles.icon}
                        <h2 className="text-lg font-semibold text-[var(--vscode-text)]">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--vscode-textSecondary)] hover:text-[var(--vscode-text)]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-[var(--vscode-text)] mb-6">{message}</p>

                <div className="flex space-x-3">
                    <button
                        onClick={onConfirm}
                        className={styles.confirmButton + ' flex-1'}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
