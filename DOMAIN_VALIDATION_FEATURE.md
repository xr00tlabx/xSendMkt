# Validações de Domínio e SMTP

## 🛡️ Sistema de Validação Implementado

### Validações Pré-SMTP Adicionadas

Antes de tentar qualquer conexão SMTP, o sistema agora executa validações inteligentes para economizar tempo e recursos.

### 🔍 Processo de Validação em Etapas

#### 1. **Validação de Formato de Email**
```javascript
// Regex para validar formato básico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

#### 2. **Detecção de Domínios Problemáticos**
```javascript
const problematicDomains = [
    'example.com', 'test.com', 'demo.com', 'sample.com',
    'localhost', '127.0.0.1', 'invalid.com', 'fake.com'
];
```

#### 3. **Tratamento Especial para Domínios Gratuitos**
```javascript
const knownFreeDomains = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
    'live.com', 'msn.com', 'icloud.com', 'aol.com'
];
```
- **Bypass**: Domínios gratuitos conhecidos passam direto para teste SMTP
- **Motivo**: Evitar falsos negativos em verificações de conectividade

#### 4. **Verificação de Conectividade do Domínio**
Para domínios corporativos/personalizados:

##### A. **Teste de Resolução DNS**
```javascript
// Tenta fetch HEAD para verificar se o domínio resolve
await fetch(`https://${domain}`, { method: 'HEAD', mode: 'no-cors' });
```

##### B. **Teste de Conectividade HTTP/HTTPS**
```javascript
const urls = [`https://${domain}`, `http://${domain}`];
// Testa ambos os protocolos com timeout de 3s
```

##### C. **Teste de Conectividade Básica**
```javascript
// Usa técnica de Image() para testar conectividade
const img = new Image();
img.src = `https://${domain}/favicon.ico`;
```

##### D. **Verificação de Servidores SMTP**
```javascript
const smtpHosts = [
    `smtp.${domain}`,
    `mail.${domain}`,
    `mx.${domain}`,
    domain
];
```

### 📊 **Logs em Tempo Real Durante Validação**

#### Exemplo de Fluxo de Logs:
```
🔍 Iniciando validação de user@corporativo.com...
🌐 Verificando conectividade do domínio corporativo.com...
🔍 Verificando servidor SMTP smtp.corporativo.com...
✅ Servidor SMTP smtp.corporativo.com respondeu
✅ Domínio corporativo.com está online (3/4 testes passaram)
✅ Email e domínio validados para user@corporativo.com
🔧 Iniciando testes SMTP para user@corporativo.com...
⚡ Tentando smtp.corporativo.com:587 (TLS)
```

#### Para Domínios Gratuitos:
```
🔍 Iniciando validação de user@gmail.com...
📧 Detectado domínio gratuito gmail.com - usando configurações especiais
✅ Email e domínio validados para user@gmail.com
🔧 Iniciando testes SMTP para user@gmail.com...
⚡ Tentando smtp.gmail.com:587 (TLS)
```

#### Para Domínios Problemáticos:
```
🔍 Iniciando validação de test@example.com...
⚠️ Domínio example.com está na lista de domínios problemáticos
❌ Validação falhou para test@example.com: Domínio example.com é conhecido por não ter configuração SMTP válida
```

#### Para Domínios Offline:
```
🔍 Iniciando validação de user@dominiooffline.com...
🌐 Verificando conectividade do domínio dominiooffline.com...
🔍 Verificando servidor SMTP smtp.dominiooffline.com...
⚠️ Servidor SMTP smtp.dominiooffline.com não respondeu na porta 443/80
❌ Domínio dominiooffline.com parece estar offline
❌ Validação falhou para user@dominiooffline.com: Domínio dominiooffline.com parece estar offline
```

### 🎯 **Benefícios das Validações**

#### ⚡ **Performance**
- **Economia de Tempo**: Evita testes SMTP desnecessários
- **Redução de Timeout**: Detecta problemas antes de tentar conexão SMTP
- **Threads Otimizadas**: Menos carga nos workers de teste

#### 🛡️ **Confiabilidade**
- **Pré-filtro**: Remove emails problemáticos antes do teste
- **Feedback Claro**: Usuário sabe exatamente por que falhou
- **Menos Falsos Negativos**: Tratamento especial para domínios conhecidos

#### 📈 **UX Melhorada**
- **Logs Detalhados**: Processo transparente para o usuário
- **Feedback Imediato**: Validação instantânea de problemas óbvios
- **Categorização**: Diferencia entre tipos de erro (formato, conectividade, etc.)

### 🔧 **Configurações Avançadas**

#### Timeouts Configuráveis:
- **DNS Resolution**: 5 segundos
- **HTTP Connectivity**: 3 segundos  
- **Basic Connectivity**: 3 segundos
- **SMTP Server Check**: 2 segundos

#### Fallback Strategy:
1. Se 1+ validação passar → Continue para SMTP
2. Se todas falharem → Bloquear teste SMTP
3. Domínios gratuitos → Sempre continuar

### 📋 **Casos de Uso Cobertos**

#### ✅ **Funcionais**
- `user@gmail.com` → Passa direto (domínio conhecido)
- `admin@empresa.com` → Valida conectividade + testa SMTP
- `contato@siteonline.com` → Valida + testa

#### ❌ **Bloqueados**
- `test@example.com` → Bloqueado (domínio problemático)
- `user@dominiooffline.com` → Bloqueado (domínio offline)
- `email-invalido@` → Bloqueado (formato inválido)

---

**Implementado**: Janeiro 2025  
**Status**: ✅ **Funcional e Testado**  
**Performance**: 🚀 **Otimizada com validações inteligentes**
