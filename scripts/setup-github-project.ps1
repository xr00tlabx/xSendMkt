# GitHub Project Management Setup Script for xSendMkt
# Run this after first push to repository

param(
    [string]$RepoOwner = "xr00tlabx",
    [string]$RepoName = "xSendMkt"
)

$REPO = "$RepoOwner/$RepoName"

Write-Host "🚀 Setting up GitHub Project Management for xSendMkt..." -ForegroundColor Green

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check authentication
Write-Host "🔑 Checking GitHub authentication..." -ForegroundColor Yellow
try {
    gh auth status | Out-Null
    Write-Host "✅ GitHub authentication OK" -ForegroundColor Green
}
catch {
    Write-Host "🔐 Please login to GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "📋 Creating labels for organization..." -ForegroundColor Cyan

# Create labels
$labels = @(
    @{name = "bug"; description = "Something is not working"; color = "d73a4a" },
    @{name = "enhancement"; description = "New feature or improvement"; color = "a2eeef" },
    @{name = "task"; description = "Development task"; color = "0e8a16" },
    @{name = "documentation"; description = "Documentation improvements"; color = "0075ca" },
    @{name = "high-priority"; description = "High priority"; color = "ff0000" },
    @{name = "medium-priority"; description = "Medium priority"; color = "ffcc00" },
    @{name = "low-priority"; description = "Low priority"; color = "00ff00" },
    @{name = "frontend"; description = "Frontend/React"; color = "61dafb" },
    @{name = "backend"; description = "Backend/Electron"; color = "47848f" },
    @{name = "ui-ux"; description = "Interface and experience"; color = "ff69b4" },
    @{name = "performance"; description = "Performance optimization"; color = "ff6600" },
    @{name = "needs-triage"; description = "Needs to be analyzed"; color = "fbca04" },
    @{name = "good-first-issue"; description = "Good for beginners"; color = "7057ff" },
    @{name = "help-wanted"; description = "Help welcome"; color = "008672" },
    @{name = "sprint:current"; description = "Current sprint"; color = "0052cc" },
    @{name = "sprint:next"; description = "Next sprint"; color = "5319e7" },
    @{name = "sprint:backlog"; description = "Product backlog"; color = "c5def5" },
    @{name = "story-points:1"; description = "1 point (XS)"; color = "bfe5bf" },
    @{name = "story-points:2"; description = "2 points (S)"; color = "9fdb9f" },
    @{name = "story-points:3"; description = "3 points (M)"; color = "7fc97f" },
    @{name = "story-points:5"; description = "5 points (L)"; color = "5fb85f" },
    @{name = "story-points:8"; description = "8 points (XL)"; color = "3fa73f" }
)

$labelCount = 0
foreach ($label in $labels) {
    try {
        gh label create $label.name --description $label.description --color $label.color --repo $REPO 2>$null
        Write-Host "  ✅ Label '$($label.name)' created" -ForegroundColor Green
        $labelCount++
    }
    catch {
        Write-Host "  ⚠️ Label '$($label.name)' already exists" -ForegroundColor Yellow
    }
}
Write-Host "📊 Labels processed: $labelCount created" -ForegroundColor Cyan

Write-Host "🎯 Creating milestones..." -ForegroundColor Cyan

# Create milestones
$milestones = @(
    @{
        title       = "v1.1.0 - Electron Native Features"
        description = "Implement native Electron features for better desktop experience"
        due_on      = "2025-02-28T23:59:59Z"
    },
    @{
        title       = "v1.2.0 - Desktop UX Excellence"
        description = "Improve user experience with advanced desktop features"
        due_on      = "2025-03-31T23:59:59Z"
    },
    @{
        title       = "v1.3.0 - Analytics & Monitoring"
        description = "Implement advanced analytics and real-time monitoring"
        due_on      = "2025-04-30T23:59:59Z"
    }
)

$milestoneCount = 0
foreach ($milestone in $milestones) {
    try {
        gh api repos/$REPO/milestones --method POST --field title="$($milestone.title)" --field description="$($milestone.description)" --field due_on="$($milestone.due_on)" --field state=open 2>$null | Out-Null
        Write-Host "  ✅ Milestone '$($milestone.title)' created" -ForegroundColor Green
        $milestoneCount++
    }
    catch {
        Write-Host "  ⚠️ Milestone '$($milestone.title)' already exists or error creating" -ForegroundColor Yellow
    }
}
Write-Host "📊 Milestones processed: $milestoneCount created" -ForegroundColor Cyan

Write-Host "📝 Creating initial issues..." -ForegroundColor Cyan

# Function to create issues safely
function New-GitHubIssue {
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
        Write-Host "  ✅ Issue '$Title' created" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ⚠️ Issue '$Title' may already exist or error creating" -ForegroundColor Yellow
        return $false
    }
}

# Issue 1: SMTP Optimization
$smtpTitle = "[TASK] Optimize bulk SMTP import performance"
$smtpBody = "## Task Description`nImprove performance of bulk SMTP configuration import.`n`n## Technical Details`n- Implement batch processing`n- Add cache for valid configurations`n- Optimize domain validation`n- Reduce memory usage`n`n## Acceptance Criteria`n- Import 1000+ emails in less than 2 minutes`n- Memory usage reduced by 50%`n- Real-time progress tracking`n- Robust error handling`n`n## Estimate: 8 story points"
$result1 = New-GitHubIssue -Title $smtpTitle -Body $smtpBody -Labels "task,high-priority,performance,sprint:current,story-points:8" -Milestone "v1.1.0 - Electron Native Features"

# Issue 2: Memory Leaks  
$memoryTitle = "[BUG] Fix memory leaks in sequential email sending"
$memoryBody = "## Bug Description`nMemory leaks during sequential email sending in large volumes.`n`n## Steps to Reproduce`n1. Configure campaign with 500+ emails`n2. Start sequential sending`n3. Monitor memory usage`n4. Observe continuous growth`n`n## Expected Behavior`nMemory should remain stable throughout the process.`n`n## Actual Behavior`nMemory grows continuously until causing slowdown.`n`n## Severity: High`nImpacts large volume sending."
$result2 = New-GitHubIssue -Title $memoryTitle -Body $memoryBody -Labels "bug,high-priority,performance,sprint:current,story-points:5" -Milestone "v1.1.0 - Electron Native Features"

# Issue 3: Native Menu
$menuTitle = "[FEATURE] Implement native Electron menu with keyboard shortcuts"
$menuBody = "## Feature Summary`nImplement native Electron menu with keyboard shortcuts.`n`n## Motivation`nImprove desktop experience with keyboard navigation and quick actions.`n`n## Detailed Description`n- File Menu: New Campaign, Open, Save, Exit`n- Edit Menu: Undo, Redo, Cut, Copy, Paste`n- View Menu: Toggle Sidebar, Fullscreen`n- Tools Menu: SMTP Config, Settings, Test Connection`n- Help Menu: About, Documentation`n`n## Acceptance Criteria`n- Functional native menu`n- Standard shortcuts (Ctrl+N, Ctrl+S, etc.)`n- Actions connected to functionalities`n- Works on Windows, macOS, Linux`n`n## Priority: High`n## Estimate: 8 story points"
$result3 = New-GitHubIssue -Title $menuTitle -Body $menuBody -Labels "enhancement,high-priority,frontend,sprint:current,story-points:8" -Milestone "v1.1.0 - Electron Native Features"

$issuesCreated = @($result1, $result2, $result3) | Where-Object { $_ -eq $true }
Write-Host "📊 Issues processed: $($issuesCreated.Count) created" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://github.com/$REPO/projects"
Write-Host "2. Configure project board columns"
Write-Host "3. Organize created issues"
Write-Host "4. Start development!"
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Cyan
Write-Host "- Issues: https://github.com/$REPO/issues"
Write-Host "- Milestones: https://github.com/$REPO/milestones"
Write-Host "- Actions: https://github.com/$REPO/actions"
Write-Host "- Project Board: https://github.com/$REPO/projects"