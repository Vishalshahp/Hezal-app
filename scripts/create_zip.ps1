$src = "C:\Users\VISHAL\.gemini\antigravity\scratch\hezal-market"
$zip = "C:\Users\VISHAL\Downloads\hezal-market-source-code.zip"
$desktopZip = "C:\Users\VISHAL\Desktop\hezal-market-source-code.zip"

if (Test-Path $zip) { Remove-Item -Force $zip }
if (Test-Path $desktopZip) { Remove-Item -Force $desktopZip }

$tempDir = Join-Path $env:TEMP ("hezal-export-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir | Out-Null
& robocopy $src $tempDir /E /XD node_modules .git dist build .turbo /XF *.log *.tmp | Out-Null

Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zip -CompressionLevel Optimal
Copy-Item $zip -Destination $desktopZip -Force
Remove-Item -Recurse -Force $tempDir
Write-Output "Zip files successfully updated at $zip and $desktopZip"
