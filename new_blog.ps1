param (
    [Parameter(Mandatory = $true)]
    [string]$Title
)

# Step 1: Generate a slug
$cleanTitle = $Title -replace '^\d+(st|nd|rd|th)\s+post[:\s-]*', ''
$slug = $cleanTitle.ToLower() -replace '[^a-z0-9]+', '-' -replace '(^-+|-+$)', ''

# Step 2: Create the post using Hugo's archetype
$path = "blog/$slug.md"
hugo new $path

# Step 3: Organize the post into the correct folder
Start-Sleep -Milliseconds 500  # Wait for Hugo to write file
Write-Host "Running organizer script..."
.\organize-blog-folders.ps1

# Step 4: Try to find and open the new file
$newFile = Get-ChildItem -Recurse -Filter index.md | Where-Object { $_.FullName -match "$slug\\index\.md$" } | Select-Object -First 1

if ($newFile) {
    Write-Host "Created: $($newFile.FullName)"
    code $newFile.FullName  # Open in VS Code (optional)
} else {
    Write-Warning "Could not locate the new file after organizing."
}
