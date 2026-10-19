# Cross-reference validation for foundation DB
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Load-Json($name) {
  $path = Join-Path $root "data\$name.json"
  return (Get-Content -Raw -Encoding UTF8 $path | ConvertFrom-Json)
}

$errors = New-Object System.Collections.Generic.List[string]
$warns = New-Object System.Collections.Generic.List[string]

$qualities = Load-Json 'qualities'
$troops = Load-Json 'troops'
$skills = Load-Json 'skills'
$generals = Load-Json 'generals'
$items = Load-Json 'items'
$campaign = Load-Json 'campaign'
$recruit = Load-Json 'recruit'
$factions = Load-Json 'factions'
$buildings = Load-Json 'buildings'
$arena = Load-Json 'arena'

$qIds = @($qualities.tiers.PSObject.Properties.Name)
$tIds = @($troops.types.PSObject.Properties.Name)
$sIds = @($skills.skills.PSObject.Properties.Name)
$gIds = @($generals.list | ForEach-Object { $_.id })
$iIds = @($items.list | ForEach-Object { $_.id })
$fIds = @($factions.list.PSObject.Properties.Name)

# Unique general ids
$dup = $gIds | Group-Object | Where-Object { $_.Count -gt 1 }
foreach ($d in $dup) { $errors.Add("Duplicate general id: $($d.Name)") }

foreach ($g in $generals.list) {
  if ($qIds -notcontains $g.quality) { $errors.Add("General $($g.id): bad quality $($g.quality)") }
  if ($tIds -notcontains $g.troop) { $errors.Add("General $($g.id): bad troop $($g.troop)") }
  if ($sIds -notcontains $g.skillId) { $errors.Add("General $($g.id): missing skill $($g.skillId)") }
  if ($fIds -notcontains $g.faction) { $errors.Add("General $($g.id): bad faction $($g.faction)") }
  $band = $qualities.tiers.($g.quality).statBand
  if ($band) {
    foreach ($stat in @('tongLinh','vuLuc','triLuc')) {
      $v = $g.base.$stat
      if ($v -lt $band.min -or $v -gt $band.max) {
        # Red can hit 100 VL; allow small slack for iconic
        if ($g.quality -eq 'red' -and $v -le 100) { }
        else { $warns.Add("Stat band $($g.id).$stat=$v (expect $($band.min)-$($band.max))") }
      }
    }
  }
}

# Starters
foreach ($fac in @('shu','wei','wu')) {
  foreach ($sid in $generals.startersByFaction.$fac) {
    if ($gIds -notcontains $sid) { $errors.Add("Starter missing: $fac/$sid") }
  }
  foreach ($sid in $factions.list.$fac.starterGeneralIds) {
    if ($gIds -notcontains $sid) { $errors.Add("Faction starter missing: $fac/$sid") }
  }
}

# Recruit pools
foreach ($prop in $recruit.pools.PSObject.Properties) {
  foreach ($gid in $prop.Value) {
    $g = $generals.list | Where-Object { $_.id -eq $gid } | Select-Object -First 1
    if (-not $g) { $errors.Add("Recruit pool $($prop.Name): missing $gid"); continue }
    if ($g.npcOnly) { $errors.Add("Recruit pool has npcOnly: $gid") }
    if ($g.quality -ne $prop.Name -and $prop.Name -ne 'orange') {
      # allow orange pool to include orange; red pool red only ideally
      if ($g.quality -ne $prop.Name) { $warns.Add("Recruit $($prop.Name) has $($g.id) quality $($g.quality)") }
    }
  }
}

# Campaign enemies + drops
foreach ($ch in $campaign.chapters) {
  foreach ($st in $ch.stages) {
    foreach ($e in $st.enemies) {
      if ($gIds -notcontains $e.generalId) { $errors.Add("Stage $($st.id): missing enemy $($e.generalId)") }
      if ($e.slot -lt 0 -or $e.slot -gt 4) { $errors.Add("Stage $($st.id): bad slot $($e.slot)") }
    }
    $dt = $st.rewards.dropTable
    if ($dt -and -not $items.dropTables.$dt) { $errors.Add("Stage $($st.id): bad dropTable $dt") }
    $fc = $st.rewards.firstClearBonus
    if ($fc -and $fc.itemId -and ($iIds -notcontains $fc.itemId)) {
      $errors.Add("Stage $($st.id): firstClear item missing $($fc.itemId)")
    }
  }
  if ($ch.unlockRequire) {
    $ok = $false
    foreach ($c2 in $campaign.chapters) {
      foreach ($s2 in $c2.stages) {
        if ($c2.id -eq $ch.unlockRequire.chapterId -and $s2.id -eq $ch.unlockRequire.stageId) { $ok = $true }
      }
    }
    if (-not $ok) { $errors.Add("Chapter $($ch.id): unlockRequire not found") }
  }
}

# Drop tables
foreach ($prop in $items.dropTables.PSObject.Properties) {
  foreach ($row in $prop.Value) {
    if ($null -ne $row.itemId -and $row.itemId -ne '' -and ($iIds -notcontains $row.itemId)) {
      $errors.Add("Drop $($prop.Name): missing item $($row.itemId)")
    }
  }
}

# Buildings unique
$bIds = $buildings.list | ForEach-Object { $_.id }
$bdup = $bIds | Group-Object | Where-Object { $_.Count -gt 1 }
foreach ($d in $bdup) { $errors.Add("Duplicate building: $($d.Name)") }

# Recruit v3 list check
if ($recruit.list) {
  foreach ($r in $recruit.list) {
    if ($gIds -notcontains $r.hero_id) { $errors.Add("Recruit entry $($r.recruit_id): missing hero_id $($r.hero_id)") }
  }
}

# Arena v3 bots check
if ($arena.bots) {
  $ranks = @()
  foreach ($b in $arena.bots) {
    $ranks += [int]$b.rank
    foreach ($sl in $b.deployed_formation.slots) {
      if ($gIds -notcontains $sl.hero_id) { $errors.Add("Arena bot $($b.bot_id): missing hero_id $($sl.hero_id)") }
    }
  }
  $rdup = $ranks | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($d in $rdup) { $errors.Add("Arena duplicate bot rank: $($d.Name)") }
}

Write-Host "==== DB VALIDATION ===="
Write-Host ("Generals: " + $gIds.Count)
Write-Host ("Skills: " + $sIds.Count)
Write-Host ("Items: " + $iIds.Count)
Write-Host ("Buildings: " + $bIds.Count)
$stageCount = 0
foreach ($ch in $campaign.chapters) { $stageCount += $ch.stages.Count }
Write-Host ("Chapters: " + $campaign.chapters.Count + " | Stages: " + $stageCount)
Write-Host ("Errors: " + $errors.Count)
Write-Host ("Warnings: " + $warns.Count)
$errors | ForEach-Object { Write-Host ("  ERR  " + $_) }
$warns | Select-Object -First 30 | ForEach-Object { Write-Host ("  WARN " + $_) }
if ($warns.Count -gt 30) { Write-Host ("  ... +" + ($warns.Count - 30) + " warns") }

if ($errors.Count -gt 0) { exit 1 }
Write-Host "OK - foundation DB references valid."
exit 0
