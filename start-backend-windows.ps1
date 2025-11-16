# start-backend-windows.ps1
# PowerShell script to start the fragments backend on Windows

# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "🟢 Starting Fragments Backend (Windows)" -ForegroundColor Green

# Load environment variables from .env if available
$EnvFile = ".env"
if (Test-Path $EnvFile) {
    Write-Host "Loading environment variables from $EnvFile..."
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value)
        }
    }
} else {
    Write-Host "⚠️  No .env file found. Using default values."
}

# Default port if not provided
if (-not $env:PORT) {
    $Port = 8080
} else {
    $Port = $env:PORT
}

Write-Host "Starting server on port $Port..." -ForegroundColor Cyan

# Run the backend
try {
    npm run start
} catch {
    Write-Host "❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Server should be available at http://localhost:$Port" -ForegroundColor Green
