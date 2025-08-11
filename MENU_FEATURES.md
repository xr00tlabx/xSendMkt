# xSendMkt - Funcionalidades do Menu

## Menu Principal

### File
- **New Campaign**: Criar nova campanha de email
- **Save Campaign**: Salvar campanha atual
- **Quit**: Sair da aplicação

### Lista
- **Zerar Lista**: Remove todas as listas de emails salvas
  - Exibe modal de confirmação antes de executar
  - Ação irreversível

### SMTPs
- **Zerar Lista**: Remove todos os SMTPs configurados
  - Exibe modal de confirmação antes de executar
  - Ação irreversível

- **Carregar SMTPs**: Importar SMTPs em lote
  - Formato: `host:port:username:password`
  - Suporte a arquivo .txt ou .csv
  - Um SMTP por linha
  - Exemplo: `smtp.gmail.com:587:user@gmail.com:password`
  - Porta 465 = SSL automático
  - Outras portas = TLS/STARTTLS

- **Testar SMTPs**: Verificar funcionamento dos SMTPs
  - Testa conectividade e autenticação
  - Configurável número de threads simultâneas
  - Exibe tempo de resposta e status
  - Email de teste configurável

### Configurações
- **Abrir Configurações**: Modal com configurações da aplicação
  - **Threads**: Número de threads simultâneas para envio (1-100)
  - **Timeout**: Timeout para conexões SMTP em segundos (5-300)
  - **Proxies**: Lista de proxies para uso
    - Um proxy por linha
    - Suporte para HTTP, HTTPS e SOCKS5
    - Formato: `http://proxy:port` ou `http://user:pass@proxy:port`
    - Botão para testar proxies com threads configuráveis
    - Exibe status e tempo de resposta

## Funcionalidades dos Modais

### Modal de Confirmação
- Usado para confirmar ações irreversíveis
- Variantes: danger, warning, info
- Botões personalizáveis

### Modal de Configurações
- Salvamento automático no localStorage
- Teste de proxies em tempo real
- Validação de entrada
- Interface intuitiva

### Modal de Carregamento de SMTPs
- Parser inteligente de formatos
- Visualização prévia antes do carregamento
- Validação de dados
- Suporte a upload de arquivo

### Modal de Teste de SMTPs
- Teste em lote com controle de concorrência
- Estatísticas em tempo real
- Resultados detalhados
- Taxa de sucesso calculada

## Atalhos de Teclado

- `Ctrl+N` (Cmd+N no Mac): Nova campanha
- `Ctrl+S` (Cmd+S no Mac): Salvar campanha
- `Ctrl+,` (Cmd+, no Mac): Abrir configurações
- `Ctrl+Q` (Cmd+Q no Mac): Sair

## Armazenamento Local

### localStorage Keys:
- `appSettings`: Configurações da aplicação (threads, timeout, proxies)
- `smtpConfigs`: Lista de configurações SMTP
- `emailLists`: Listas de emails

### Estrutura dos Dados:

```typescript
// Configurações da aplicação
interface AppSettings {
    threads: number;
    timeout: number;
    proxies: string[];
}

// Configuração SMTP
interface SmtpConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    isActive: boolean;
}

// Resultado de teste de proxy
interface ProxyTestResult {
    proxy: string;
    status: 'success' | 'failed';
    responseTime?: number;
    error?: string;
}
```

## Comunicação Electron

### Eventos do Menu:
- `menu-clear-lists`: Zerar listas de email
- `menu-clear-smtps`: Zerar lista de SMTPs
- `menu-load-smtps`: Carregar SMTPs
- `menu-test-smtps`: Testar SMTPs
- `menu-open-settings`: Abrir configurações

### IPC Handlers:
- `get-app-version`: Obter versão da aplicação
- `show-open-dialog`: Exibir diálogo de abertura de arquivo
- `show-save-dialog`: Exibir diálogo de salvamento
- `show-notification`: Exibir notificação do sistema

## Segurança

- Context isolation habilitado
- Node integration desabilitado
- Web security habilitado
- Preload script para comunicação segura
- Validação de canais IPC
