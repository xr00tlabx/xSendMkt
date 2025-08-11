import { CheckCircle, Loader2, TestTube, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import type { SmtpTestResult } from '../types/electron';

const TestSmtpsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SmtpTestResult[]>([]);
    const [testEmail, setTestEmail] = useState('');

    const handleTestAllSmtps = async () => {
        setIsLoading(true);
        setResults([]);

        try {
            const testResults = await window.electronAPI.email.testAllSmtps();
            setResults(testResults);
        } catch (error) {
            console.error('Erro ao testar SMTPs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTestEmail = async (smtpId: number) => {
        if (!testEmail) {
            alert('Por favor, informe um email para teste');
            return;
        }

        try {
            const result = await window.electronAPI.email.sendTest(smtpId, testEmail);
            alert(`Email de teste enviado com sucesso!\nMessage ID: ${result.messageId}`);
        } catch (error) {
            alert(`Erro ao enviar email de teste: ${error}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <TestTube className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Testar SMTPs</h1>
                    </div>

                    <div className="space-y-6">
                        {/* Teste de Conectividade */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Teste de Conectividade
                            </h2>

                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={handleTestAllSmtps}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <TestTube className="h-4 w-4" />
                                    )}
                                    {isLoading ? 'Testando...' : 'Testar Todos os SMTPs'}
                                </button>
                            </div>

                            {results.length > 0 && (
                                <div className="space-y-2">
                                    {results.map((result) => (
                                        <div
                                            key={result.id}
                                            className={`p-3 rounded-md border ${result.success
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {result.success ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <span className="font-medium">{result.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {result.message}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Teste de Envio */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Teste de Envio
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email para Teste
                                    </label>
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="seuemail@exemplo.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {results.filter(r => r.success).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                                            SMTPs Funcionais
                                        </h3>
                                        <div className="space-y-2">
                                            {results
                                                .filter(r => r.success)
                                                .map((result) => (
                                                    <div
                                                        key={result.id}
                                                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                                    >
                                                        <span className="font-medium">{result.name}</span>
                                                        <button
                                                            onClick={() => handleSendTestEmail(result.id!)}
                                                            disabled={!testEmail}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            Enviar Teste
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => window.close?.()}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestSmtpsPage;
