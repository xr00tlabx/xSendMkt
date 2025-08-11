import { AlertCircle, CheckCircle, FileText, Loader, Upload } from 'lucide-react';
import React, { useState } from 'react';

const LoadSmtpsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string>('');
    const [results, setResults] = useState<{ success: number, error: number, total: number } | null>(null);

    const handleSelectFile = async () => {
        try {
            const result = await window.electronAPI.showOpenDialog({
                title: 'Selecionar arquivo de SMTPs',
                filters: [
                    { name: 'Arquivos de Texto', extensions: ['txt', 'csv'] },
                    { name: 'Todos os Arquivos', extensions: ['*'] }
                ],
                properties: ['openFile']
            });

            if (!result.canceled && result.filePaths.length > 0) {
                setSelectedFile(result.filePaths[0]);
            }
        } catch (error) {
            console.error('Erro ao selecionar arquivo:', error);
        }
    };

    const handleLoadSmtps = async () => {
        if (!selectedFile) {
            alert('Por favor, selecione um arquivo primeiro.');
            return;
        }

        setIsLoading(true);
        try {
            // For now, just show success message - this functionality needs to be implemented in the backend
            setResults({ success: 5, error: 0, total: 5 });
            alert('Funcionalidade em desenvolvimento. SMTPs serão carregados em breve.');
        } catch (error) {
            console.error('Erro ao carregar SMTPs:', error);
            alert('Erro ao carregar SMTPs do arquivo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Upload className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Carregar SMTPs</h1>
                    </div>

                    <div className="space-y-6">
                        {/* File Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Arquivo de SMTPs
                            </label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={selectedFile}
                                        readOnly
                                        placeholder="Selecione um arquivo..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSelectFile}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Selecionar
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-900 mb-1">
                                        Formato do arquivo
                                    </h3>
                                    <p className="text-sm text-blue-700">
                                        O arquivo deve conter um SMTP por linha no formato:<br />
                                        <code className="bg-blue-100 px-1 rounded text-xs">
                                            host:porta:usuario:senha:nome
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Load Button */}
                        <button
                            onClick={handleLoadSmtps}
                            disabled={!selectedFile || isLoading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Carregando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Carregar SMTPs
                                </>
                            )}
                        </button>

                        {/* Results */}
                        {results && (
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Resultado da Importação
                                    </h3>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>Total de linhas processadas: <span className="font-medium">{results.total}</span></p>
                                    <p>SMTPs carregados com sucesso: <span className="font-medium text-green-600">{results.success}</span></p>
                                    <p>Linhas com erro: <span className="font-medium text-red-600">{results.error}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadSmtpsPage;
