import { CheckCircle, Circle, FileText, Mail, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { EmailList } from '../../types';

interface EmailListSelectorProps {
    lists: EmailList[];
    selectedLists: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    showStats?: boolean;
}

const EmailListSelector: React.FC<EmailListSelectorProps> = ({
    lists,
    selectedLists,
    onSelectionChange,
    showStats = true
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLists, setFilteredLists] = useState<EmailList[]>([]);

    useEffect(() => {
        if (searchTerm.trim()) {
            setFilteredLists(
                lists.filter(list =>
                    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    list.emails.some(email => 
                        email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                )
            );
        } else {
            setFilteredLists(lists);
        }
    }, [lists, searchTerm]);

    const handleListToggle = (listId: string) => {
        const newSelection = selectedLists.includes(listId)
            ? selectedLists.filter(id => id !== listId)
            : [...selectedLists, listId];
        
        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedLists.length === filteredLists.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(filteredLists.map(list => list.id));
        }
    };

    const getTotalEmails = () => {
        const selectedListData = lists.filter(list => selectedLists.includes(list.id));
        const allEmails = selectedListData.flatMap(list => list.emails);
        const uniqueEmails = new Set(allEmails);
        return uniqueEmails.size;
    };

    const getSelectedCount = () => selectedLists.length;

    if (lists.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--vscode-text-muted)]">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma lista de email encontrada</p>
                <p className="text-sm">Importe ou crie uma lista primeiro</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Stats */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[var(--vscode-text)]">
                        Selecionar Listas de Email
                    </h3>
                    {showStats && (
                        <div className="flex items-center space-x-4 text-xs text-[var(--vscode-text-muted)]">
                            <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {getSelectedCount()} listas
                            </span>
                            <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {getTotalEmails()} emails únicos
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar listas..."
                        className="input-field flex-1"
                    />
                    <button
                        onClick={handleSelectAll}
                        className="btn-secondary text-xs px-3"
                    >
                        {selectedLists.length === filteredLists.length ? 'Desmarcar' : 'Selecionar'} Todas
                    </button>
                </div>
            </div>

            {/* Lists */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredLists.map((list) => {
                    const isSelected = selectedLists.includes(list.id);
                    
                    return (
                        <div
                            key={list.id}
                            onClick={() => handleListToggle(list.id)}
                            className={`
                                p-3 border rounded cursor-pointer transition-colors
                                ${isSelected 
                                    ? 'border-[var(--vscode-button-background)] bg-[var(--vscode-button-background)] bg-opacity-10' 
                                    : 'border-[var(--vscode-border)] hover:border-[var(--vscode-button-background)]'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {isSelected ? (
                                        <CheckCircle className="h-4 w-4 text-[var(--vscode-button-background)]" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-[var(--vscode-text-muted)]" />
                                    )}
                                    
                                    <div>
                                        <div className="font-medium text-[var(--vscode-text)]">
                                            {list.name}
                                        </div>
                                        <div className="text-xs text-[var(--vscode-text-muted)]">
                                            {list.emails.length} emails
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-[var(--vscode-text-muted)]">
                                    {list.createdAt && new Date(list.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Preview first few emails */}
                            {isSelected && list.emails.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-[var(--vscode-border)]">
                                    <div className="text-xs text-[var(--vscode-text-muted)]">
                                        Preview: {list.emails.slice(0, 3).join(', ')}
                                        {list.emails.length > 3 && `... +${list.emails.length - 3} mais`}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredLists.length === 0 && searchTerm && (
                <div className="text-center py-4 text-[var(--vscode-text-muted)]">
                    <p>Nenhuma lista encontrada para "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default EmailListSelector;
