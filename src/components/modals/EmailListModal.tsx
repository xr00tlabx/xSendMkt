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
            <div className="bg-[var(--vscode-surface)] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--vscode-border)]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[var(--vscode-text)]">
                        {editingList ? 'Edit Email List' : 'Create Email List'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--vscode-textSecondary)] hover:text-[var(--vscode-text)]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--vscode-text)] mb-2">
                            List Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Enter list name..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--vscode-text)] mb-2">
                            Email Addresses
                        </label>
                        <textarea
                            value={formData.emails}
                            onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
                            className="input-field h-64 resize-none"
                            placeholder="Enter email addresses, one per line..."
                            required
                        />
                        <p className="text-sm text-[var(--vscode-textSecondary)] mt-1">
                            Enter one email address per line. Invalid emails will be automatically filtered out.
                        </p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            {editingList ? 'Update List' : 'Create List'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailListModal;
