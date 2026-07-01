#Requires -Version 5.1
<#
.SYNOPSIS
  Baixa o backup completo do SteelMind e copia para \\Paulo\projeto api

.USAGE
  Clique direito -> Executar com PowerShell
  OU no PowerShell:
    irm https://raw.githubusercontent.com/PauloSergiodaRocha32/steelmind/cursor/gestio-import-3dc9/scripts/backup/COPIAR-PARA-SSD.ps1 | iex
#>

$ErrorActionPreference = "Stop"

$DestinoRaiz = "\\Paulo\projeto api"
$Destino     = Join-Path $DestinoRaiz "steelmind-backup-2026-07-01"
$ReleaseUrl  = "https://github.com/PauloSergiodaRocha32/steelmind/releases/download/backup-2026-07-01/steelmind-backup-completo-2026-07-01.tar.gz"
$TempDir     = Join-Path $env:TEMP "steelmind-backup-tmp"
$TarGz       = Join-Path $TempDir "steelmind-backup-completo-2026-07-01.tar.gz"

Write-Host ""
Write-Host "=== SteelMind -> SSD externo ===" -ForegroundColor Cyan
Write-Host "Destino: $Destino"
Write-Host ""

# 1) Verificar SSD
if (-not (Test-Path $DestinoRaiz)) {
    Write-Host "ERRO: '$DestinoRaiz' nao encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "  1. SSD externo conectado"
    Write-Host "  2. Pasta compartilhada como 'Paulo' (ou ajuste DestinoRaiz no script)"
    Write-Host "  3. No Explorer, teste abrir: $DestinoRaiz"
    Read-Host "Pressione Enter para sair"
    exit 1
}

# 2) Baixar backup
Write-Host "[1/4] Baixando backup do GitHub..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $ReleaseUrl -OutFile $TarGz -UseBasicParsing
Write-Host "      OK ($([math]::Round((Get-Item $TarGz).Length / 1MB, 2)) MB)" -ForegroundColor Green

# 3) Extrair
Write-Host "[2/4] Extraindo arquivos..." -ForegroundColor Yellow
$ExtractDir = Join-Path $TempDir "extracted"
if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null

$tar = Get-Command tar -ErrorAction SilentlyContinue
if ($tar) {
    tar -xzf $TarGz -C $ExtractDir
} else {
    Write-Host "      tar nao encontrado, tentando 7-Zip..." -ForegroundColor Yellow
    $7z = @(
        "${env:ProgramFiles}\7-Zip\7z.exe",
        "${env:ProgramFiles(x86)}\7-Zip\7z.exe"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $7z) {
        Write-Host "ERRO: Instale 7-Zip (https://www.7-zip.org) ou use Windows 10+ com tar." -ForegroundColor Red
        exit 1
    }
    & $7z x $TarGz -o"$ExtractDir" -y | Out-Null
    $inner = Get-ChildItem $ExtractDir -Filter "*.tar" -Recurse | Select-Object -First 1
    if ($inner) { & $7z x $inner.FullName -o"$ExtractDir" -y | Out-Null }
}

$Origem = Join-Path $ExtractDir "steelmind-backup-2026-07-01"
if (-not (Test-Path $Origem)) {
    $Origem = $ExtractDir
}

# 4) Copiar para SSD
Write-Host "[3/4] Copiando para o SSD..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $Destino | Out-Null
Copy-Item -Path "$Origem\*" -Destination $Destino -Recurse -Force
Write-Host "      OK" -ForegroundColor Green

# 5) Limpar temp
Write-Host "[4/4] Limpando temporarios..." -ForegroundColor Yellow
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

$total = (Get-ChildItem $Destino -Recurse -File | Measure-Object -Property Length -Sum).Sum
Write-Host ""
Write-Host "=== CONCLUIDO ===" -ForegroundColor Green
Write-Host "Backup em: $Destino"
Write-Host "Total: $([math]::Round($total / 1MB, 2)) MB"
Write-Host ""
Write-Host "Conteudo:" -ForegroundColor Cyan
Get-ChildItem $Destino | ForEach-Object { Write-Host "  - $($_.Name)" }
Write-Host ""
Read-Host "Pressione Enter para fechar"
