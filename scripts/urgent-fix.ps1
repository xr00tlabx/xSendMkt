# URGENT: Update milestone for Sunday delivery
param(
    [string]$RepoOwner = "xr00tlabx",
    [string]$RepoName = "xSendMkt"
)

$REPO = "$RepoOwner/$RepoName"

Write-Host "URGENT: Updating milestone for Sunday delivery..." -ForegroundColor Red

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
        Write-Host "Milestone updated - Due: Sunday, August 18, 2025" -ForegroundColor Green
    } catch {
        Write-Host "Error updating milestone" -ForegroundColor Red
    }
} else {
    Write-Host "Milestone not found!" -ForegroundColor Red
}

Write-Host "Creating urgent issues..." -ForegroundColor Yellow

# Critical issue 1
$title1 = "[URGENT] Core email sending - SUNDAY DELIVERY"
$body1 = "URGENT FOR SUNDAY: Core email sending functionality must work. Basic SMTP config, single email sending, error handling, simple UI."

try {
    gh issue create --title $title1 --body $body1 --label "task,high-priority,sprint:current" --milestone "v1.1.0 - Electron Native Features" --repo $REPO 2>$null | Out-Null
    Write-Host "Created urgent issue: Core email sending" -ForegroundColor Green
} catch {
    Write-Host "Issue may already exist" -ForegroundColor Yellow
}

# Critical issue 2
$title2 = "[URGENT] Email list management - SUNDAY DELIVERY" 
$body2 = "URGENT FOR SUNDAY: Basic email list import from CSV, display lists, select recipients, basic validation."

try {
    gh issue create --title $title2 --body $body2 --label "task,high-priority,sprint:current" --milestone "v1.1.0 - Electron Native Features" --repo $REPO 2>$null | Out-Null
    Write-Host "Created urgent issue: Email lists" -ForegroundColor Green
} catch {
    Write-Host "Issue may already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SUNDAY DELIVERY PLAN:" -ForegroundColor Green
Write-Host "- Today: Core email sending + lists"
Write-Host "- Saturday: UI polish + testing" 
Write-Host "- Sunday: Delivery"
Write-Host ""
Write-Host "Check issues: https://github.com/$REPO/issues" -ForegroundColor Cyan
