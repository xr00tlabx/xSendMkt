# GitHub Project Management Setup Script for xSendMkt
# Simple version without complex strings

param(
    [string]$RepoOwner = "xr00tlabx",
    [string]$RepoName = "xSendMkt"
)

$REPO = "$RepoOwner/$RepoName"

Write-Host "Setting up GitHub Project Management for xSendMkt..." -ForegroundColor Green

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check authentication
Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
try {
    gh auth status | Out-Null
    Write-Host "GitHub authentication OK" -ForegroundColor Green
}
catch {
    Write-Host "Please login to GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host "Creating labels..." -ForegroundColor Cyan

# Create essential labels
$labels = @(
    "bug|Something is not working|d73a4a",
    "enhancement|New feature or improvement|a2eeef",
    "task|Development task|0e8a16",
    "high-priority|High priority|ff0000",
    "medium-priority|Medium priority|ffcc00",
    "frontend|Frontend/React|61dafb",
    "backend|Backend/Electron|47848f",
    "performance|Performance optimization|ff6600",
    "sprint:current|Current sprint|0052cc",
    "story-points:5|5 points (L)|5fb85f",
    "story-points:8|8 points (XL)|3fa73f"
)

foreach ($labelData in $labels) {
    $parts = $labelData -split '\|'
    $name = $parts[0]
    $description = $parts[1]
    $color = $parts[2]
    
    try {
        gh label create $name --description $description --color $color --repo $REPO 2>$null
        Write-Host "Label '$name' created" -ForegroundColor Green
    }
    catch {
        Write-Host "Label '$name' already exists" -ForegroundColor Yellow
    }
}

Write-Host "Creating milestones..." -ForegroundColor Cyan

# Create milestone
try {
    gh api repos/$REPO/milestones --method POST --field title="v1.1.0 - Electron Native Features" --field description="Implement native Electron features" --field due_on="2025-02-28T23:59:59Z" --field state=open 2>$null | Out-Null
    Write-Host "Milestone 'v1.1.0' created" -ForegroundColor Green
}
catch {
    Write-Host "Milestone may already exist" -ForegroundColor Yellow
}

Write-Host "Creating initial issues..." -ForegroundColor Cyan

# Issue 1
$title1 = "[TASK] Optimize bulk SMTP import performance"
$body1 = "Improve performance of bulk SMTP configuration import. Target: import 1000+ emails in less than 2 minutes with 50% less memory usage."

try {
    gh issue create --title $title1 --body $body1 --label "task,high-priority,performance,sprint:current,story-points:8" --milestone "v1.1.0 - Electron Native Features" --repo $REPO 2>$null | Out-Null
    Write-Host "Issue 1 created: SMTP Optimization" -ForegroundColor Green
}
catch {
    Write-Host "Issue 1 may already exist" -ForegroundColor Yellow
}

# Issue 2
$title2 = "[BUG] Fix memory leaks in sequential email sending"
$body2 = "Memory leaks during sequential email sending in large volumes. Memory grows continuously until causing slowdown."

try {
    gh issue create --title $title2 --body $body2 --label "bug,high-priority,performance,sprint:current,story-points:5" --milestone "v1.1.0 - Electron Native Features" --repo $REPO 2>$null | Out-Null
    Write-Host "Issue 2 created: Memory Leaks" -ForegroundColor Green
}
catch {
    Write-Host "Issue 2 may already exist" -ForegroundColor Yellow
}

# Issue 3
$title3 = "[FEATURE] Implement native Electron menu with keyboard shortcuts"
$body3 = "Implement native Electron menu with keyboard shortcuts. Include File, Edit, View, Tools, and Help menus with standard shortcuts."

try {
    gh issue create --title $title3 --body $body3 --label "enhancement,high-priority,frontend,sprint:current,story-points:8" --milestone "v1.1.0 - Electron Native Features" --repo $REPO 2>$null | Out-Null
    Write-Host "Issue 3 created: Native Menu" -ForegroundColor Green
}
catch {
    Write-Host "Issue 3 may already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://github.com/$REPO/projects"
Write-Host "2. Configure project board"
Write-Host "3. Start development!"
Write-Host ""
Write-Host "Useful links:" -ForegroundColor Cyan
Write-Host "- Issues: https://github.com/$REPO/issues"
Write-Host "- Milestones: https://github.com/$REPO/milestones"
