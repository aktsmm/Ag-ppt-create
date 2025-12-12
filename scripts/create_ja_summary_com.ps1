<#
.SYNOPSIS
    Create Japanese summary PPTX by copying selected slides from source.
    Uses PowerPoint COM automation to preserve original design.
#>

param(
    [string]$SourcePath = "D:\03_github\Ag-ppt-create\input\BRK252_Best in class for Microsoft_v05.pptx",
    [string]$OutputPath = "D:\03_github\Ag-ppt-create\output_ppt\20251211_brk252_ja_summary_final.pptx",
    [string]$ContentJson = "D:\03_github\Ag-ppt-create\output_manifest\20251211_brk252_ja_summary_content.json"
)

# Load content
$content = Get-Content $ContentJson -Raw | ConvertFrom-Json

# Slide indices to keep (1-indexed for PowerPoint)
# Maps: new slide position -> original slide number
$slideMap = @{
    1 = 2      # Title
    2 = 3      # Stats (top priorities)
    3 = 5      # Challenge - 90%
    4 = 187    # Challenge - AI risks
    5 = 4      # Solution - Best in class
    6 = 13     # Section - M365
    7 = 14     # Feature - DSPM
    8 = 15     # Feature - Oversharing
    9 = 50     # Feature - Auto labeling
    10 = 86    # Feature - Copilot
    11 = 93    # Section - Windows
    12 = 95    # Feature - Endpoint DLP
    13 = 96    # Feature - Recall
    14 = 104   # Section - Prompt DLP
    15 = 105   # Feature - Prompt DLP
    16 = 119   # Section - Fabric
    17 = 120   # Feature - Fabric DSPM
    18 = 126   # Feature - OneLake DLP
    19 = 143   # Feature - Fabric Copilot
    20 = 155   # Section - Agents
    21 = 200   # Challenge - Agent stats
    22 = 159   # Feature - Triage Agent
    23 = 10    # Summary
    24 = 180   # Closing
}

try {
    # Create PowerPoint COM object
    $ppt = New-Object -ComObject PowerPoint.Application
    $ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
    
    # Open source presentation
    Write-Host "Opening source: $SourcePath"
    $source = $ppt.Presentations.Open($SourcePath, $false, $false, $false)
    
    # Create new presentation from source (to keep masters)
    Write-Host "Creating new presentation..."
    $dest = $ppt.Presentations.Add()
    
    # Copy slide masters from source
    # This is done by copying a slide first
    
    # Get slide indices to copy
    $slidesToCopy = $slideMap.Values | Sort-Object | Get-Unique
    Write-Host "Copying $($slidesToCopy.Count) unique slides from source"
    
    # Copy slides in order
    foreach ($newIdx in 1..24) {
        $srcIdx = $slideMap[$newIdx]
        
        if ($srcIdx -le $source.Slides.Count) {
            # Copy slide from source
            $source.Slides($srcIdx).Copy()
            $dest.Slides.Paste($newIdx)
            Write-Host "  Copied slide $srcIdx -> position $newIdx"
        }
    }
    
    # Update text with Japanese content
    Write-Host "`nUpdating text content..."
    
    foreach ($slideContent in $content.slides) {
        $slideNum = $slideContent.slide_number
        $slide = $dest.Slides($slideNum)
        
        # Find shapes with text
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame -eq [Microsoft.Office.Core.MsoTriState]::msoTrue) {
                $tf = $shape.TextFrame
                if ($tf.HasText -eq [Microsoft.Office.Core.MsoTriState]::msoTrue) {
                    $currentText = $tf.TextRange.Text
                    
                    # Update title if this looks like a title
                    if ($shape.Top -lt 100 -or $tf.TextRange.Font.Size -ge 24) {
                        if ($slideContent.title_ja) {
                            $tf.TextRange.Text = $slideContent.title_ja
                        }
                    }
                }
            }
        }
        
        # Update notes
        if ($slideContent.notes_ja -and $slide.HasNotesPage -eq [Microsoft.Office.Core.MsoTriState]::msoTrue) {
            $slide.NotesPage.Shapes | Where-Object { 
                $_.PlaceholderFormat.Type -eq 2  # ppPlaceholderBody
            } | ForEach-Object {
                $_.TextFrame.TextRange.Text = $slideContent.notes_ja
            }
        }
        
        Write-Host "  Updated slide $slideNum`: $($slideContent.title_ja.Substring(0, [Math]::Min(30, $slideContent.title_ja.Length)))..."
    }
    
    # Save
    Write-Host "`nSaving to: $OutputPath"
    $dest.SaveAs($OutputPath)
    
    Write-Host "`nDone! Created $($dest.Slides.Count) slides"
    
    # Close source (keep destination open for review)
    $source.Close()
    
} catch {
    Write-Error "Error: $_"
} finally {
    # Cleanup COM objects
    if ($source) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($source) | Out-Null }
    # Don't release $dest to keep it open for review
    # if ($ppt) { $ppt.Quit() }
}
