param([string]$port = "5200", [switch]$persist)

$ErrorActionPreference = "Stop"
$projectDir = "C:\proyectos\torneoExAlumnos"

function Get-ScriptPath {
    $ps1path = $MyInvocation.PSCommandPath
    if ($ps1path) { return Split-Path $ps1path -Parent }
    return $projectDir
}

$scriptDir = Get-ScriptPath

# Kill existing node processes on this port
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($existing) {
    Write-Host "Killing existing process on port $port..."
    $existing | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 500
}

# Start Vite
Write-Host "Starting dev server on port $port..."
$process = Start-Process powershell -ArgumentList "-NoExit","-Command","cd $scriptDir; npm run dev -- --port $port" -PassThru -WindowStyle Normal

# Wait and verify
Start-Sleep 3

if ($process.HasExited) {
    Write-Host "ERROR: Process exited with code $($process.ExitCode)"
    exit 1
} else {
    Write-Host "✓ Server running on http://localhost:$port"
}

if ($persist) {
    Write-Host "Press Ctrl+C to stop..."
    while (-not ((Test-Path "quit.txt") -or $process.HasExited)) {
        Start-Sleep 2
    }
    if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}