$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mobileRoot = Join-Path $projectRoot "mobile"
$androidRoot = Join-Path $mobileRoot "android"
$gradle = Join-Path $androidRoot "gradlew.bat"
$previousEnvFile = $env:ENVFILE

if (-not (Test-Path -LiteralPath $gradle)) {
  throw "Gradle wrapper nao encontrado em $gradle."
}

Get-Command java.exe -ErrorAction Stop | Out-Null

$androidSdk = if ($env:ANDROID_HOME) {
  $env:ANDROID_HOME
}
elseif ($env:ANDROID_SDK_ROOT) {
  $env:ANDROID_SDK_ROOT
}
else {
  Join-Path $env:LOCALAPPDATA "Android\Sdk"
}

if (-not (Test-Path -LiteralPath $androidSdk)) {
  throw "Android SDK nao encontrado. Configure ANDROID_HOME."
}

try {
  if (-not (Test-Path -LiteralPath (Join-Path $mobileRoot ".env"))) {
    $env:ENVFILE = "../.env.example"
  }

  Push-Location $androidRoot
  & $gradle assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}
finally {
  Pop-Location
  $env:ENVFILE = $previousEnvFile
}
