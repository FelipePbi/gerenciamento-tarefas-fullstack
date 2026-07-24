$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiRoot = Join-Path $projectRoot "api"
$mobileRoot = Join-Path $projectRoot "mobile"
$npmCommand = (Get-Command npm.cmd -ErrorAction Stop).Source
$apiHealthUrl = "http://127.0.0.1:3000/health"
$apiStdout = Join-Path $apiRoot "dev-api.stdout.log"
$apiStderr = Join-Path $apiRoot "dev-api.stderr.log"
$apiProcess = $null

function Test-Api {
  try {
    $response = Invoke-WebRequest `
      -Uri $apiHealthUrl `
      -UseBasicParsing `
      -TimeoutSec 2

    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

try {
  if (Test-Api) {
    Write-Host "API ja esta pronta em $apiHealthUrl."
  }
  else {
    if (-not (Test-Path -LiteralPath (Join-Path $apiRoot ".env"))) {
      throw "api\.env ausente. Copie api\.env.example antes de iniciar."
    }

    Write-Host "Iniciando API..."
    $apiProcess = Start-Process `
      -FilePath $npmCommand `
      -ArgumentList @("run", "dev") `
      -WorkingDirectory $apiRoot `
      -WindowStyle Hidden `
      -RedirectStandardOutput $apiStdout `
      -RedirectStandardError $apiStderr `
      -PassThru

    $deadline = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadline -and -not (Test-Api)) {
      if ($apiProcess.HasExited) {
        break
      }
      Start-Sleep -Milliseconds 500
    }

    if (-not (Test-Api)) {
      if (Test-Path -LiteralPath $apiStderr) {
        Get-Content -LiteralPath $apiStderr -Tail 30
      }
      throw "API nao iniciou em 60 segundos. Consulte $apiStderr."
    }
    Write-Host "API pronta em $apiHealthUrl."
  }

  Write-Host "Iniciando Metro. Pressione Ctrl+C para encerrar."
  & $npmCommand run start --prefix $mobileRoot
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Write-Host "Encerrando API iniciada por este script..."
    & taskkill.exe /PID $apiProcess.Id /T /F 2>$null | Out-Null
  }
}
