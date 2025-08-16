# Funcionalidade de Divisão de Listas (Chunking)

## 🎯 Problema Resolvido

Anteriormente, ao importar listas grandes de emails, o sistema salvava todos os emails em um único arquivo, mesmo quando o usuário especificava um limite de emails por arquivo. Esta implementação corrige esse comportamento.

## ✨ Nova Funcionalidade

### Divisão Automática de Listas
- **Limite configurável**: O usuário pode definir quantos emails deseja por arquivo (padrão: 5.000)
- **Nomenclatura sequencial**: Os arquivos são nomeados automaticamente como `<nome>1.txt`, `<nome>2.txt`, `<nome>3.txt`, etc.
- **Processamento inteligente**: Se a lista tem menos emails que o limite, salva como arquivo único

### Como Funciona

1. **Interface do Usuário**:
   - Campo "Emails por Arquivo (Divisão automática)" no modal de importação
   - Explicação clara sobre a funcionalidade
   - Valores mínimo (100) e máximo (50.000) configuráveis

2. **Backend (Electron)**:
   - Nova função `saveEmailListChunked()` no FileService
   - Divisão automática baseada no `chunkSize`
   - Retorno detalhado com informações de cada arquivo criado

3. **Exemplo de Uso**:
   ```
   Lista: "clientes" com 12.000 emails
   Limite: 5.000 emails por arquivo
   
   Resultado:
   - clientes1.txt (5.000 emails)
   - clientes2.txt (5.000 emails)
   - clientes3.txt (2.000 emails)
   ```

## 🔧 Arquivos Modificados

### Backend (Electron)
- `electron/services/fileService.js`: Nova função `saveEmailListChunked()`
- `electron/handlers/fileHandlers.js`: Handler para IPC `file:save-email-list-chunked`
- `electron/preload.js`: Exposição da nova API

### Frontend (React)
- `src/types/electron.d.ts`: Definições de tipos para `ChunkedFileResult`
- `src/services/index.ts`: Novo método `saveEmailListChunked()`
- `src/pages/EmailListsPage.tsx`: Lógica atualizada para usar chunking
- `src/components/modals/ImportEmailListModal.tsx`: Interface melhorada

## 🚀 Benefícios

1. **Organização**: Arquivos menores são mais fáceis de gerenciar
2. **Performance**: Processamento mais eficiente de listas grandes
3. **Flexibilidade**: O usuário controla o tamanho dos chunks
4. **Automação**: Divisão totalmente automática sem intervenção manual
5. **Feedback**: Notificação detalhada sobre os arquivos criados

## 🔧 API Técnica

### Nova Função no FileService
```javascript
async saveEmailListChunked(basename, emails, chunkSize = 5000, format = 'txt')
```

**Parâmetros**:
- `basename`: Nome base para os arquivos (sem extensão)
- `emails`: Array de emails para dividir
- `chunkSize`: Quantidade de emails por arquivo
- `format`: Formato do arquivo ('txt', 'csv', 'json')

**Retorno**:
```javascript
[
  {
    filename: "clientes1.txt",
    path: "/path/to/clientes1.txt",
    count: 5000,
    chunkNumber: 1
  },
  // ... outros chunks
]
```

### Handler IPC
```javascript
ipcMain.handle('file:save-email-list-chunked', async (event, basename, emails, chunkSize, format) => {
    return await FileService.saveEmailListChunked(basename, emails, chunkSize, format);
});
```

## 🎯 Casos de Uso

1. **Listas pequenas (≤ limite)**: Salva como arquivo único
2. **Listas grandes (> limite)**: Divide automaticamente
3. **Campanhas por região**: Divide clientes por localização
4. **Gestão de SMTP**: Distribui carga entre servidores
5. **Backup organizado**: Arquivos menores para backup

## 🔍 Validações

- Verificação de limite mínimo (100 emails)
- Verificação de limite máximo (50.000 emails)
- Tratamento de erros durante a divisão
- Feedback visual do progresso
- Notificação de sucesso com detalhes

## 📝 Notas de Implementação

- A divisão preserva a ordem original dos emails
- Cada chunk é salvo independentemente (falha em um não afeta outros)
- A função é retrocompatível (não quebra funcionalidades existentes)
- Suporte a todos os formatos existentes (txt, csv, json)
- Nomenclatura sequencial garante ordem lógica dos arquivos
