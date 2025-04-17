param (
    [Parameter(Mandatory = $true)]
    [string]$Title
)

# Step 1: Get date info
$now = Get-Date
$year = $now.Year
$month = "{0:D2}" -f $now.Month

# Step 2: Clean and slugify title
$cleanTitle = $Title -replace '^\d+(st|nd|rd|th)\s+post[:\s-]*', ''
$slug = $cleanTitle.ToLower() -replace '[^a-z0-9]+', '-' -replace '(^-+|-+$)', ''

# Step 3: Build Hugo path
$relativePath = "blog/$year/$month/$slug/index.md"

# Step 4: Create the post with Hugo
hugo new $relativePath

# Step 5: Open the new file
Start-Sleep -Milliseconds 500  # Wait for Hugo
$newFile = Join-Path "content" $relativePath

if (Test-Path $newFile) {
    Write-Host "✅ Created: $newFile"
    code $newFile  # Optional: open in VS Code
} else {
    Write-Warning "⚠️ Could not locate the new file."
}

#hugo new blog/2025/04/my-slug/index.md
