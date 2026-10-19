# Auto-rig people GLB bằng instance-rig (ASCII path vì Open3D lỗi Unicode).
# Usage: powershell -File scripts/rig-people.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$tmp = "C:\Temp\nl-rig"
New-Item -ItemType Directory -Force $tmp, "$root\assets\city\people\rigged", "$root\assets-src\people\rigged" | Out-Null

$names = @("villager", "villager2", "soldier", "official")
foreach ($n in $names) {
  $src = Join-Path $root "assets-src\people\$n.glb"
  if (-not (Test-Path $src)) { Write-Host "skip missing $n"; continue }
  Copy-Item $src "$tmp\$n.glb" -Force
  Push-Location $root
  node node_modules/@gltf-transform/cli/bin/cli.js optimize "$tmp\$n.glb" "$tmp\$n-plain.glb" --compress false --texture-compress false --simplify false | Out-Null
  Pop-Location
  Write-Host "rigging $n ..."
  instance-rig "$tmp\$n-plain.glb" --output "$tmp\$n-rig.glb" --smooth-weights --t-pose
  Copy-Item "$tmp\$n-rig.glb" "$root\assets-src\people\rigged\$n.glb" -Force
  Push-Location $root
  node node_modules/@gltf-transform/cli/bin/cli.js optimize "$tmp\$n-rig.glb" "assets\city\people\rigged\$n.glb" --compress meshopt --texture-compress webp --texture-size 512 --simplify-ratio 0.02 --simplify-error 0.01
  Pop-Location
}
Write-Host "done → assets/city/people/rigged/"
