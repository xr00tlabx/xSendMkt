# 🚀 Script PowerShell para configuração completa do GitHub Project Management
# Executar após o primeiro push do repositório

param(
    [string]$RepoOwner = "xr00tlabx",
    [string]$RepoName = "xSendMkt"
)

$REPO = "$RepoOwner/$RepoName"

Write-Host "🚀 Configurando GitHub Project Management para xSendMkt..." -ForegroundColor Green

# Verificar se GitHub CLI está instalado
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI não encontrado. Instale em: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Verificar autenticação
Write-Host "🔑 Verificando autenticação GitHub..." -ForegroundColor Yellow
try {
    gh auth status | Out-Null
}
catch {
    Write-Host "🔐 Fazendo login no GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "📋 Criando labels para organização..." -ForegroundColor Cyan

# Labels por tipo
$labels = @(
    @{name = "bug"; description = "Algo não está funcionando"; color = "d73a4a" },
    @{name = "enhancement"; description = "Nova funcionalidade ou melhoria"; color = "a2eeef" },
    @{name = "task"; description = "Tarefa de desenvolvimento"; color = "0e8a16" },
    @{name = "documentation"; description = "Melhorias na documentação"; color = "0075ca" },
    
    # Labels por prioridade
    @{name = "high-priority"; description = "Alta prioridade"; color = "ff0000" },
    @{name = "medium-priority"; description = "Prioridade média"; color = "ffcc00" },
    @{name = "low-priority"; description = "Baixa prioridade"; color = "00ff00" },
    
    # Labels por componente
    @{name = "frontend"; description = "Frontend/React"; color = "61dafb" },
    @{name = "backend"; description = "Backend/Electron"; color = "47848f" },
    @{name = "ui-ux"; description = "Interface e experiência"; color = "ff69b4" },
    @{name = "performance"; description = "Performance e otimização"; color = "ff6600" },
    
    # Labels por status
    @{name = "needs-triage"; description = "Precisa ser analisado"; color = "fbca04" },
    @{name = "good-first-issue"; description = "Boa para começar"; color = "7057ff" },
    @{name = "help-wanted"; description = "Ajuda bem-vinda"; color = "008672" },
    
    # Labels para sprints
    @{name = "sprint:current"; description = "Sprint atual"; color = "0052cc" },
    @{name = "sprint:next"; description = "Próximo sprint"; color = "5319e7" },
    @{name = "sprint:backlog"; description = "Product backlog"; color = "c5def5" },
    
    # Story points
    @{name = "story-points:1"; description = "1 ponto (XS)"; color = "bfe5bf" },
    @{name = "story-points:2"; description = "2 pontos (S)"; color = "9fdb9f" },
    @{name = "story-points:3"; description = "3 pontos (M)"; color = "7fc97f" },
    @{name = "story-points:5"; description = "5 pontos (L)"; color = "5fb85f" },
    @{name = "story-points:8"; description = "8 pontos (XL)"; color = "3fa73f" }
)

foreach ($label in $labels) {
    try {
        gh label create $label.name --description $label.description --color $label.color --repo $REPO
        Write-Host "✅ Label '$($label.name)' criado" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Label '$($label.name)' já existe" -ForegroundColor Yellow
    }
}

Write-Host "🎯 Criando milestones..." -ForegroundColor Cyan

# Milestones
$milestones = @(
    @{
        title       = "v1.1.0 - Electron Native Features"
        description = "Implementar recursos nativos do Electron para melhor experiência desktop"
        due_on      = "2025-02-28T23:59:59Z"
    },
    @{
        title       = "v1.2.0 - Desktop UX Excellence"
        description = "Melhorar experiência do usuário com recursos desktop avançados"
        due_on      = "2025-03-31T23:59:59Z"
    },
    @{
        title       = "v1.3.0 - Analytics & Monitoring"
        description = "Implementar analytics avançados e monitoramento em tempo real"
        due_on      = "2025-04-30T23:59:59Z"
    }
)

foreach ($milestone in $milestones) {
    try {
        $createArgs = @(
            "api", "repos/$REPO/milestones",
            "--method", "POST",
            "--field", "title=$($milestone.title)",
            "--field", "description=$($milestone.description)",
            "--field", "due_on=$($milestone.due_on)",
            "--field", "state=open"
        )
        
        & gh @createArgs
        Write-Host "✅ Milestone '$($milestone.title)' criado" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Milestone '$($milestone.title)' já existe" -ForegroundColor Yellow
    }
}

Write-Host "📝 Criando issues iniciais..." -ForegroundColor Cyan

# Issue para SMTP Optimization
$smtpIssueBody = @"
## 📋 Descrição da Tarefa
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

## 📊 Estimativa: 8 story points
"@

try {
    gh issue create --title "[TASK] Optimize bulk SMTP import performance" --body $smtpIssueBody --label "task,high-priority,performance,sprint:current,story-points:8" --milestone "v1.1.0 - Electron Native Features" --repo $REPO
    Write-Host "✅ Issue SMTP optimization criada" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Issue SMTP optimization pode já existir" -ForegroundColor Yellow
}

# Issue para Memory Leaks
$memoryIssueBody = @"
## 🐛 Descrição do Bug
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
Impacta envios em grande volume.
"@

try {
    gh issue create --title "[BUG] Fix memory leaks in sequential email sending" --body $memoryIssueBody --label "bug,high-priority,performance,sprint:current,story-points:5" --milestone "v1.1.0 - Electron Native Features" --repo $REPO
    Write-Host "✅ Issue memory leaks criada" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Issue memory leaks pode já existir" -ForegroundColor Yellow
}

# Issue para Native Menu
$menuIssueBody = @"
## 🎯 Resumo da Feature
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
## 📊 Estimativa: 8 story points
"@

try {
    gh issue create --title "[FEATURE] Implement native Electron menu with keyboard shortcuts" --body $menuIssueBody --label "enhancement,high-priority,frontend,sprint:current,story-points:8" --milestone "v1.1.0 - Electron Native Features" --repo $REPO
    Write-Host "✅ Issue native menu criada" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Issue native menu pode já existir" -ForegroundColor Yellow
}

Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://github.com/$REPO/projects"
Write-Host "2. Configure as colunas do project board"
Write-Host "3. Organize as issues criadas"
Write-Host "4. Comece o desenvolvimento!"
Write-Host ""
Write-Host "🔗 Links úteis:" -ForegroundColor Cyan
Write-Host "- Issues: https://github.com/$REPO/issues"
Write-Host "- Milestones: https://github.com/$REPO/milestones"
Write-Host "- Actions: https://github.com/$REPO/actions"
