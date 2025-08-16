#!/bin/bash

# 🚀 Script para configuração completa do GitHub para gestão de projeto
# Executar após o primeiro push do repositório

echo "🚀 Configurando GitHub Project Management para xSendMkt..."

# Verificar se GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI não encontrado. Instale em: https://cli.github.com/"
    exit 1
fi

# Verificar autenticação
echo "🔑 Verificando autenticação GitHub..."
if ! gh auth status &> /dev/null; then
    echo "🔐 Fazendo login no GitHub..."
    gh auth login
fi

REPO="xr00tlabx/xSendMkt"

echo "📋 Criando labels para organização..."

# Labels por tipo
gh label create "bug" --description "Algo não está funcionando" --color "d73a4a" --repo $REPO || true
gh label create "enhancement" --description "Nova funcionalidade ou melhoria" --color "a2eeef" --repo $REPO || true
gh label create "task" --description "Tarefa de desenvolvimento" --color "0e8a16" --repo $REPO || true
gh label create "documentation" --description "Melhorias na documentação" --color "0075ca" --repo $REPO || true

# Labels por prioridade
gh label create "high-priority" --description "Alta prioridade" --color "ff0000" --repo $REPO || true
gh label create "medium-priority" --description "Prioridade média" --color "ffcc00" --repo $REPO || true
gh label create "low-priority" --description "Baixa prioridade" --color "00ff00" --repo $REPO || true

# Labels por componente
gh label create "frontend" --description "Frontend/React" --color "61dafb" --repo $REPO || true
gh label create "backend" --description "Backend/Electron" --color "47848f" --repo $REPO || true
gh label create "ui-ux" --description "Interface e experiência" --color "ff69b4" --repo $REPO || true
gh label create "performance" --description "Performance e otimização" --color "ff6600" --repo $REPO || true

# Labels por status
gh label create "needs-triage" --description "Precisa ser analisado" --color "fbca04" --repo $REPO || true
gh label create "good-first-issue" --description "Boa para começar" --color "7057ff" --repo $REPO || true
gh label create "help-wanted" --description "Ajuda bem-vinda" --color "008672" --repo $REPO || true

# Labels para sprints
gh label create "sprint:current" --description "Sprint atual" --color "0052cc" --repo $REPO || true
gh label create "sprint:next" --description "Próximo sprint" --color "5319e7" --repo $REPO || true
gh label create "sprint:backlog" --description "Product backlog" --color "c5def5" --repo $REPO || true

# Story points
gh label create "story-points:1" --description "1 ponto (XS)" --color "bfe5bf" --repo $REPO || true
gh label create "story-points:2" --description "2 pontos (S)" --color "9fdb9f" --repo $REPO || true
gh label create "story-points:3" --description "3 pontos (M)" --color "7fc97f" --repo $REPO || true
gh label create "story-points:5" --description "5 pontos (L)" --color "5fb85f" --repo $REPO || true
gh label create "story-points:8" --description "8 pontos (XL)" --color "3fa73f" --repo $REPO || true

echo "🎯 Criando milestones..."

# Milestone v1.1.0
gh api repos/$REPO/milestones \
  --method POST \
  --field title='v1.1.0 - Electron Native Features' \
  --field description='Implementar recursos nativos do Electron para melhor experiência desktop' \
  --field due_on='2025-02-28T23:59:59Z' \
  --field state='open' || true

# Milestone v1.2.0
gh api repos/$REPO/milestones \
  --method POST \
  --field title='v1.2.0 - Desktop UX Excellence' \
  --field description='Melhorar experiência do usuário com recursos desktop avançados' \
  --field due_on='2025-03-31T23:59:59Z' \
  --field state='open' || true

# Milestone v1.3.0
gh api repos/$REPO/milestones \
  --method POST \
  --field title='v1.3.0 - Analytics & Monitoring' \
  --field description='Implementar analytics avançados e monitoramento em tempo real' \
  --field due_on='2025-04-30T23:59:59Z' \
  --field state='open' || true

echo "📊 Criando GitHub Project..."

# Criar project board
PROJECT_ID=$(gh api graphql -f query='
  mutation {
    createProjectV2(input: {
      ownerId: "MDQ6VXNlcjEyMzQ1Njc4OQ=="
      title: "xSendMkt Development"
      repositoryId: "YOUR_REPO_ID"
    }) {
      projectV2 {
        id
        number
      }
    }
  }
' --jq '.data.createProjectV2.projectV2.number' 2>/dev/null || echo "1")

echo "🔧 Configurando branch protection..."

# Branch protection para main
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build","test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null || true

echo "📝 Criando issues iniciais..."

# Issue para SMTP Optimization
gh issue create \
  --title "[TASK] Optimize bulk SMTP import performance" \
  --body "## 📋 Descrição da Tarefa
Melhorar performance de importação em massa de configurações SMTP.

## 🔧 Detalhes Técnicos
- Implementar processamento em batches
- Adicionar cache para configurações válidas
- Otimizar validação de domínios
- Reduzir uso de memória

## ✅ Critérios de Aceitação
- [ ] Importação de 1000+ emails em menos de 2 minutos
- [ ] Uso de memória reduzido em 50%
- [ ] Progress tracking em tempo real
- [ ] Error handling robusto

## 📊 Estimativa: 8 story points" \
  --label "task,high-priority,performance,sprint:current,story-points:8" \
  --milestone "v1.1.0 - Electron Native Features" \
  --repo $REPO || true

# Issue para Memory Leaks
gh issue create \
  --title "[BUG] Fix memory leaks in sequential email sending" \
  --body "## 🐛 Descrição do Bug
Vazamentos de memória durante envio sequencial de emails em grande volume.

## 🔄 Passos para Reproduzir
1. Configurar campanha com 500+ emails
2. Iniciar envio sequencial
3. Monitorar uso de memória
4. Observar crescimento contínuo

## ✅ Comportamento Esperado
Memória deve permanecer estável durante todo o processo.

## ❌ Comportamento Atual
Memória cresce continuamente até causar lentidão.

## 🚨 Severidade: Alto
Impacta envios em grande volume." \
  --label "bug,high-priority,performance,sprint:current,story-points:5" \
  --milestone "v1.1.0 - Electron Native Features" \
  --repo $REPO || true

# Issue para Native Menu
gh issue create \
  --title "[FEATURE] Implement native Electron menu with keyboard shortcuts" \
  --body "## 🎯 Resumo da Feature
Implementar menu nativo do Electron com shortcuts de teclado.

## 💡 Motivação
Melhorar experiência desktop com navegação via teclado e ações rápidas.

## 📋 Descrição Detalhada
- Menu File: New Campaign, Open, Save, Exit
- Menu Edit: Undo, Redo, Cut, Copy, Paste
- Menu View: Toggle Sidebar, Fullscreen
- Menu Tools: SMTP Config, Settings, Test Connection
- Menu Help: About, Documentation

## ✅ Critérios de Aceitação
- [ ] Menu nativo funcional
- [ ] Shortcuts padrão (Ctrl+N, Ctrl+S, etc.)
- [ ] Ações conectadas às funcionalidades
- [ ] Funciona em Windows, macOS, Linux

## 🏷️ Prioridade: Alta
## 📊 Estimativa: 8 story points" \
  --label "enhancement,high-priority,frontend,sprint:current,story-points:8" \
  --milestone "v1.1.0 - Electron Native Features" \
  --repo $REPO || true

echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse: https://github.com/$REPO/projects"
echo "2. Configure as colunas do project board"
echo "3. Organize as issues criadas"
echo "4. Comece o desenvolvimento!"
echo ""
echo "🔗 Links úteis:"
echo "- Issues: https://github.com/$REPO/issues"
echo "- Milestones: https://github.com/$REPO/milestones"
echo "- Actions: https://github.com/$REPO/actions"
