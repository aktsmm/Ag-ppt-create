<# 
.SYNOPSIS
    Analyze and ensure required slide layouts exist in a PowerPoint file.
    
.DESCRIPTION
    Uses PowerPoint COM to analyze slide masters and add missing layouts.
    
.PARAMETER InputPath
    Path to the PowerPoint file to analyze/modify.
    
.PARAMETER AddMissing
    If specified, adds missing standard layouts to the presentation.
    
.EXAMPLE
    .\ensure_layouts.ps1 -InputPath "templates\mytemplate.pptx"
    .\ensure_layouts.ps1 -InputPath "templates\mytemplate.pptx" -AddMissing
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    
    [switch]$AddMissing,
    
    [switch]$ShowUI
)

# Resolve full path
$InputPath = (Resolve-Path $InputPath -ErrorAction Stop).Path

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PowerPoint Layout Analyzer" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Required layout types for this toolkit
$RequiredLayouts = @{
    "title" = @("Title Slide", "タイトル スライド", "タイトルスライド")
    "content" = @("Title and Content", "タイトルとコンテンツ", "Title & Content")
    "section" = @("Section Header", "セクション見出し", "Section Title", "Section Divider")
    "two_content" = @("Two Content", "2つのコンテンツ", "Comparison", "Two Column", "2 つのコンテンツ")
    "blank" = @("Blank", "白紙")
    "agenda" = @("Agenda", "アジェンダ", "目次")
    "closing" = @("Closing", "クロージング", "End Slide")
}

$ppt = $null
$presentation = $null

try {
    # Start PowerPoint
    Write-Host "Starting PowerPoint..." -ForegroundColor Yellow
    $ppt = New-Object -ComObject PowerPoint.Application
    
    if ($ShowUI) {
        $ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
    }
    
    # Open presentation
    Write-Host "Opening: $InputPath" -ForegroundColor Yellow
    $presentation = $ppt.Presentations.Open($InputPath, $false, $false, $ShowUI ? $true : $false)
    
    Write-Host "`n--- Slide Masters ---" -ForegroundColor Green
    Write-Host "Found $($presentation.SlideMaster.CustomLayouts.Count + $presentation.Designs.Count) design(s)`n"
    
    # Analyze each slide master
    $masterIndex = 0
    $allLayouts = @()
    
    foreach ($design in $presentation.Designs) {
        $masterIndex++
        $master = $design.SlideMaster
        Write-Host "Master $masterIndex`: $($design.Name)" -ForegroundColor Cyan
        
        $layoutIndex = 0
        foreach ($layout in $master.CustomLayouts) {
            $layoutIndex++
            $layoutName = $layout.Name
            $placeholderCount = $layout.Shapes.Placeholders.Count
            
            Write-Host "  [$layoutIndex] $layoutName (Placeholders: $placeholderCount)"
            
            $allLayouts += @{
                MasterIndex = $masterIndex
                LayoutIndex = $layoutIndex
                Name = $layoutName
                PlaceholderCount = $placeholderCount
                Layout = $layout
            }
        }
        Write-Host ""
    }
    
    # Check for required layouts
    Write-Host "--- Layout Check ---" -ForegroundColor Green
    $missingLayouts = @()
    
    foreach ($required in $RequiredLayouts.GetEnumerator()) {
        $type = $required.Key
        $keywords = $required.Value
        
        $found = $false
        $foundName = ""
        
        foreach ($layout in $allLayouts) {
            foreach ($keyword in $keywords) {
                if ($layout.Name -like "*$keyword*") {
                    $found = $true
                    $foundName = $layout.Name
                    break
                }
            }
            if ($found) { break }
        }
        
        if ($found) {
            Write-Host "  [OK] $type`: $foundName" -ForegroundColor Green
        } else {
            Write-Host "  [MISSING] $type" -ForegroundColor Red
            $missingLayouts += $type
        }
    }
    
    # Add missing layouts if requested
    if ($AddMissing -and $missingLayouts.Count -gt 0) {
        Write-Host "`n--- Adding Missing Layouts ---" -ForegroundColor Yellow
        
        $master = $presentation.Designs[1].SlideMaster
        
        foreach ($missing in $missingLayouts) {
            Write-Host "  Adding: $missing" -ForegroundColor Yellow
            
            # ppLayoutType enumeration
            $layoutType = switch ($missing) {
                "title" { 1 }        # ppLayoutTitle
                "content" { 2 }      # ppLayoutText (Title and Content)
                "section" { 11 }     # ppLayoutSectionHeader
                "two_content" { 4 }  # ppLayoutTwoColumnText
                "blank" { 12 }       # ppLayoutBlank
                default { 2 }
            }
            
            try {
                # Add custom layout based on type
                $newLayout = $master.CustomLayouts.Add($master.CustomLayouts.Count + 1)
                $newLayout.Name = "$missing (auto-generated)"
                
                # Add placeholders based on type
                switch ($missing) {
                    "title" {
                        # Title placeholder
                        $titleShape = $newLayout.Shapes.AddPlaceholder(1, 0.5 * 72, 2 * 72, 12 * 72, 1.5 * 72)  # ppPlaceholderTitle
                        # Subtitle placeholder
                        $subtitleShape = $newLayout.Shapes.AddPlaceholder(2, 0.5 * 72, 4 * 72, 12 * 72, 1 * 72)  # ppPlaceholderSubtitle
                    }
                    "content" {
                        # Title placeholder
                        $titleShape = $newLayout.Shapes.AddPlaceholder(1, 0.5 * 72, 0.3 * 72, 12 * 72, 1 * 72)
                        # Body placeholder
                        $bodyShape = $newLayout.Shapes.AddPlaceholder(2, 0.5 * 72, 1.5 * 72, 12 * 72, 5 * 72)  # ppPlaceholderBody
                    }
                    "section" {
                        # Section title
                        $titleShape = $newLayout.Shapes.AddPlaceholder(1, 0.5 * 72, 2.5 * 72, 12 * 72, 1.5 * 72)
                    }
                    "blank" {
                        # No placeholders for blank
                    }
                }
                
                Write-Host "    Created: $($newLayout.Name)" -ForegroundColor Green
            }
            catch {
                Write-Host "    Failed to add $missing`: $_" -ForegroundColor Red
            }
        }
        
        # Save
        Write-Host "`nSaving changes..." -ForegroundColor Yellow
        $presentation.Save()
        Write-Host "Saved: $InputPath" -ForegroundColor Green
    }
    elseif ($missingLayouts.Count -gt 0) {
        Write-Host "`nTo add missing layouts, run with -AddMissing flag" -ForegroundColor Yellow
    }
    else {
        Write-Host "`nAll required layouts present!" -ForegroundColor Green
    }
    
    # Output summary
    Write-Host "`n--- Summary ---" -ForegroundColor Cyan
    Write-Host "Total layouts: $($allLayouts.Count)"
    Write-Host "Missing layouts: $($missingLayouts.Count)"
    
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
}
finally {
    # Cleanup
    if ($presentation) {
        $presentation.Close()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
    }
    if ($ppt) {
        $ppt.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
    Write-Host "`nPowerPoint closed." -ForegroundColor Gray
}
