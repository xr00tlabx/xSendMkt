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
} catch {
    Write-Host "🔐 Fazendo login no GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "📋 Criando labels para organização..." -ForegroundColor Cyan

# Labels por tipo
$labels = @(
    @{name="bug"; description="Algo não está funcionando"; color="d73a4a"},
    @{name="enhancement"; description="Nova funcionalidade ou melhoria"; color="a2eeef"},
    @{name="task"; description="Tarefa de desenvolvimento"; color="0e8a16"},
    @{name="documentation"; description="Melhorias na documentação"; color="0075ca"},
    
    # Labels por prioridade
    @{name="high-priority"; description="Alta prioridade"; color="ff0000"},
    @{name="medium-priority"; description="Prioridade média"; color="ffcc00"},
    @{name="low-priority"; description="Baixa prioridade"; color="00ff00"},
    
    # Labels por componente
    @{name="frontend"; description="Frontend/React"; color="61dafb"},
    @{name="backend"; description="Backend/Electron"; color="47848f"},
    @{name="ui-ux"; description="Interface e experiência"; color="ff69b4"},
    @{name="performance"; description="Performance e otimização"; color="ff6600"},
    
    # Labels por status
    @{name="needs-triage"; description="Precisa ser analisado"; color="fbca04"},
    @{name="good-first-issue"; description="Boa para começar"; color="7057ff"},
    @{name="help-wanted"; description="Ajuda bem-vinda"; color="008672"},
    
    # Labels para sprints
    @{name="sprint:current"; description="Sprint atual"; color="0052cc"},
    @{name="sprint:next"; description="Próximo sprint"; color="5319e7"},
    @{name="sprint:backlog"; description="Product backlog"; color="c5def5"},
    
    # Story points
    @{name="story-points:1"; description="1 ponto (XS)"; color="bfe5bf"},
    @{name="story-points:2"; description="2 pontos (S)"; color="9fdb9f"},
    @{name="story-points:3"; description="3 pontos (M)"; color="7fc97f"},
    @{name="story-points:5"; description="5 pontos (L)"; color="5fb85f"},
    @{name="story-points:8"; description="8 pontos (XL)"; color="3fa73f"}
)

foreach ($label in $labels) {
    try {
        gh label create $label.name --description $label.description --color $label.color --repo $REPO 2>$null
        Write-Host "✅ Label '$($label.name)' criado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Label '$($label.name)' já existe" -ForegroundColor Yellow
    }
}

Write-Host "🎯 Criando milestones..." -ForegroundColor Cyan

# Milestones
$milestones = @(
    @{
        title="v1.1.0 - Electron Native Features"
        description="Implementar recursos nativos do Electron para melhor experiência desktop"
        due_on="2025-02-28T23:59:59Z"
    },
    @{
        title="v1.2.0 - Desktop UX Excellence"
        description="Melhorar experiência do usuário com recursos desktop avançados"
        due_on="2025-03-31T23:59:59Z"
    },
    @{
        title="v1.3.0 - Analytics & Monitoring"
        description="Implementar analytics avançados e monitoramento em tempo real"
        due_on="2025-04-30T23:59:59Z"
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
        
        gh @createArgs 2>$null | Out-Null
        Write-Host "✅ Milestone '$($milestone.title)' criado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Milestone '$($milestone.title)' já existe ou erro ao criar" -ForegroundColor Yellow
    }
}

Write-Host "📝 Criando issues iniciais..." -ForegroundColor Cyan

# Função para criar issues de forma segura
function Create-Issue {
    param(
        [string]$Title,
        [string]$Body,
        [string]$Labels,
        [string]$Milestone
    )
    
    try {
        $issueArgs = @(
            "issue", "create",
            "--title", $Title,
            "--body", $Body,
            "--repo", $REPO
        )
        
        if ($Labels) {
            $issueArgs += "--label"
            $issueArgs += $Labels
        }
        
        if ($Milestone) {
            $issueArgs += "--milestone"
            $issueArgs += $Milestone
        }
        
        gh @issueArgs 2>$null | Out-Null
        Write-Host "✅ Issue '$Title' criada" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "⚠️ Issue '$Title' pode já existir ou erro ao criar" -ForegroundColor Yellow
        return $false
    }
}

# Issue 1: SMTP Optimization
$smtpTitle = "[TASK] Optimize bulk SMTP import performance"
$smtpBody = "## Descrição da Tarefa`nMelhorar performance de importação em massa de configurações SMTP.`n`n## Detalhes Técnicos`n* Implementar processamento em batches`n* Adicionar cache para configurações válidas`n* Otimizar validação de domínios`n* Reduzir uso de memória`n`n## Critérios de Aceitação`n* Importação de 1000+ emails em menos de 2 minutos`n* Uso de memória reduzido em 50%`n* Progress tracking em tempo real`n* Error handling robusto`n`n## Estimativa: 8 story points"
Create-Issue -Title $smtpTitle -Body $smtpBody -Labels "task,high-priority,performance,sprint:current,story-points:8" -Milestone "v1.1.0 - Electron Native Features"

# Issue 2: Memory Leaks  
$memoryTitle = "[BUG] Fix memory leaks in sequential email sending"
$memoryBody = "## Descrição do Bug`nVazamentos de memória durante envio sequencial de emails em grande volume.`n`n## Passos para Reproduzir`n1. Configurar campanha com 500+ emails`n2. Iniciar envio sequencial`n3. Monitorar uso de memória`n4. Observar crescimento contínuo`n`n## Comportamento Esperado`nMemória deve permanecer estável durante todo o processo.`n`n## Comportamento Atual`nMemória cresce continuamente até causar lentidão.`n`n## Severidade: Alto`nImpacta envios em grande volume."
Create-Issue -Title $memoryTitle -Body $memoryBody -Labels "bug,high-priority,performance,sprint:current,story-points:5" -Milestone "v1.1.0 - Electron Native Features"

# Issue 3: Native Menu
$menuTitle = "[FEATURE] Implement native Electron menu with keyboard shortcuts"
$menuBody = "## Resumo da Feature`nImplementar menu nativo do Electron com shortcuts de teclado.`n`n## Motivação`nMelhorar experiência desktop com navegação via teclado e ações rápidas.`n`n## Descrição Detalhada`n* Menu File: New Campaign, Open, Save, Exit`n* Menu Edit: Undo, Redo, Cut, Copy, Paste`n* Menu View: Toggle Sidebar, Fullscreen`n* Menu Tools: SMTP Config, Settings, Test Connection`n* Menu Help: About, Documentation`n`n## Critérios de Aceitação`n* Menu nativo funcional`n* Shortcuts padrão (Ctrl+N, Ctrl+S, etc.)`n* Ações conectadas às funcionalidades`n* Funciona em Windows, macOS, Linux`n`n## Prioridade: Alta`n## Estimativa: 8 story points"
Create-Issue -Title $menuTitle -Body $menuBody -Labels "enhancement,high-priority,frontend,sprint:current,story-points:8" -Milestone "v1.1.0 - Electron Native Features"

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
