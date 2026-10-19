# Chay selftest P1+P2 bang Chrome headless
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$html = (Resolve-Path "tests\selftest.html").Path
$uri = [Uri]::new($html).AbsoluteUri
$edge = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Can Chrome hoac Edge" }
New-Item -ItemType Directory -Force -Path "tests\out" | Out-Null
& $edge --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=8000 --dump-dom $uri 2>$null |
  Out-File -FilePath "tests\out\dom.html" -Encoding utf8
$dom = Get-Content "tests\out\dom.html" -Raw
if ($dom -match 'title>(OK|FAIL) (\d+)/(\d+)<') {
  Write-Host ("Result: " + $Matches[1] + " " + $Matches[2] + "/" + $Matches[3])
  if ($Matches[1] -ne "OK") { exit 1 }
  exit 0
}
Write-Host "Could not parse result"
exit 1
