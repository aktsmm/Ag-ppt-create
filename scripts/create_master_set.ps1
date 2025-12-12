<# 
.SYNOPSIS
    Create a complete slide master set by cloning and adapting existing layouts.
    
.DESCRIPTION
    Analyzes existing PowerPoint file, finds the best base layouts, and creates
    missing standard layouts by cloning and modifying existing ones.
    
.PARAMETER InputPath
    Path to the PowerPoint file to analyze/modify.
    
.PARAMETER OutputPath
    Optional output path. If not specified, modifies the input file.
    
.PARAMETER MasterName
    Name for the new master set (default: "Standard Layouts")
    
.EXAMPLE
    .\create_master_set.ps1 -InputPath "input.pptx"
    .\create_master_set.ps1 -InputPath "input.pptx" -OutputPath "output.pptx" -MasterName "My Template"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    
    [string]$OutputPath,
    
    [string]$MasterName = "Standard Layouts",
    
    [switch]$ShowUI
)

# Constants for placeholder types (PowerPoint ppPlaceholderType)
$PP_PLACEHOLDER = @{
    Title = 1
    Body = 2
    CenterTitle = 3
    Subtitle = 4
    Date = 16
    Footer = 15
    SlideNumber = 13
}

# Required layout definitions with placeholder specifications
$RequiredLayouts = @{
    "title" = @{
        Keywords = @("Title Slide", "タイトル スライド", "タイトルスライド")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.CenterTitle; Left = 0.5; Top = 2.5; Width = 12; Height = 1.5 }
            @{ Type = $PP_PLACEHOLDER.Subtitle; Left = 0.5; Top = 4.2; Width = 12; Height = 1 }
        )
        Priority = 1
    }
    "content" = @{
        Keywords = @("Title and Content", "タイトルとコンテンツ", "Title & Content", "Title Only")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.Title; Left = 0.5; Top = 0.3; Width = 12; Height = 1 }
            @{ Type = $PP_PLACEHOLDER.Body; Left = 0.5; Top = 1.5; Width = 12; Height = 5.5 }
        )
        Priority = 2
    }
    "section" = @{
        Keywords = @("Section Header", "セクション見出し", "Section Title", "Section Divider")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.Title; Left = 0.5; Top = 2.5; Width = 12; Height = 1.5 }
        )
        Priority = 3
    }
    "two_content" = @{
        Keywords = @("Two Content", "2 つのコンテンツ", "2つのコンテンツ", "Comparison", "Two Column")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.Title; Left = 0.5; Top = 0.3; Width = 12; Height = 1 }
            @{ Type = $PP_PLACEHOLDER.Body; Left = 0.5; Top = 1.5; Width = 5.8; Height = 5.5 }
            @{ Type = $PP_PLACEHOLDER.Body; Left = 6.7; Top = 1.5; Width = 5.8; Height = 5.5 }
        )
        Priority = 4
    }
    "blank" = @{
        Keywords = @("Blank", "白紙")
        Placeholders = @()
        Priority = 5
    }
    "agenda" = @{
        Keywords = @("Agenda", "アジェンダ", "目次", "Table of Contents")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.Title; Left = 0.5; Top = 0.3; Width = 12; Height = 1 }
            @{ Type = $PP_PLACEHOLDER.Body; Left = 0.5; Top = 1.5; Width = 12; Height = 5.5 }
        )
        Priority = 6
    }
    "closing" = @{
        Keywords = @("Closing", "クロージング", "End Slide", "Thank", "Questions")
        Placeholders = @(
            @{ Type = $PP_PLACEHOLDER.CenterTitle; Left = 0.5; Top = 2.5; Width = 12; Height = 1.5 }
        )
        Priority = 7
    }
}

function Find-BestBaseLayout {
    param(
        [array]$AllLayouts,
        [string]$TargetType
    )
    
    # Strategy: Find the most similar existing layout to clone
    $targetDef = $RequiredLayouts[$TargetType]
    $targetPlaceholderCount = $targetDef.Placeholders.Count
    
    # Score each layout
    $scored = foreach ($layout in $AllLayouts) {
        $score = 0
        
        # Prefer layouts with similar placeholder count
        $countDiff = [Math]::Abs($layout.PlaceholderCount - $targetPlaceholderCount)
        $score += (5 - [Math]::Min($countDiff, 5))
        
        # Prefer "content" type layouts for most cases
        if ($layout.Name -match "Content|コンテンツ|Text") {
            $score += 3
        }
        
        # Prefer layouts without "Title Slide" for non-title types
        if ($TargetType -ne "title" -and $layout.Name -match "Title Slide|タイトル スライド") {
            $score -= 5
        }
        
        # Prefer simpler names (less likely to be specialized)
        if ($layout.Name -notmatch "Photo|Image|Quote|Demo|Code|Picture") {
            $score += 2
        }
        
        @{
            Layout = $layout
            Score = $score
        }
    }
    
    # Return the highest scored layout
    $best = $scored | Sort-Object { $_.Score } -Descending | Select-Object -First 1
    return $best.Layout
}

function Clear-LayoutPlaceholders {
    param($Layout)
    
    # Remove all shapes except background
    $shapesToDelete = @()
    for ($i = $Layout.Shapes.Count; $i -ge 1; $i--) {
        $shape = $Layout.Shapes.Item($i)
        # Keep background shapes, delete placeholders
        if ($shape.Type -eq 14) {  # msoPlaceholder
            $shapesToDelete += $shape
        }
    }
    
    foreach ($shape in $shapesToDelete) {
        try {
            $shape.Delete()
        } catch {
            Write-Host "      Could not delete shape: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

function Add-LayoutPlaceholders {
    param(
        $Layout,
        [array]$PlaceholderDefs,
        [string]$LayoutType
    )
    
    foreach ($def in $PlaceholderDefs) {
        try {
            # Positions in inches, convert to points (72 points per inch)
            $left = $def.Left * 72
            $top = $def.Top * 72
            $width = $def.Width * 72
            $height = $def.Height * 72
            
            $placeholder = $Layout.Shapes.AddPlaceholder($def.Type, $left, $top, $width, $height)
            Write-Host "      Added placeholder type $($def.Type)" -ForegroundColor DarkGray
            
            # Set default text for specific layouts
            if ($LayoutType -eq "closing" -and $def.Type -eq $PP_PLACEHOLDER.CenterTitle) {
                $placeholder.TextFrame.TextRange.Text = "END"
                $placeholder.TextFrame.TextRange.Font.Size = 60
                $placeholder.TextFrame.TextRange.Font.Bold = $true
                Write-Host "      Set default text: END" -ForegroundColor DarkGray
            }
        }
        catch {
            Write-Host "      Failed to add placeholder: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Main script
$InputPath = (Resolve-Path $InputPath -ErrorAction Stop).Path

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Slide Master Set Creator" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

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
    
    # Collect all existing layouts
    Write-Host "`n--- Analyzing Existing Layouts ---" -ForegroundColor Green
    $allLayouts = @()
    
    foreach ($design in $presentation.Designs) {
        $master = $design.SlideMaster
        $layoutIndex = 0
        
        foreach ($layout in $master.CustomLayouts) {
            $layoutIndex++
            $allLayouts += @{
                Design = $design
                DesignName = $design.Name
                Layout = $layout
                Name = $layout.Name
                PlaceholderCount = $layout.Shapes.Placeholders.Count
                Index = $layoutIndex
            }
        }
    }
    
    Write-Host "Found $($allLayouts.Count) layouts across $($presentation.Designs.Count) master(s)"
    
    # Check which layouts are missing
    Write-Host "`n--- Checking Required Layouts ---" -ForegroundColor Green
    $existingTypes = @{}
    $missingTypes = @()
    
    foreach ($required in $RequiredLayouts.GetEnumerator()) {
        $type = $required.Key
        $keywords = $required.Value.Keywords
        
        $found = $null
        foreach ($layout in $allLayouts) {
            foreach ($keyword in $keywords) {
                if ($layout.Name -like "*$keyword*") {
                    $found = $layout
                    break
                }
            }
            if ($found) { break }
        }
        
        if ($found) {
            Write-Host "  [OK] $type`: $($found.Name)" -ForegroundColor Green
            $existingTypes[$type] = $found
        } else {
            Write-Host "  [MISSING] $type" -ForegroundColor Red
            $missingTypes += $type
        }
    }
    
    if ($missingTypes.Count -eq 0) {
        Write-Host "`nAll required layouts already exist!" -ForegroundColor Green
    }
    else {
        Write-Host "`n--- Creating Missing Layouts ---" -ForegroundColor Yellow
        
        # Use the first design's master
        $targetDesign = $presentation.Designs[1]
        $targetMaster = $targetDesign.SlideMaster
        
        # Sort missing types by priority
        $missingTypes = $missingTypes | Sort-Object { $RequiredLayouts[$_].Priority }
        
        foreach ($missingType in $missingTypes) {
            Write-Host "`n  Creating: $missingType" -ForegroundColor Yellow
            
            # Find best base layout to clone
            $baseLayout = Find-BestBaseLayout -AllLayouts $allLayouts -TargetType $missingType
            
            if ($baseLayout) {
                Write-Host "    Base: $($baseLayout.Name) (from $($baseLayout.DesignName))" -ForegroundColor DarkGray
                
                try {
                    # Clone the layout
                    $sourceLayout = $baseLayout.Layout
                    $newLayout = $sourceLayout.Duplicate()
                    
                    # Move to target master if different
                    # (Note: PowerPoint COM doesn't easily allow cross-master moves, 
                    #  so we work within the same master or add new)
                    
                    # Rename
                    $newName = switch ($missingType) {
                        "title" { "Title Slide (auto)" }
                        "content" { "Title and Content (auto)" }
                        "section" { "Section Header (auto)" }
                        "two_content" { "Two Content (auto)" }
                        "blank" { "Blank (auto)" }
                        default { "$missingType (auto)" }
                    }
                    $newLayout.Name = $newName
                    
                    # Clear existing placeholders and add new ones
                    Write-Host "    Configuring placeholders..." -ForegroundColor DarkGray
                    
                    $targetDef = $RequiredLayouts[$missingType]
                    
                    # Always clear and rebuild placeholders for correct layout
                    Clear-LayoutPlaceholders -Layout $newLayout
                    
                    if ($targetDef.Placeholders.Count -gt 0) {
                        Add-LayoutPlaceholders -Layout $newLayout -PlaceholderDefs $targetDef.Placeholders -LayoutType $missingType
                    }
                    
                    Write-Host "    Created: $newName" -ForegroundColor Green
                    
                    # Add to our tracking
                    $existingTypes[$missingType] = @{
                        Layout = $newLayout
                        Name = $newName
                    }
                }
                catch {
                    Write-Host "    Failed to create: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "    No suitable base layout found!" -ForegroundColor Red
                
                # Create from scratch as fallback
                try {
                    $newLayout = $targetMaster.CustomLayouts.Add($targetMaster.CustomLayouts.Count + 1)
                    $newLayout.Name = "$missingType (auto-generated)"
                    
                    $targetDef = $RequiredLayouts[$missingType]
                    Add-LayoutPlaceholders -Layout $newLayout -PlaceholderDefs $targetDef.Placeholders -LayoutType $missingType
                    
                    Write-Host "    Created from scratch: $($newLayout.Name)" -ForegroundColor Green
                }
                catch {
                    Write-Host "    Failed to create from scratch: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        
        # Save
        Write-Host "`n--- Saving ---" -ForegroundColor Yellow
        
        if ($OutputPath) {
            $OutputPath = Join-Path (Get-Location) $OutputPath
            $presentation.SaveAs($OutputPath)
            Write-Host "Saved to: $OutputPath" -ForegroundColor Green
        }
        else {
            $presentation.Save()
            Write-Host "Saved: $InputPath" -ForegroundColor Green
        }
    }
    
    # Final summary
    Write-Host "`n--- Summary ---" -ForegroundColor Cyan
    Write-Host "Original layouts: $($allLayouts.Count)"
    Write-Host "Missing layouts: $($missingTypes.Count)"
    Write-Host "Layouts after: $($targetMaster.CustomLayouts.Count)" -ForegroundColor Green
    
    # Output layout mapping as JSON for integration
    $layoutMap = @{}
    foreach ($type in $RequiredLayouts.Keys) {
        if ($existingTypes.ContainsKey($type)) {
            $layoutMap[$type] = $existingTypes[$type].Name
        }
    }
    
    Write-Host "`nLayout mapping:" -ForegroundColor Cyan
    $layoutMap | ConvertTo-Json | Write-Host
    
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup
    if ($presentation) {
        try {
            $presentation.Close()
        } catch {}
    }
    
    if ($ppt) {
        try {
            $ppt.Quit()
        } catch {}
        
        try {
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
        } catch {}
    }
    
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
    Write-Host "`nPowerPoint closed." -ForegroundColor Yellow
}
