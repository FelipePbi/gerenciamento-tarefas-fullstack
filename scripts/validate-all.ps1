$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$npmCommand = (Get-Command npm.cmd -ErrorAction Stop).Source

if (-not (Test-Path -LiteralPath (Join-Path $projectRoot "api\.env"))) {
  throw "api\.env ausente. Copie api\.env.example e configure PostgreSQL."
}

function Invoke-Npm {
  param([Parameter(Mandatory = $true)][string[]]$Arguments)

  Write-Host "`n> npm $($Arguments -join ' ')"
  & $npmCommand @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Falha: npm $($Arguments -join ' ')"
  }
}

Push-Location $projectRoot
try {
  Invoke-Npm -Arguments @("run", "lint")
  Invoke-Npm -Arguments @("run", "typecheck")
  Invoke-Npm -Arguments @("test")
  Invoke-Npm -Arguments @("run", "build")
  Write-Host "`nValidacao completa concluida."
}
finally {
  Pop-Location
}
