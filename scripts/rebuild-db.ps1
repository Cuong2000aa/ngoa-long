# Regenerates js/db/nl-db.bundle.js from data/*.json
# ALWAYS use UTF-8 Python packer — PowerShell ConvertTo-Json / Join can corrupt tiếng Việt.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$py = Get-Command py -ErrorAction SilentlyContinue
if ($py) {
  & py -3 (Join-Path $root "scripts\rebuild-bundle-utf8.py")
  if ($LASTEXITCODE -ne 0) { throw "rebuild-bundle-utf8.py failed" }
  exit 0
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
  & python (Join-Path $root "scripts\rebuild-bundle-utf8.py")
  if ($LASTEXITCODE -ne 0) { throw "rebuild-bundle-utf8.py failed" }
  exit 0
}

throw "Can not find py/python. Install Python 3, then: py -3 scripts/rebuild-bundle-utf8.py"
