# API de Envio de Emails - Electron

## ✅ Integração Completa Implementada

O sistema agora está **completamente integrado** com a API do Electron para envio de emails, usando a **mesma API que valida os SMTPs**.

### 🔧 **API Utilizada**

A função `sendSingleEmail` agora usa diretamente:

```javascript
window.electronAPI.email.sendSingle(emailData, smtpId)
```

Esta é a **mesma API** que usamos para:
- `window.electronAPI.email.testSmtp()` - Testar SMTPs
- `window.electronAPI.email.testAllSmtps()` - Testar todos os SMTPs

### 📧 **Estrutura do Email**

```typescript
const emailData = {
    to: string,           // Email destinatário
    subject: string,      // Assunto
    html: string,         // Conteúdo HTML
    text: string,         // Conteúdo texto (auto-gerado)
    campaignId?: number   // ID da campanha (opcional)
}
```

### 🚀 **Fluxo de Envio**

1. **Validação da API**: Verifica se `window.electronAPI.email.sendSingle` está disponível
2. **Preparação dos dados**: Monta o objeto `emailData` com todos os campos necessários
3. **Envio**: Chama a API do Electron passando `emailData` e `smtpId`
4. **Tratamento do resultado**: Verifica sucesso/falha e atualiza logs
5. **Gestão de SMTPs**: Em caso de falha, coloca o SMTP em standby

### 🛡️ **Tratamento de Erros**

- **API não disponível**: Sistema detecta e informa ao usuário
- **Falha no envio**: SMTP é colocado em standby automático
- **Logs detalhados**: Todas as ações são registradas com timestamps
- **Recuperação automática**: SMTPs voltam automaticamente após período de standby

### 🔍 **Logs de Debug**

O sistema agora inclui logs detalhados no console:

```javascript
🚀 Enviando email: { email, smtpId, smtpName, subject }
📧 Resultado do envio: { success, messageId, response }
✅ Email enviado para email@exemplo.com
❌ Falha ao enviar para email@exemplo.com: Erro específico
```

### ⚙️ **Backend (Electron)**

O handler no backend está em `electron/handlers/emailHandlers.js`:

```javascript
// Send single email
ipcMain.handle('email:send-single', async (event, emailData, smtpId) => {
    try {
        return await EmailService.sendEmail(emailData, smtpId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
});
```

O serviço de email está em `electron/services/emailService.js` e usa **nodemailer** com as mesmas configurações dos testes SMTP.

### 📊 **Validações Implementadas**

Antes de habilitar o botão "Iniciar Envio", o sistema verifica:

✅ Assunto preenchido  
✅ Remetente preenchido  
✅ Conteúdo HTML preenchido  
✅ Pelo menos uma lista de emails disponível  
✅ Pelo menos um SMTP ativo  
✅ **API do Electron disponível**  
✅ Sistema não está enviando

### 🔄 **Consistência com Validação SMTP**

A **mesma infraestrutura** que valida SMTPs agora é usada para envio:

- **Mesmo transporter nodemailer**
- **Mesmas configurações de conexão**
- **Mesmos timeouts e retry**
- **Mesma gestão de pool de conexões**

### 🎯 **Resultado**

O sistema agora garante que:

1. **Se o SMTP passou no teste**, ele funcionará para envio
2. **Mesma qualidade de conexão** entre teste e envio real
3. **Consistência total** na gestão de SMTPs
4. **Logs unificados** para debug e monitoramento

---

**✅ Sistema 100% funcional e integrado com a API do Electron!**
