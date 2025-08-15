import React from 'react';

export const InterfaceDemo: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#1e1e1e] text-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                        🚀 xSendMkt - Nova Interface VS Code Style
                    </h1>
                    <p className="text-lg text-gray-300">
                        Interface redesenhada com inspiração profissional para campanhas de email marketing
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                    {/* Feature Card 1 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-blue-400 text-2xl mb-3">🎨</div>
                        <h3 className="text-lg font-semibold mb-2">Design VS Code</h3>
                        <p className="text-gray-400 text-sm">
                            Interface dark profissional inspirada no Visual Studio Code com layout responsivo e cores temáticas.
                        </p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-green-400 text-2xl mb-3">🔄</div>
                        <h3 className="text-lg font-semibold mb-2">Envio Sequencial</h3>
                        <p className="text-gray-400 text-sm">
                            Processamento automático de listas sequenciais com auto-progressão e limpeza de arquivos.
                        </p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-yellow-400 text-2xl mb-3">🖥️</div>
                        <h3 className="text-lg font-semibold mb-2">Terminal Hacker</h3>
                        <p className="text-gray-400 text-sm">
                            Logs em tempo real com estilo terminal dark hacker, formatação profissional e auto-scroll.
                        </p>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-purple-400 text-2xl mb-3">📊</div>
                        <h3 className="text-lg font-semibold mb-2">Estatísticas Globais</h3>
                        <p className="text-gray-400 text-sm">
                            Painéis informativos com progresso global, status SMTP e estatísticas detalhadas.
                        </p>
                    </div>

                    {/* Feature Card 5 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-cyan-400 text-2xl mb-3">📋</div>
                        <h3 className="text-lg font-semibold mb-2">Gestão de Listas</h3>
                        <p className="text-gray-400 text-sm">
                            Visualização hierárquica com indicadores de status, contadores e ordenação sequencial.
                        </p>
                    </div>

                    {/* Feature Card 6 */}
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <div className="text-red-400 text-2xl mb-3">🎛️</div>
                        <h3 className="text-lg font-semibold mb-2">Controles Inteligentes</h3>
                        <p className="text-gray-400 text-sm">
                            Botões que se adaptam ao estado atual com validação e controles de fluxo completos.
                        </p>
                    </div>
                </div>

                {/* Demo Interface Preview */}
                <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42] mb-8">
                    <h2 className="text-xl font-semibold mb-4">Preview da Interface</h2>
                    <div className="bg-black/50 p-4 rounded-lg">
                        <div className="text-green-400 font-mono text-sm space-y-1">
                            <div>[00:19:54.123] [INFO] xSendMkt Terminal v2.0.0 initialized</div>
                            <div>[00:19:54.124] [INFO] Ready for email sending operations...</div>
                            <div>[00:19:54.125] [WARNING] Awaiting campaign start...</div>
                            <div>[00:19:55.200] [INFO] 🚀 Iniciando envio sequencial para 3 listas (1250 emails total)</div>
                            <div>[00:19:55.201] [INFO] Iniciando processamento da lista: Newsletter-2024.txt (450 emails)</div>
                            <div>[00:19:56.350] [SUCCESS] Email enviado com sucesso via Custom SMTP → user@example.com</div>
                            <div>[00:19:56.380] [SUCCESS] Email enviado com sucesso via Gmail SMTP → contact@domain.com</div>
                            <div>[00:19:56.420] [ERROR] Falha no envio via Outlook SMTP → invalid@email.com</div>
                            <div className="text-blue-400">[00:19:56.450] [INFO] PROCESSING: <span className="text-green-400">newsletter@company.com</span></div>
                            <div className="text-green-400 animate-pulse">▊ Processing...</div>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <h3 className="text-lg font-semibold mb-4">Funcionalidades Técnicas</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Hook useSequentialEmailSender para gerenciamento de estado</li>
                            <li>• Componentes reutilizáveis (HackerTerminal, GlobalStatsPanel)</li>
                            <li>• Integração com API Electron para backend</li>
                            <li>• Processamento assíncrono não-bloqueante</li>
                            <li>• Tratamento robusto de erros</li>
                            <li>• Estatísticas em tempo real com cálculo de ETA</li>
                        </ul>
                    </div>

                    <div className="bg-[#2d2d30] p-6 rounded-lg border border-[#3e3e42]">
                        <h3 className="text-lg font-semibold mb-4">Benefícios da Nova Interface</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• Visual moderno e profissional</li>
                            <li>• Workflow otimizado para campanhas</li>
                            <li>• Visibilidade completa do processo</li>
                            <li>• Gestão total do envio sequencial</li>
                            <li>• UX inspirada em ferramentas profissionais</li>
                            <li>• Transparência e controle total</li>
                        </ul>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-8">
                    <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 p-8 rounded-lg border border-blue-500/30">
                        <h3 className="text-2xl font-bold mb-4">Pronto para Usar!</h3>
                        <p className="text-gray-300 mb-6">
                            A nova interface está ativa e pronta para suas campanhas de email marketing.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Interface Ativa</span>
                            </div>
                            <div className="text-gray-500">|</div>
                            <div className="flex items-center gap-2 text-blue-400">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-sm font-medium">Sistema Operacional</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterfaceDemo;
