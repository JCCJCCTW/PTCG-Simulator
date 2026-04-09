$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $projectRoot "dist"
$buildOutputDir = Join-Path $projectRoot "dist-onefile-build"
$unpackedDir = Join-Path $buildOutputDir "win-unpacked"
$rarExe = "C:\Program Files\WinRAR\Rar.exe"
$sfxModule = "C:\Program Files\WinRAR\Default64.SFX"
$rceditExe = "C:\Users\Joe Chou\AppData\Local\electron-builder\Cache\winCodeSign\122051771\rcedit-x64.exe"
$iconPath = Join-Path $projectRoot "assets\app-icon.ico"
$commentPath = Join-Path $distDir "onefile-winrar-comment.txt"
$customSfxModule = Join-Path $distDir "PTCG-SFX-Stub.exe"
$outputExe = Join-Path $distDir "PTCG Simulator.exe"
$deckBuilderDataSource = Join-Path $projectRoot "deck-builder-data"

if (!(Test-Path $rarExe) -or !(Test-Path $sfxModule)) {
  throw "WinRAR is required at C:\Program Files\WinRAR\"
}

if (!(Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

Push-Location $projectRoot
try {
  $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

  if (Test-Path $buildOutputDir) {
    Remove-Item $buildOutputDir -Recurse -Force
  }

  & ".\node_modules\.bin\electron-builder.cmd" --win dir "-c.directories.output=$buildOutputDir"

  if ((Test-Path $rceditExe) -and (Test-Path $iconPath)) {
    $mainExe = Join-Path $unpackedDir "PTCG Simulator.exe"
    if (Test-Path $mainExe) {
      & $rceditExe "$mainExe" --set-icon "$iconPath"
      Write-Host "Icon applied to PTCG Simulator.exe"
    }
  }

  $deckBuilderDataRuntime = Join-Path $unpackedDir "deck-builder-data"
  if (Test-Path $deckBuilderDataRuntime) {
    Remove-Item $deckBuilderDataRuntime -Recurse -Force
  }
  if (Test-Path $deckBuilderDataSource) {
    New-Item -ItemType Directory -Path $deckBuilderDataRuntime -Force | Out-Null
    Get-ChildItem $deckBuilderDataSource -Exclude "images" | Copy-Item -Destination $deckBuilderDataRuntime -Recurse -Force
  }

@'
Path=.
Silent=1
Overwrite=1
Setup="PTCG Simulator.exe"
Title=PTCG Simulator
'@ | Set-Content -Encoding ASCII $commentPath

  if (Test-Path $outputExe) {
    try {
      Remove-Item $outputExe -Force
    } catch {
      $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
      $fallbackExe = Join-Path $distDir "PTCG Simulator_$timestamp.exe"
      Write-Host "Old exe is locked, building to: $fallbackExe"
      $outputExe = $fallbackExe
    }
  }

  if ((Test-Path $rceditExe) -and (Test-Path $iconPath)) {
    Copy-Item $sfxModule $customSfxModule -Force
    & $rceditExe "$customSfxModule" --set-icon "$iconPath"
  } else {
    Copy-Item $sfxModule $customSfxModule -Force
  }

  & $rarExe a -ep1 -r -s -m5 -z"$commentPath" -sfx"$customSfxModule" "$outputExe" "$unpackedDir\*"

  Write-Host "Built: $outputExe"
} finally {
  if (Test-Path $customSfxModule) {
    Remove-Item $customSfxModule -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
