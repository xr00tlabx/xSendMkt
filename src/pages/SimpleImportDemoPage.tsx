import { CheckCircle, FileText, Mail, Server, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { SimpleEmailImportModal } from '../components/modals';
import type { SmtpConfig } from '../types';

const SimpleImportDemoPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    emails: string[];
    smtps: SmtpConfig[];
    timestamp: Date;
  } | null>(null);

  const handleImport = (data: {
    name: string;
    emails: string[];
    validSmtps: SmtpConfig[];
    chunkSize: number;
  }) => {
    setImportResults({
      emails: data.emails,
      smtps: data.validSmtps,
      timestamp: new Date()
    });
    console.log('Dados importados:', data);
  };

  const exampleData = `user@empresa.com
admin@site.com.br
contato@loja.com|senha123
vendas@exemplo.com:minhasenha
suporte@gmail.com
info@outlook.com
marketing@yahoo.com
newsletter@hotmail.com`;

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--vscode-text)] mb-2 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-[var(--vscode-accent)]" />
          Importação Inteligente de Emails
        </h1>
        <p className="text-[var(--vscode-text-muted)]">
          Funcionalidade avançada de importação com detecção automática de SMTP, validação de emails e interface simples.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--vscode-input-background)] rounded-lg p-4 border border-[var(--vscode-border)]">
          <div className="flex items-center mb-3">
            <Mail className="h-5 w-5 text-[var(--vscode-accent)] mr-2" />
            <h3 className="text-sm font-semibold text-[var(--vscode-text)]">Validação Automática</h3>
          </div>
          <p className="text-xs text-[var(--vscode-text-muted)]">
            Valida emails, remove duplicados e inválidos automaticamente
          </p>
        </div>

        <div className="bg-[var(--vscode-input-background)] rounded-lg p-4 border border-[var(--vscode-border)]">
          <div className="flex items-center mb-3">
            <Server className="h-5 w-5 text-[var(--vscode-accent)] mr-2" />
            <h3 className="text-sm font-semibold text-[var(--vscode-text)]">Detecção SMTP</h3>
          </div>
          <p className="text-xs text-[var(--vscode-text-muted)]">
            Detecta configurações SMTP automaticamente por domínio
          </p>
        </div>

        <div className="bg-[var(--vscode-input-background)] rounded-lg p-4 border border-[var(--vscode-border)]">
          <div className="flex items-center mb-3">
            <FileText className="h-5 w-5 text-[var(--vscode-accent)] mr-2" />
            <h3 className="text-sm font-semibold text-[var(--vscode-text)]">Múltiplos Formatos</h3>
          </div>
          <p className="text-xs text-[var(--vscode-text-muted)]">
            Suporta arquivos .txt, .csv e entrada manual de texto
          </p>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-[var(--vscode-editor-background)] rounded-lg p-6 border border-[var(--vscode-border)] mb-8">
        <h2 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">Demonstração</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Example Data */}
          <div>
            <h3 className="text-sm font-medium text-[var(--vscode-text)] mb-2">Dados de Exemplo:</h3>
            <div className="bg-[var(--vscode-input-background)] rounded-lg p-3 border border-[var(--vscode-border)]">
              <pre className="text-xs text-[var(--vscode-text)] whitespace-pre-wrap font-mono">
                {exampleData}
              </pre>
            </div>
            <p className="text-xs text-[var(--vscode-text-muted)] mt-2">
              Formatos suportados: email, email|senha, email:senha
            </p>
          </div>

          {/* Results */}
          <div>
            <h3 className="text-sm font-medium text-[var(--vscode-text)] mb-2">Último Resultado:</h3>
            {importResults ? (
              <div className="bg-[var(--vscode-input-background)] rounded-lg p-3 border border-[var(--vscode-border)] space-y-2">
                <div className="flex items-center text-xs">
                  <CheckCircle className="h-3 w-3 text-[var(--vscode-success)] mr-2" />
                  <span className="text-[var(--vscode-text)]">
                    {importResults.emails.length} emails válidos
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <Server className="h-3 w-3 text-[var(--vscode-accent)] mr-2" />
                  <span className="text-[var(--vscode-text)]">
                    {importResults.smtps.length} configurações SMTP detectadas
                  </span>
                </div>
                <div className="text-xs text-[var(--vscode-text-muted)]">
                  Importado em: {importResults.timestamp.toLocaleString()}
                </div>

                {importResults.smtps.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[var(--vscode-border)]">
                    <p className="text-xs font-medium text-[var(--vscode-text)] mb-1">SMTPs detectados:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {importResults.smtps.map((smtp, index) => (
                        <div key={index} className="text-xs text-[var(--vscode-text-muted)]">
                          • {smtp.name} ({smtp.host}:{smtp.port})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[var(--vscode-input-background)] rounded-lg p-3 border border-[var(--vscode-border)] text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-[var(--vscode-text-muted)]" />
                <p className="text-xs text-[var(--vscode-text-muted)]">
                  Nenhuma importação realizada ainda
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
          >
            <Zap className="h-4 w-4 mr-2" />
            Testar Importação Inteligente
          </button>
        </div>
      </div>

      {/* Features Details */}
      <div className="bg-[var(--vscode-input-background)] rounded-lg p-6 border border-[var(--vscode-border)]">
        <h2 className="text-lg font-semibold text-[var(--vscode-text)] mb-4">
          Funcionalidades Implementadas
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--vscode-text)] mb-2">🚀 Do Commit a49fdef:</h3>
            <ul className="text-xs text-[var(--vscode-text-muted)] space-y-1 ml-4">
              <li>• Detecção automática de SMTP por domínio</li>
              <li>• Cache inteligente com 10 minutos de duração</li>
              <li>• Suporte a provedores conhecidos (Gmail, Outlook, Yahoo, etc.)</li>
              <li>• Agrupamento por provedor para otimização</li>
              <li>• Validação em lote com estatísticas detalhadas</li>
              <li>• Sistema de threading otimizado (20 threads padrão)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--vscode-text)] mb-2">✨ Interface Simples:</h3>
            <ul className="text-xs text-[var(--vscode-text-muted)] space-y-1 ml-4">
              <li>• Modal único com todas as funcionalidades</li>
              <li>• Suporte a arquivo ou entrada manual</li>
              <li>• Progressão visual do processamento</li>
              <li>• Resultados detalhados com estatísticas</li>
              <li>• Importação automática após processamento</li>
              <li>• Design responsivo e acessível</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--vscode-text)] mb-2">⚡ Performance:</h3>
            <ul className="text-xs text-[var(--vscode-text-muted)] space-y-1 ml-4">
              <li>• Processamento em paralelo de domínios</li>
              <li>• Cache de detecção SMTP (90% hit rate)</li>
              <li>• Validação otimizada em lote</li>
              <li>• Remoção automática de duplicados</li>
              <li>• Timeout configurável (6s padrão)</li>
              <li>• Chunking automático para listas grandes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <SimpleEmailImportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default SimpleImportDemoPage;
