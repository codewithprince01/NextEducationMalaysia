$files = Get-ChildItem -Path src -Filter *.ts* -Recurse
foreach ($file in $files) {
    $filePath = $file.FullName
    try {
        $content = [System.IO.File]::ReadAllText($filePath)
        $updated = $false
        
        # Define patterns to replace (using -replace which uses regex in PS)
        $patterns = @(
            @{ regex = 'status: 1\b'; sub = 'status: true' },
            @{ regex = 'status: 0\b'; sub = 'status: false' },
            @{ regex = 'featured: 1\b'; sub = 'featured: true' },
            @{ regex = 'featured: 0\b'; sub = 'featured: false' },
            @{ regex = 'homeview: 1\b'; sub = 'homeview: true' },
            @{ regex = 'homeview: 0\b'; sub = 'homeview: false' },
            @{ regex = 'trending: 1\b'; sub = 'trending: true' },
            @{ regex = 'trending: 0\b'; sub = 'trending: false' },
            @{ regex = 'partner: 1\b'; sub = 'partner: true' },
            @{ regex = 'partner: 0\b'; sub = 'partner: false' },
            @{ regex = 'is_local: 1\b'; sub = 'is_local: true' },
            @{ regex = 'is_local: 0\b'; sub = 'is_local: false' },
            @{ regex = 'is_international: 1\b'; sub = 'is_international: true' },
            @{ regex = 'is_international: 0\b'; sub = 'is_international: false' },
            @{ regex = 'u_status: 1\b'; sub = 'u_status: true' },
            @{ regex = 'u_status: 0\b'; sub = 'u_status: false' },
            @{ regex = 'is_featured: 1\b'; sub = 'is_featured: true' },
            @{ regex = 'is_featured: 0\b'; sub = 'is_featured: false' }
        )
        
        foreach ($p in $patterns) {
            if ($content -match $p.regex) {
                $content = $content -replace $p.regex, $p.sub
                $updated = $true
            }
        }
        
        if ($updated) {
            [System.IO.File]::WriteAllText($filePath, $content)
            Write-Host "Updated $filePath"
        }
    } catch {
        Write-Warning "Failed to process $filePath : $($_.Exception.Message)"
    }
}
