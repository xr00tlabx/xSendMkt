import { AlertTriangle, CheckCircle, FileText, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import EmailValidator from '../forms/EmailValidator';

interface ImportEmailListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: { name: string; emails: string[]; chunkSize: number }) => void;
}

interface ImportStats {
    totalEmails: number;
    validEmails: number;
    invalidEmails: number;
    duplicatesRemoved: number;
    finalCount: number;
}

const ImportEmailListModal: React.FC<ImportEmailListModalProps> = ({
    isOpen,
    onClose,
    onImport
}) => {
    const [formData, setFormData] = useState({
        name: '',
        chunkSize: 5000
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<ImportStats | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (500MB = 500 * 1024 * 1024 bytes)
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('Arquivo muito grande! O tamanho máximo é 500MB.');
                return;
            }

            setSelectedFile(file);
            // Auto-generate name from file if not set
            if (!formData.name) {
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                setFormData(prev => ({ ...prev, name: nameWithoutExt }));
            }
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    const processEmailFile = async (file: File): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split('\n');
                    const totalLines = lines.length;

                    const validEmails: string[] = [];
                    const emailSet = new Set<string>(); // For duplicate checking
                    let invalidCount = 0;
                    let duplicateCount = 0;

                    lines.forEach((line, index) => {
                        // Update progress
                        const currentProgress = Math.round((index / totalLines) * 100);
                        if (currentProgress !== progress) {
                            setProgress(currentProgress);
                        }

                        const email = line.trim();

                        if (email) {
                            if (validateEmail(email)) {
                                const lowerEmail = email.toLowerCase();
                                if (!emailSet.has(lowerEmail)) {
                                    emailSet.add(lowerEmail);
                                    validEmails.push(email);
                                } else {
                                    duplicateCount++;
                                }
                            } else {
                                invalidCount++;
                            }
                        }
                    });

                    setStats({
                        totalEmails: totalLines,
                        validEmails: validEmails.length + duplicateCount,
                        invalidEmails: invalidCount,
                        duplicatesRemoved: duplicateCount,
                        finalCount: validEmails.length
                    });

                    resolve(validEmails);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    };

    const handleImport = async () => {
        if (!selectedFile || !formData.name) {
            alert('Por favor, selecione um arquivo e defina um nome para a lista.');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setStats(null);

        try {
            const emails = await processEmailFile(selectedFile);

            // Simulate processing time for UX
            await new Promise(resolve => setTimeout(resolve, 500));

            onImport({
                name: formData.name,
                emails,
                chunkSize: formData.chunkSize
            });

            // Reset form
            setFormData({ name: '', chunkSize: 5000 });
            setSelectedFile(null);
            setIsProcessing(false);
            setProgress(0);
            setStats(null);
            onClose();
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar arquivo. Verifique se é um arquivo de texto válido.');
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleClose = () => {
        if (!isProcessing) {
            setFormData({ name: '', chunkSize: 5000 });
            setSelectedFile(null);
            setProgress(0);
            setStats(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="vscode-panel vscode-modal-compact rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--vscode-border)]">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[var(--vscode-text)] flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Lista de Emails
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="vscode-button-icon"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Nome da Lista */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--vscode-text)] mb-1">
                            Nome da Lista
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="Digite o nome da lista..."
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Quantidade por Linha */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--vscode-text)] mb-1">
                            Emails por Arquivo (Divisão automática)
                        </label>
                        <input
                            type="number"
                            value={formData.chunkSize}
                            onChange={(e) => setFormData({ ...formData, chunkSize: parseInt(e.target.value) || 5000 })}
                            className="input-field"
                            min="100"
                            max="50000"
                            disabled={isProcessing}
                        />
                        <p className="text-xs text-[var(--vscode-text-muted)] mt-1">
                            Se a lista tiver mais emails que este limite, será dividida automaticamente em múltiplos arquivos numerados (ex: lista1.txt, lista2.txt, lista3.txt...)
                        </p>
                    </div>

                    {/* Seleção de Arquivo */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--vscode-text)] mb-1">
                            Arquivo de Emails
                        </label>
                        <div className="space-y-2">
                            <div
                                className={`
                                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                                    ${selectedFile
                                        ? 'border-[var(--vscode-accent)] bg-[var(--vscode-accent)]10'
                                        : 'border-[var(--vscode-border)] hover:border-[var(--vscode-accent)]'
                                    }
                                    ${isProcessing ? 'pointer-events-none opacity-50' : ''}
                                `}
                                onClick={() => !isProcessing && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".txt,.csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    disabled={isProcessing}
                                />

                                {selectedFile ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <FileText className="h-5 w-5 text-[var(--vscode-accent)]" />
                                        <span className="text-sm font-medium text-[var(--vscode-text)]">
                                            {selectedFile.name}
                                        </span>
                                        <span className="text-xs text-[var(--vscode-text-muted)]">
                                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--vscode-text-muted)]" />
                                        <p className="text-sm text-[var(--vscode-text)]">
                                            Clique para selecionar arquivo
                                        </p>
                                        <p className="text-xs text-[var(--vscode-text-muted)] mt-1">
                                            Formatos aceitos: .txt, .csv (máximo 500MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Progresso */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--vscode-text)]">Processando arquivo...</span>
                                <span className="text-[var(--vscode-text-muted)]">{progress}%</span>
                            </div>
                            <div className="w-full bg-[var(--vscode-input-bg)] rounded-full h-2">
                                <div
                                    className="bg-[var(--vscode-accent)] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Estatísticas */}
                    {stats && !isProcessing && (
                        <div className="bg-[var(--vscode-input-bg)] rounded-lg p-3 space-y-2">
                            <h4 className="text-sm font-medium text-[var(--vscode-text)] flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-[var(--vscode-success)]" />
                                Resultados do Processamento
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[var(--vscode-text-muted)]">Total de linhas:</span>
                                    <span className="text-[var(--vscode-text)]">{stats.totalEmails.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--vscode-text-muted)]">Emails válidos:</span>
                                    <span className="text-[var(--vscode-success)]">{stats.validEmails.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--vscode-text-muted)]">Emails inválidos:</span>
                                    <span className="text-[var(--vscode-error)]">{stats.invalidEmails.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--vscode-text-muted)]">Duplicados removidos:</span>
                                    <span className="text-[var(--vscode-warning)]">{stats.duplicatesRemoved.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between col-span-2 pt-1 border-t border-[var(--vscode-border)]">
                                    <span className="text-[var(--vscode-text)] font-medium">Total final:</span>
                                    <span className="text-[var(--vscode-accent)] font-medium">{stats.finalCount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Prévia da divisão */}
                            {stats.finalCount > formData.chunkSize && (
                                <div className="mt-3 pt-2 border-t border-[var(--vscode-border)]">
                                    <h5 className="text-xs font-medium text-[var(--vscode-text)] mb-2">Divisão dos Arquivos:</h5>
                                    <div className="text-xs text-[var(--vscode-text-muted)]">
                                        {Math.ceil(stats.finalCount / formData.chunkSize)} arquivos serão criados:
                                        <div className="mt-1 space-y-1">
                                            {Array.from({ length: Math.ceil(stats.finalCount / formData.chunkSize) }, (_, i) => {
                                                const start = i * formData.chunkSize;
                                                const end = Math.min(start + formData.chunkSize, stats.finalCount);
                                                const count = end - start;
                                                return (
                                                    <div key={i} className="flex justify-between">
                                                        <span className="text-[var(--vscode-accent)]">{formData.name}{i + 1}.txt</span>
                                                        <span>{count.toLocaleString()} emails</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aviso sobre arquivos grandes */}
                    {selectedFile && selectedFile.size > 50 * 1024 * 1024 && (
                        <div className="bg-[var(--vscode-warning)]20 border border-[var(--vscode-warning)] rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-[var(--vscode-warning)] mt-0.5" />
                                <div className="text-xs">
                                    <p className="text-[var(--vscode-text)] font-medium">Arquivo Grande Detectado</p>
                                    <p className="text-[var(--vscode-text-muted)] mt-1">
                                        O processamento pode demorar alguns minutos. Por favor, aguarde.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex space-x-2 pt-2">
                        <button
                            onClick={handleImport}
                            disabled={!selectedFile || !formData.name || isProcessing}
                            className="btn-primary flex-1 flex items-center justify-center"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Importar Lista
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            className="btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportEmailListModal;
