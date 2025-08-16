# Exemplo de Emails para Teste - Importação Inteligente de SMTP

Use estes emails de exemplo para testar a funcionalidade de importação inteligente:

## Formato 1: Email simples
admin@empresa.com.br
contato@loja.com
vendas@site.com.br
suporte@sistema.net

## Formato 2: Email com senha (separado por |)
marketing@agencia.com.br|senha123
financeiro@contabil.com|minhasenha
comercial@vendas.net|password123

## Formato 3: Email com senha (separado por :)
info@consultoria.com.br:secret123
gerencia@negocio.com:admin2025
ti@tecnologia.net:tech123

## Formato 4: Email com senha (separado por espaço)
rh@empresa.com.br senha123
diretoria@grupo.com admin456
operacao@industria.net oper789

## Formato 5: Email com nome
"João Silva" <joao@empresa.com.br>
"Maria Santos" <maria@loja.com>
"Pedro Costa" <pedro@site.net>

## Como testar:

1. Acesse a página "Configuração SMTP"
2. Clique no botão "Importação Inteligente" (ícone de raio ⚡)
3. Cole alguns dos emails acima no campo de texto
4. Clique em "Processar e Importar"
5. Observe o progresso e os resultados:
   - Validação de emails
   - Detecção automática de SMTP
   - Teste de conectividade
   - Importação das configurações válidas

## O que a funcionalidade faz:

✅ **Extrai emails** de diferentes formatos
✅ **Valida emails** usando regex
✅ **Detecta provedores SMTP** automaticamente
✅ **Testa conectividade** SMTP
✅ **Importa configurações** válidas
✅ **Salva listas** de emails opcionalmente

## Provedores suportados automaticamente:

- Gmail (smtp.gmail.com:587)
- Outlook/Hotmail (smtp-mail.outlook.com:587)
- Yahoo (smtp.mail.yahoo.com:587)
- iCloud (smtp.mail.me.com:587)
- Zoho (smtp.zoho.com:587)
- UOL (smtps.uol.com.br:587)
- IG (smtp.ig.com.br:587)
- Terra (smtp.terra.com.br:587)
- E muitos outros...

Para domínios personalizados, o sistema tenta detectar automaticamente usando padrões como:
- smtp.dominio.com
- mail.dominio.com
- email.dominio.com
