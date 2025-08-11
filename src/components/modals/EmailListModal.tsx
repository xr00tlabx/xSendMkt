import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { EmailList } from '../../types';

interface EmailListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<EmailList>) => void;
    editingList?: EmailList | null;
}

const EmailListModal: React.FC<EmailListModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingList
}) => {
    const [formData, setFormData] = useState({
        name: '',
        emails: ''
    });

    useEffect(() => {
        if (editingList) {
            setFormData({
                name: editingList.name,
                emails: editingList.emails.join('\n')
            });
        } else {
            setFormData({ name: '', emails: '' });
        }
    }, [editingList]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const emailList = formData.emails
            .split('\n')
            .map(email => email.trim())
            .filter(email => email && email.includes('@'));

        onSave({
            name: formData.name,
            emails: emailList
        });

        setFormData({ name: '', emails: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="vscode-panel vscode-modal-compact rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--vscode-border)]">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[var(--vscode-text)]">
                        {editingList ? 'Editar Lista de Email' : 'Criar Lista de Email'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="vscode-button-icon"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-[var(--vscode-text)] mb-1">
                            Nome da Lista
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Digite o nome da lista..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--vscode-text)] mb-1">
                            Endereços de Email
                        </label>
                        <textarea
                            value={formData.emails}
                            onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                            className="textarea-field h-32"
                            placeholder="Digite os endereços de email, um por linha..."
                            required
                        />
                        <p className="text-xs text-[var(--vscode-text-muted)] mt-1">
                            Digite um endereço de email por linha. Emails inválidos serão filtrados automaticamente.
                        </p>
                    </div>

                    <div className="flex space-x-2 pt-3">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            {editingList ? 'Atualizar Lista' : 'Criar Lista'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailListModal;
