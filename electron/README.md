# Estrutura Electron - xSendMkt

Esta é uma estrutura modular e organizada para o aplicativo Electron do xSendMkt, com SQLite para persistência de dados e funcionalidades completas de SMTP.

## 📁 Estrutura de Diretórios

```
electron/
├── main.js                 # Processo principal do Electron
├── preload.js             # Script de preload com APIs seguras
├── database/
│   └── index.js           # Serviço SQLite com schemas e operações
├── services/
│   ├── emailService.js    # Serviço de envio de emails via SMTP
│   └── fileService.js     # Gerenciamento de arquivos de listas
├── handlers/
│   ├── databaseHandlers.js # Handlers IPC para database
│   ├── emailHandlers.js    # Handlers IPC para email
│   └── fileHandlers.js     # Handlers IPC para arquivos
└── utils/
    └── index.js           # Utilitários e helpers
```

## 🚀 Funcionalidades Implementadas

### Database (SQLite)
- **Configurações**: Armazenamento de configurações do sistema
- **SMTPs**: Gerenciamento completo de servidores SMTP
- **Campanhas**: Histórico e dados de campanhas de email
- **Logs**: Registro detalhado de envios de email

### Email Service
- **Teste de SMTP**: Verificação de conectividade
- **Envio em fila**: Sistema de fila com controle de concorrência
- **Rotação de SMTPs**: Distribuição automática entre servidores
- **Controles**: Pausar, retomar e limpar fila
- **Pool de conexões**: Reutilização eficiente de conexões

### File Service
- **Diretório configurável**: Usuário define onde salvar listas
- **Múltiplos formatos**: Suporte a TXT, CSV e JSON
- **Validação**: Limpeza e validação de emails
- **Mesclagem**: Combinar múltiplas listas
- **Filtros**: Filtrar por domínio

## 🛠️ APIs Disponíveis

### Database API
```typescript
// Configurações
await window.electronAPI.database.getSetting('key');
await window.electronAPI.database.setSetting('key', value, 'type');

// SMTPs
await window.electronAPI.database.addSmtp(smtpConfig);
await window.electronAPI.database.getAllSmtps();
await window.electronAPI.database.updateSmtp(id, smtpConfig);
await window.electronAPI.database.deleteSmtp(id);

// Campanhas
await window.electronAPI.database.saveCampaign(campaign);
await window.electronAPI.database.getAllCampaigns();
```

### Email API
```typescript
// Testes
await window.electronAPI.email.testSmtp(smtpConfig);
await window.electronAPI.email.testAllSmtps();

// Envio
await window.electronAPI.email.sendSingle(emailData, smtpId);
await window.electronAPI.email.addToQueue(emails, campaignId);

// Controle da fila
await window.electronAPI.email.pauseQueue();
await window.electronAPI.email.resumeQueue();
await window.electronAPI.email.getQueueStatus();
```

### File API
```typescript
// Diretório
await window.electronAPI.files.selectListsDirectory();
await window.electronAPI.files.getEmailLists();

// Operações
await window.electronAPI.files.readEmails(filename);
await window.electronAPI.files.saveEmailList(filename, emails, format);
await window.electronAPI.files.validateAndCleanList(filename);
await window.electronAPI.files.mergeLists(filenames, output, format);
```

## 📊 Schema do Banco de Dados

### Tabela `settings`
- Configurações gerais do sistema
- Diretório de listas, concorrência, delays, etc.

### Tabela `smtps`
- Configurações de servidores SMTP
- Estatísticas de uso e performance
- Status ativo/inativo

### Tabela `campaigns`
- Dados das campanhas de email
- Estatísticas de envio
- Status de execução

### Tabela `email_logs`
- Log detalhado de cada email enviado
- Status de entrega e erros
- Relacionamento com campanhas e SMTPs

## 🔧 Configurações Padrão

O sistema inicializa com as seguintes configurações:

```javascript
{
    lists_directory: '',              // Definido pelo usuário
    max_concurrent_emails: 5,         // Emails simultâneos
    delay_between_emails: 1000,       // Delay em ms
    api_mode: 'mock',                // Modo da API
    auto_save_campaigns: true         // Auto-salvamento
}
```

## 🚦 Sistema de Fila

O sistema de envio possui:
- **Controle de concorrência**: Até 5 emails simultâneos por padrão
- **Delay configurável**: Pausa entre lotes de envio
- **Rotação de SMTP**: Distribui carga entre servidores
- **Retry automático**: (Future feature)
- **Pausar/Retomar**: Controle em tempo real

## 🔒 Segurança

- **Context Isolation**: Isolamento completo do contexto
- **Preload seguro**: APIs expostas de forma controlada
- **Validação de entrada**: Todas as entradas são validadas
- **Logs de auditoria**: Registro completo de operações

## 🎯 Próximos Passos

1. **Interface React**: Conectar as APIs às interfaces
2. **Retry Logic**: Sistema de retry para emails falhados
3. **Templates**: Sistema de templates de email
4. **Scheduler**: Agendamento de campanhas
5. **Analytics**: Dashboard de estatísticas
6. **Backup/Restore**: Sistema de backup do banco

## 📝 Uso das APIs

### Exemplo: Carregar SMTPs
```typescript
const smtps = await window.electronAPI.database.getAllSmtps();
console.log('SMTPs disponíveis:', smtps);
```

### Exemplo: Enviar campanha
```typescript
// Carregar emails de uma lista
const emails = await window.electronAPI.files.readEmails('lista.txt');

// Preparar dados de email
const emailData = emails.map(contact => ({
    to: contact.email,
    subject: 'Assunto da campanha',
    html: '<h1>Conteúdo HTML</h1>',
    text: 'Conteúdo texto'
}));

// Adicionar à fila
await window.electronAPI.email.addToQueue(emailData, campaignId);
```

### Exemplo: Monitorar progresso
```typescript
const status = await window.electronAPI.email.getQueueStatus();
console.log(`Processando: ${status.isProcessing}`);
console.log(`Fila: ${status.queueLength} emails`);
```

Esta estrutura fornece uma base sólida, escalável e mantível para o sistema de email marketing.
