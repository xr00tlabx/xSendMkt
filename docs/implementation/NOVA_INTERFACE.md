# 🚀 xSendMkt - Interface VS Code Style

## Nova Interface de Envio de Email Marketing

A interface foi completamente redesenhada com inspiração no VS Code, oferecendo uma experiência profissional e moderna para campanhas de email marketing.

## ✨ Principais Funcionalidades

### 🎨 Design Inspirado no VS Code
- **Tema Dark**: Interface dark profissional similar ao VS Code
- **Layout Responsivo**: Divisão em painéis organizados
- **Header Estilizado**: Barra superior com informações essenciais
- **Cores Temáticas**: Esquema de cores azul/verde para melhor UX

### 🔄 Envio Sequencial Inteligente
- **Processamento Automático**: Processa listas de email sequencialmente
- **Auto-Progressão**: Avança automaticamente para próxima lista após conclusão
- **Limpeza Automática**: Remove arquivos .txt das listas processadas
- **Gerenciamento de Estado**: Controle completo do processo de envio

### 🖥️ Terminal Hacker Style
- **Logs em Tempo Real**: Display de logs estilo terminal dark
- **Formatação Profissional**: Timestamp, tipos de log e códigos de cor
- **Auto-scroll**: Scroll automático para os logs mais recentes
- **Indicadores Visuais**: Ícones e cores para diferentes tipos de mensagem
- **Status Live**: Indicador em tempo real do status de envio

### 📊 Painéis de Informação

#### 📋 Listas de Email
- **Visualização Hierárquica**: Lista todas as listas disponíveis
- **Indicadores de Status**: 
  - 🔵 Lista atual sendo processada
  - ✅ Listas concluídas
  - ⚪ Listas pendentes
- **Contadores**: Número de emails por lista
- **Ordenação**: Numeração sequencial das listas

#### 🖥️ Status SMTP
- **Monitoramento Real-time**: Status de todos os SMTPs configurados
- **Indicadores Visuais**:
  - 🟢 Ativo e funcionando
  - 🟡 Em standby
  - 🔴 Falhou/Inativo
- **Resumo Estatístico**: Contadores por status
- **Informações Detalhadas**: Nome e usuário de cada SMTP

#### 📈 Estatísticas Globais
- **Progresso Global**: Barra de progresso do envio total
- **Progresso de Listas**: Quantas listas foram concluídas
- **Taxa de Sucesso**: Percentual de emails enviados com sucesso
- **Contadores Detalhados**:
  - ✅ Emails enviados
  - ❌ Emails com falha
  - 📋 Listas concluídas
  - ⏳ Listas pendentes

### 🎛️ Controles de Envio
- **Botão Inteligente**: Muda de acordo com o estado atual
- **Validação**: Verificação de requisitos antes do envio
- **Controles de Fluxo**:
  - ▶️ Iniciar envio sequencial
  - ⏸️ Pausar processo
  - ▶️ Retomar processo
  - ⏹️ Parar completamente

### 📱 Interface Responsiva
- **Layout Adaptável**: Funciona em diferentes tamanhos de tela
- **Divisão Inteligente**: 
  - 70% para formulário e controles
  - 30% para painéis de informação
  - 100% largura para terminal de logs

## 🛠️ Funcionalidades Técnicas

### 🔄 Hook useSequentialEmailSender
- **Gerenciamento de Estado**: Estado centralizado do envio
- **Processamento Assíncrono**: Envio não-bloqueante
- **Tratamento de Erros**: Captura e log de erros
- **Estatísticas em Tempo Real**: Cálculo de velocidade e ETA

### 🎨 Componentes Reutilizáveis
- **HackerTerminal**: Terminal com estilo hacker
- **GlobalStatsPanel**: Painel de estatísticas globais
- **Layout VS Code**: Estrutura similar ao editor

### 🔧 Integração com Backend
- **API Electron**: Comunicação com backend
- **Gestão de Listas**: CRUD completo de listas
- **Configuração SMTP**: Gerenciamento de servidores
- **Logs Persistentes**: Armazenamento de logs de envio

## 🚀 Como Usar

1. **Configure SMTPs**: Adicione e configure servidores SMTP
2. **Importe Listas**: Adicione listas de email (.txt)
3. **Crie Campanha**: Preencha assunto, remetente e conteúdo HTML
4. **Inicie Envio**: Clique em "Iniciar Envio Sequencial"
5. **Monitore**: Acompanhe o progresso nos painéis e terminal

## 🎯 Benefícios da Nova Interface

- **Profissionalismo**: Visual moderno e profissional
- **Eficiência**: Workflow otimizado para campanhas
- **Transparência**: Visibilidade completa do processo
- **Controle**: Gestão total do envio sequencial
- **Experiência**: UX inspirada em ferramentas profissionais

## 🔮 Funcionalidades Futuras

- **Temas Personalizáveis**: Múltiplos temas de cor
- **Relatórios Detalhados**: Exportação de relatórios
- **Agendamento**: Envios programados
- **Templates**: Biblioteca de templates HTML
- **Segmentação**: Envio por segmentos de listas

---

**xSendMkt** - Transformando o email marketing com tecnologia profissional! 🚀
