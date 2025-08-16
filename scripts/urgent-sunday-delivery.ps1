# URGENT: Update milestone dates for Sunday delivery
# Data atual: 16 Agosto 2025
# Entrega: Domingo (18 Agosto 2025)

param(
    [string]$RepoOwner = "xr00tlabx",
    [string]$RepoName = "xSendMkt"
)

$REPO = "$RepoOwner/$RepoName"

Write-Host "🚨 URGENT: Updating milestone dates for Sunday delivery..." -ForegroundColor Red

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Updating milestone v1.1.0 for Sunday delivery..." -ForegroundColor Yellow

# Get milestone number
$milestones = gh api repos/$REPO/milestones | ConvertFrom-Json
$milestone = $milestones | Where-Object { $_.title -eq "v1.1.0 - Electron Native Features" }

if ($milestone) {
    $milestoneNumber = $milestone.number
    Write-Host "Found milestone #$milestoneNumber" -ForegroundColor Green
    
    # Update to Sunday (18 August 2025)
    $newDueDate = "2025-08-18T23:59:59Z"
    
    try {
        gh api repos/$REPO/milestones/$milestoneNumber --method PATCH --field due_on="$newDueDate" --field description="URGENT DELIVERY: Core features for Sunday deadline" | Out-Null
        Write-Host "✅ Milestone updated - Due: Sunday, August 18, 2025" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error updating milestone" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Milestone not found!" -ForegroundColor Red
}

Write-Host "📋 Creating URGENT sprint issues for Sunday delivery..." -ForegroundColor Yellow

# Critical issues for Sunday delivery
$urgentIssues = @(
    @{
        title = "[URGENT] Core email sending functionality - SUNDAY DELIVERY"
        body = "🚨 URGENT FOR SUNDAY DELIVERY`n`nEnsure core email sending functionality is working:`n- Basic SMTP configuration`n- Single email sending`n- Basic error handling`n- Simple UI for email composition`n`nThis is the MINIMUM VIABLE PRODUCT for Sunday delivery."
        labels = "task,high-priority,sprint:current,story-points:8"
        milestone = "v1.1.0 - Electron Native Features"
    },
    @{
        title = "[URGENT] Email list management - SUNDAY DELIVERY"
        body = "🚨 URGENT FOR SUNDAY DELIVERY`n`nBasic email list functionality:`n- Import email lists from CSV/TXT`n- Display email lists in UI`n- Select recipients for sending`n- Basic validation`n`nRequired for Sunday demo."
        labels = "task,high-priority,sprint:current,story-points:5"
        milestone = "v1.1.0 - Electron Native Features"
    },
    @{
        title = "[URGENT] Basic UI/UX polish - SUNDAY DELIVERY"
        body = "🚨 URGENT FOR SUNDAY DELIVERY`n`nMinimal UI improvements for presentation:`n- Clean up main interface`n- Fix any visual glitches`n- Ensure responsive design works`n- Basic error messages`n`nMust look professional for Sunday."
        labels = "task,frontend,ui-ux,sprint:current,story-points:3"
        milestone = "v1.1.0 - Electron Native Features"
    }
)

foreach ($issue in $urgentIssues) {
    try {
        gh issue create --title $issue.title --body $issue.body --label $issue.labels --milestone $issue.milestone --repo $REPO 2>$null | Out-Null
        Write-Host "✅ Created: $($issue.title)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Issue may already exist: $($issue.title)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 SUNDAY DELIVERY PLAN CREATED!" -ForegroundColor Green
Write-Host ""
Write-Host "📅 Timeline:" -ForegroundColor Cyan
Write-Host "- Today (Friday): Core email sending + list management"
Write-Host "- Saturday: UI polish + testing"
Write-Host "- Sunday: Final delivery + demo preparation"
Write-Host ""
Write-Host "🔗 Check your issues: https://github.com/$REPO/issues" -ForegroundColor Cyan
Write-Host "🎯 Milestone: https://github.com/$REPO/milestones" -ForegroundColor Cyan
Write-Host ""
Write-Host "TIME IS CRITICAL! Focus on MVP features only." -ForegroundColor Red
