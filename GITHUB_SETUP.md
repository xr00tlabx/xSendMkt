# xSendMkt - Configuração GitHub e Auto-Update

## 🚀 Setup Inicial do GitHub

### 1. Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique em "New repository"
3. Nome: `xSendMkt`
4. Descrição: `Professional Email Marketing Desktop Application`
5. Deixe público (ou privado se preferir)
6. **NÃO** inicialize com README (já temos um)
7. Clique em "Create repository"

### 2. Configurar Repositório Local

```bash
# No terminal, dentro da pasta do projeto:
cd C:\xRat\xSendMkt

# Adicionar remote origin (substitua SEU_USERNAME pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USERNAME/xSendMkt.git

# Renomear branch principal para main (padrão do GitHub)
git branch -M main

# Fazer o primeiro push
git push -u origin main
```

### 3. Atualizar package.json

No arquivo `package.json`, na seção `build.publish`, altere:
```json
"publish": {
  "provider": "github",
  "owner": "SEU_USERNAME_GITHUB",  // ← Coloque seu username aqui
  "repo": "xSendMkt",
  "private": false
}
```

## 🔄 Configuração do Auto-Update

### 1. GitHub Token (para publicação)

1. Acesse GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token (classic)"
3. Selecione as permissões:
   - `repo` (Full control of private repositories)
   - `write:packages` (Write packages to GitHub Package Registry)
4. Copie o token gerado

### 2. Configurar Token no Sistema

**Windows:**
```bash
# No PowerShell como administrador:
setx GH_TOKEN "seu_token_aqui" /M
```

**Ou criar arquivo .env na raiz do projeto:**
```env
GH_TOKEN=seu_token_aqui
```

### 3. Scripts de Build e Publicação

```bash
# Gerar build local (sem publicar)
npm run dist

# Publicar nova versão (gera release no GitHub)
npm run publish

# Publicar apenas para Windows
npm run publish:win
```

## 📦 Processo de Release

### 1. Preparar Nova Versão

```bash
# Atualizar versão no package.json
npm version patch  # Para bug fixes (1.0.0 → 1.0.1)
npm version minor  # Para novas features (1.0.0 → 1.1.0)
npm version major  # Para breaking changes (1.0.0 → 2.0.0)
```

### 2. Fazer Push das Mudanças

```bash
git add .
git commit -m "feat: nova funcionalidade de importação de listas"
git push origin main
git push origin --tags
```

### 3. Publicar Release

```bash
# Gerar build e publicar no GitHub Releases
npm run publish:win

# O electron-builder vai:
# 1. Gerar o executável
# 2. Criar um release no GitHub
# 3. Fazer upload dos arquivos
# 4. Gerar arquivos de update (latest.yml)
```

## 🔧 Funcionalidades do Auto-Update

### No Aplicativo

- **Verificação automática**: A cada inicialização do app
- **Notificações**: Quando nova versão está disponível
- **Download em background**: Usuário pode escolher baixar agora ou depois
- **Instalação**: Aplicada ao fechar o app ou imediatamente

### Para Desenvolvedores

```javascript
// No renderer process, você pode usar:
window.electronAPI.checkForUpdates()
window.electronAPI.downloadUpdate()
window.electronAPI.quitAndInstall()
```

## 🛠️ Estrutura de Arquivos

```
xSendMkt/
├── electron/
│   ├── services/
│   │   └── autoUpdaterService.js    # Serviço de auto-update
│   └── main.js                      # Configuração principal
├── dist-electron/                   # Build outputs
├── releases/                        # Releases locais
└── package.json                     # Configurações de build
```

## 📝 Exemplo de Workflow

### 1. Desenvolvimento
```bash
npm run electron:dev
```

### 2. Testar Build Local
```bash
npm run dist
```

### 3. Publicar Nova Versão
```bash
# Incrementar versão
npm version patch

# Commit e push
git add .
git commit -m "release: v1.0.1"
git push origin main
git push origin --tags

# Publicar
npm run publish:win
```

### 4. Verificar Release
1. Acesse seu repositório no GitHub
2. Vá em "Releases"
3. Verifique se o novo release foi criado
4. Baixe e teste o instalador

## 🚨 Troubleshooting

### Token Inválido
```bash
# Verificar se o token está configurado
echo $env:GH_TOKEN  # Windows PowerShell
```

### Erro de Permissão
- Certifique-se que o token tem permissões de `repo` e `write:packages`
- Verifique se o username no package.json está correto

### Build Falha
```bash
# Limpar cache e tentar novamente
npm run clean
npm install
npm run publish:win
```

## 📚 Links Úteis

- [Electron Builder](https://www.electron.build/)
- [Electron Updater](https://github.com/electron-userland/electron-updater)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

**🎉 Agora seu app está configurado para auto-updates via GitHub Releases!**
