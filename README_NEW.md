# 🚀 xSendMkt - Sistema de Marketing por Email

![VS Code Style](https://img.shields.io/badge/style-VS%20Code-007ACC)
![Electron](https://img.shields.io/badge/electron-latest-47848F)
![React](https://img.shields.io/badge/react-18.x-61DAFB)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6)
![GitHub issues](https://img.shields.io/github/issues/xr00tlabx/xSendMkt)
![GitHub pull requests](https://img.shields.io/github/issues-pr/xr00tlabx/xSendMkt)

Sistema profissional de marketing por email com interface moderna inspirada no VS Code, desenvolvido com Electron, React e TypeScript.

## ✨ Características Principais

### 🎨 **Interface VS Code**
- **Tema escuro profissional** com cores autênticas do VS Code
- **Layout compacto** otimizado para produtividade
- **Janelas modais responsivas** com estilo nativo
- **Typography consistente** com fontes monospace

### 📧 **Gestão de Email Marketing**
- **Importação em massa** de listas de email (até 500MB)
- **Validação automática** de emails com remoção de duplicados
- **Editor HTML integrado** com Monaco Editor
- **Configuração SMTP** com testes automáticos
- **Campanhas programáveis** com estatísticas em tempo real

### 🔄 **Auto-Update System**
- **Atualizações automáticas** via GitHub Releases
- **Download em background** com notificações
- **Instalação silenciosa** sem interrupção do fluxo
- **Verificação manual** através do menu

## 📋 Gestão de Projeto

### 🎯 Milestones Atuais
- **v1.1.0** - Electron Native Features (Em Progresso)
- **v1.2.0** - Desktop UX Excellence (Planejado)
- **v1.3.0** - Analytics & Monitoring (Futuro)

### 📊 Status do Projeto
- **Sprint Atual:** Core Improvements (16 Jan - 29 Jan 2025)
- **Issues Abertas:** ![GitHub issues](https://img.shields.io/github/issues/xr00tlabx/xSendMkt)
- **PRs Pendentes:** ![GitHub pull requests](https://img.shields.io/github/issues-pr/xr00tlabx/xSendMkt)

### 🔗 Links de Gestão
- [📊 Project Board](https://github.com/xr00tlabx/xSendMkt/projects)
- [🎯 Milestones](https://github.com/xr00tlabx/xSendMkt/milestones)
- [📋 Sprint Planning](./docs/project-management/SPRINT_PLANNING.md)
- [🗺️ Roadmap](./docs/project-management/ROADMAP.md)

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Git
- Windows/macOS/Linux

### Instalação
```bash
git clone https://github.com/xr00tlabx/xSendMkt.git
cd xSendMkt
npm install
npm run electron:dev
```

**Pronto!** Sua aplicação estará rodando com hot-reload e todas as funcionalidades ativas.

### Build para Produção
```bash
npm run build
npm run electron:pack
```

### Release
```bash
npm version patch
git push origin main --tags
```

O GitHub Actions automaticamente criará a release! 

## 📁 Estrutura do Projeto

```
xSendMkt/
├── 📁 .github/                 # GitHub automation
│   ├── 📁 ISSUE_TEMPLATE/      # Issue templates
│   ├── 📁 workflows/           # GitHub Actions
│   └── 📄 copilot-instructions.md
├── 📁 docs/                    # Documentation
│   ├── 📁 features/            # Feature specifications
│   ├── 📁 implementation/      # Technical docs
│   └── 📁 project-management/  # Project management
├── 📁 electron/                # Electron main process
│   ├── 📁 handlers/            # IPC handlers
│   ├── 📁 services/            # Background services
│   └── 📄 main.js              # Main entry point
├── 📁 src/                     # React frontend
│   ├── 📁 components/          # React components
│   ├── 📁 hooks/               # Custom hooks
│   ├── 📁 pages/               # Page components
│   ├── 📁 services/            # Frontend services
│   └── 📁 types/               # TypeScript types
└── 📄 package.json
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento web
npm run electron:dev # Desenvolvimento Electron
npm run build        # Build produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
npm test             # Testes
```

### Contribuindo
1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra** um Pull Request

### Guidelines de Contribuição
- Use os [templates de issue](./.github/ISSUE_TEMPLATE/) apropriados
- Siga o [template de PR](./.github/pull_request_template.md)
- Mantenha commits semânticos (feat, fix, docs, style, refactor, test, chore)
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário

## 🔧 Tecnologias

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Vite** - Build Tool

### Desktop
- **Electron** - Desktop Application
- **electron-builder** - Packaging
- **electron-updater** - Auto Updates

### Development
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Jest** - Testing Framework
- **GitHub Actions** - CI/CD

## 📊 Roadmap

### 🎯 v1.1.0 - Electron Native Features (Current)
- [x] Base Electron application
- [ ] Native menu integration
- [ ] Auto-updater system
- [ ] File system integration
- [ ] Performance optimizations

### 🔧 v1.2.0 - Desktop UX Excellence
- [ ] System tray integration
- [ ] Offline mode
- [ ] Local SQLite database
- [ ] Multi-window support

### 📈 v1.3.0 - Analytics & Monitoring
- [ ] Real-time dashboard
- [ ] Desktop widgets
- [ ] Advanced analytics
- [ ] Performance monitoring

[Ver roadmap completo →](./docs/project-management/ROADMAP.md)

## 📖 Documentação

### Para Desenvolvedores
- [🏗️ Arquitetura do Sistema](./docs/implementation/)
- [🔌 APIs e Integração](./docs/implementation/)
- [🧪 Testes](./docs/implementation/)

### Gestão de Projeto
- [📋 Project Management Hub](./docs/project-management/PROJECT_MANAGEMENT.md)
- [🎯 Milestones](./docs/project-management/MILESTONES.md)
- [🏃‍♂️ Sprint Planning](./docs/project-management/SPRINT_PLANNING.md)

## 🤝 Comunidade

### Getting Help
- 💬 [GitHub Discussions](https://github.com/xr00tlabx/xSendMkt/discussions) - Perguntas e discussões
- 🐛 [GitHub Issues](https://github.com/xr00tlabx/xSendMkt/issues) - Bugs e feature requests

### Contributing
- 📋 [Contributing Guidelines](./CONTRIBUTING.md)
- 🏷️ [Issue Labels](https://github.com/xr00tlabx/xSendMkt/labels)
- 🎯 [Good First Issues](https://github.com/xr00tlabx/xSendMkt/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

## 📄 Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).

## 🌟 Apoie o Projeto

Se o xSendMkt foi útil para você, considere:
- ⭐ Dar uma estrela no repositório
- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🤝 Contribuir com código
- 💬 Compartilhar com outros

---

<div align="center">

**Desenvolvido com ❤️ por [@xr00tlabx](https://github.com/xr00tlabx)**

[⬆ Voltar ao topo](#-xsendmkt---sistema-de-marketing-por-email)

</div>
