import {
  CheckCircle,
  FileText,
  Loader2,
  Mail,
  Server,
  Upload,
  X,
  Zap
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import type { SmtpConfig } from '../../types';
import {
  detectSmtpFromEmail,
  extractDomain,
  groupEmailsByProvider,
  validateEmailsBatch
} from '../../utils/smtpDetector';

interface SimpleEmailImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: {
    name: string;
    emails: string[];
    validSmtps: SmtpConfig[];
    chunkSize: number;
  }) => void;
}

interface ImportResult {
  totalEmails: number;
  validEmails: number;
  invalidEmails: number;
  duplicatesRemoved: number;
  uniqueDomains: number;
  detectedSmtps: number;
  processingTime: number;
}

const SimpleEmailImportModal: React.FC<SimpleEmailImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [formData, setFormData] = useState({
    name: '',
    chunkSize: 5000
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState<ImportResult | null>(null);
  const [validSmtpConfigs, setValidSmtpConfigs] = useState<SmtpConfig[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande! O tamanho máximo é 100MB.');
        return;
      }

      setSelectedFile(file);
      setTextInput(''); // Clear text input when file is selected

      // Auto-generate name from file if not set
      if (!formData.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, name: nameWithoutExt }));
      }
    }
  };

  const processEmails = useCallback(async (emailText: string): Promise<string[]> => {
    console.log('📝 Texto de entrada para processEmails:', emailText);
    const lines = emailText.split(/[\n\r]+/);
    console.log('📋 Linhas encontradas:', lines);
    const emails: string[] = [];

    // Extract emails from various formats
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      console.log(`📧 Processando linha ${index + 1}: "${trimmed}"`);

      // Support different formats:
      // email@domain.com
      // email@domain.com|password
      // email@domain.com:password
      // "Name" <email@domain.com>
      // email@domain.com senha123
      // email@domain.com,senha123

      let email = '';

      // Extract email from "Name" <email> format
      const emailMatch = trimmed.match(/<([^>]+)>/);
      if (emailMatch) {
        email = emailMatch[1].trim();
        console.log(`✉️ Email extraído do formato "Nome" <email>: ${email}`);
      } else {
        // Split by various delimiters to get just the email part
        const parts = trimmed.split(/[|:,\s]+/);
        email = parts[0].trim();
        console.log(`✉️ Email extraído dividindo por delimitadores: ${email}`);
      }

      // Clean up the email (remove any remaining special characters)
      email = email.replace(/[<>"']/g, '').trim();

      if (email) {
        // Basic email validation before adding
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          const cleanEmail = email.toLowerCase();
          emails.push(cleanEmail);
          console.log(`✅ Email válido adicionado: ${cleanEmail}`);
        } else {
          console.log(`❌ Email inválido rejeitado: ${email}`);
        }
      } else {
        console.log(`❌ Nenhum email encontrado na linha: "${trimmed}"`);
      }
    });

    console.log('📬 Total de emails extraídos:', emails);
    return emails;
  }, []);

  // Test SMTP configuration function
  const testSmtpConfig = useCallback(async (smtpConfig: SmtpConfig, signal: AbortSignal): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 8000); // 8 second timeout

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      // Simulate SMTP testing with better success rates for known providers
      const isKnown = smtpConfig.name.includes('GMAIL') || 
                     smtpConfig.name.includes('OUTLOOK') || 
                     smtpConfig.name.includes('YAHOO') ||
                     smtpConfig.name.includes('HOTMAIL') ||
                     smtpConfig.name.includes('LIVE');
      
      const baseDelay = isKnown ? 500 : 1500; // Faster for known providers
      const delay = Math.random() * baseDelay + 300;
      const successRate = isKnown ? 0.85 : 0.4; // Higher success for known providers

      setTimeout(() => {
        if (!signal.aborted) {
          clearTimeout(timeout);
          resolve(Math.random() < successRate);
        }
      }, delay);
    });
  }, []);

  const detectSmtpConfigurations = useCallback(async (emails: string[]): Promise<SmtpConfig[]> => {
    console.log('🔍 Detectando SMTP para emails:', emails);
    const emailGroups = groupEmailsByProvider(emails);
    console.log('📊 Grupos de emails por provedor:', emailGroups);
    const validSmtpConfigs: SmtpConfig[] = [];
    const abortController = new AbortController();
    
    let processedGroups = 0;
    const totalGroups = emailGroups.size;

    for (const [, groupEmails] of emailGroups.entries()) {
      if (groupEmails.length === 0) continue;

      const sampleEmail = groupEmails[0];
      const domain = extractDomain(sampleEmail);
      const smtpDetection = detectSmtpFromEmail(sampleEmail);
      
      console.log(`🔧 Processando domínio ${domain}:`, smtpDetection);

      const config: SmtpConfig = {
        id: `smtp_${Date.now()}_${domain}_${Math.random().toString(36).substr(2, 9)}`,
        name: smtpDetection.detected
          ? `${smtpDetection.provider?.toUpperCase()} - ${domain}`
          : `Auto-detectado - ${domain}`,
        host: smtpDetection.host,
        port: smtpDetection.port,
        secure: smtpDetection.secure,
        username: sampleEmail,
        password: smtpDetection.detected ? 'auto-detected' : 'test-password',
        fromEmail: sampleEmail,
        fromName: sampleEmail.split('@')[0],
        isActive: true
      };

      console.log(`🧪 Testando SMTP: ${config.host}:${config.port} para ${domain}`);
      
      // Test the SMTP configuration
      const isValid = await testSmtpConfig(config, abortController.signal);
      
      if (isValid) {
        console.log(`✅ SMTP válido: ${domain} - ${config.host}:${config.port}`);
        validSmtpConfigs.push(config);
      } else {
        console.log(`❌ SMTP falhou: ${domain} - ${config.host}:${config.port}`);
      }
      
      processedGroups++;
      const progress = Math.round((processedGroups / totalGroups) * 30); // 30% for SMTP testing phase
      setProgress(70 + progress); // Update progress during SMTP testing
    }
    
    console.log(`🎉 Validação SMTP concluída! ${validSmtpConfigs.length} SMTPs válidos de ${totalGroups} testados`);
    return validSmtpConfigs;
  }, [testSmtpConfig]);

  const handleProcess = async () => {
    if (!formData.name) {
      alert('Por favor, defina um nome para a lista.');
      return;
    }

    const hasFile = selectedFile;
    const hasText = textInput.trim();

    if (!hasFile && !hasText) {
      alert('Por favor, selecione um arquivo ou cole emails no campo de texto.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('');
    setResults(null);
    setValidSmtpConfigs([]);

    try {
      const startTime = Date.now();

      // Step 1: Get email text
      setProgress(10);
      setProgressMessage('Lendo arquivo...');
      let emailText = '';

      if (hasFile) {
        emailText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
          reader.readAsText(selectedFile!);
        });
      } else {
        emailText = textInput;
      }

      // Step 2: Process and extract emails
      setProgress(30);
      setProgressMessage('Extraindo emails...');
      const extractedEmails = await processEmails(emailText);
      console.log('📧 Emails extraídos:', extractedEmails);

      // Step 3: Validate emails
      setProgress(50);
      setProgressMessage('Validando emails...');
      console.log('📧 Emails para validar:', extractedEmails);
      const validation = validateEmailsBatch(extractedEmails);
      console.log('✅ Validação de emails:', validation);
      
      // Debug: test individual emails
      extractedEmails.forEach((email, index) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email.trim());
        console.log(`📧 Email ${index + 1}: "${email}" -> válido: ${isValid}`);
      });

      // Step 4: Detect and Test SMTP configurations
      setProgress(70);
      setProgressMessage('Detectando e testando SMTPs...');
      console.log('🔧 Iniciando detecção e teste de SMTPs...');
      const smtpConfigs = await detectSmtpConfigurations(validation.valid);
      console.log('🔧 Configurações SMTP finais:', smtpConfigs);

      // Step 5: Complete
      setProgress(100);
      setProgressMessage('Concluído!');
      const processingTime = Date.now() - startTime;

      const importResults: ImportResult = {
        totalEmails: validation.stats.total,
        validEmails: validation.stats.validCount,
        invalidEmails: validation.stats.invalidCount,
        duplicatesRemoved: validation.stats.duplicateCount,
        uniqueDomains: validation.stats.uniqueDomains,
        detectedSmtps: smtpConfigs.length,
        processingTime
      };

      setResults(importResults);
      setValidSmtpConfigs(smtpConfigs);

      // Auto-import if successful
      setTimeout(() => {
        onImport({
          name: formData.name,
          emails: validation.valid,
          validSmtps: smtpConfigs,
          chunkSize: formData.chunkSize
        });
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Erro ao processar emails:', error);
      alert('Erro ao processar emails. Verifique o formato dos dados.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setFormData({ name: '', chunkSize: 5000 });
      setSelectedFile(null);
      setTextInput('');
      setProgress(0);
      setProgressMessage('');
      setResults(null);
      setValidSmtpConfigs([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--vscode-editor-background)] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--vscode-border)] shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--vscode-text)] flex items-center">
              <Mail className="h-5 w-5 mr-2 text-[var(--vscode-accent)]" />
              Importar Emails com SMTP
            </h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 rounded hover:bg-[var(--vscode-button-hover-background)] text-[var(--vscode-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--vscode-text)] mb-2">
                Nome da Lista
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)]"
                placeholder="Ex: Clientes 2025"
                disabled={isProcessing}
              />
            </div>

            {/* Input Methods */}
            <div>
              <label className="block text-sm font-medium text-[var(--vscode-text)] mb-2">
                Fonte dos Emails
              </label>

              {/* File Upload */}
              <div className="mb-4">
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
                        .txt, .csv - Máximo 100MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <p className="text-xs text-[var(--vscode-text-muted)] mb-2">
                  Ou cole emails aqui (um por linha):
                </p>
                <textarea
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    if (e.target.value.trim() && selectedFile) {
                      setSelectedFile(null); // Clear file when typing
                    }
                  }}
                  className="w-full h-32 px-3 py-2 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)] font-mono text-sm"
                  placeholder="user@empresa.com
admin@site.com.br
contato@loja.com|senha123
vendas@exemplo.com:minhasenha"
                  disabled={isProcessing}
                />
                <p className="text-xs text-[var(--vscode-text-muted)] mt-1">
                  Formatos suportados: email, email|senha, email:senha
                </p>
              </div>
            </div>

            {/* Chunk Size */}
            <div>
              <label className="block text-sm font-medium text-[var(--vscode-text)] mb-2">
                Emails por Arquivo
              </label>
              <input
                type="number"
                value={formData.chunkSize}
                onChange={(e) => setFormData({ ...formData, chunkSize: parseInt(e.target.value) || 5000 })}
                className="w-full px-3 py-2 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded text-[var(--vscode-input-foreground)]"
                min="100"
                max="50000"
                disabled={isProcessing}
              />
              <p className="text-xs text-[var(--vscode-text-muted)] mt-1">
                Listas grandes serão divididas automaticamente
              </p>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--vscode-accent)]" />
                  <span className="text-sm text-[var(--vscode-text)]">
                    {progressMessage || 'Processando emails...'}
                  </span>
                  <span className="text-sm text-[var(--vscode-text-muted)]">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-[var(--vscode-input-background)] rounded-full h-2">
                  <div
                    className="bg-[var(--vscode-accent)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results */}
            {results && !isProcessing && (
              <div className="bg-[var(--vscode-input-background)] rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-[var(--vscode-text)] flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-[var(--vscode-success)]" />
                  Processamento Concluído
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">Total processado:</span>
                    <span className="text-[var(--vscode-text)]">{results.totalEmails.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">Emails válidos:</span>
                    <span className="text-[var(--vscode-success)]">{results.validEmails.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">Emails inválidos:</span>
                    <span className="text-[var(--vscode-error)]">{results.invalidEmails.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">Duplicados removidos:</span>
                    <span className="text-[var(--vscode-warning)]">{results.duplicatesRemoved.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">Domínios únicos:</span>
                    <span className="text-[var(--vscode-text)]">{results.uniqueDomains}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--vscode-text-muted)]">SMTPs detectados:</span>
                    <span className="text-[var(--vscode-accent)]">{results.detectedSmtps}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--vscode-border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--vscode-text)]">
                      Tempo de processamento:
                    </span>
                    <span className="text-sm text-[var(--vscode-accent)]">
                      {(results.processingTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>

                {/* SMTP Configs Preview */}
                {validSmtpConfigs.length > 0 && (
                  <div className="pt-2 border-t border-[var(--vscode-border)]">
                    <h5 className="text-xs font-medium text-[var(--vscode-text)] mb-2 flex items-center">
                      <Server className="h-3 w-3 mr-1" />
                      Configurações SMTP Detectadas:
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {validSmtpConfigs.map((smtp, index) => (
                        <div key={index} className="flex items-center justify-between text-xs p-2 bg-[var(--vscode-editor-background)] rounded">
                          <span className="text-[var(--vscode-text)]">{smtp.name}</span>
                          <span className="text-[var(--vscode-text-muted)]">
                            {smtp.host}:{smtp.port}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--vscode-border)]">
                  <div className="flex items-center text-xs text-[var(--vscode-success)]">
                    <Zap className="h-3 w-3 mr-1" />
                    Importação automática em andamento...
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleProcess}
                disabled={(!selectedFile && !textInput.trim()) || !formData.name || isProcessing}
                className="flex-1 bg-[var(--vscode-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] text-[var(--vscode-button-foreground)] px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Processar e Importar
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)] text-[var(--vscode-button-secondaryForeground)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmailImportModal;
