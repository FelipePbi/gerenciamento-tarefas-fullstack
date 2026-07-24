$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$mobileRoot = Join-Path $projectRoot "mobile"
$npmCommand = (Get-Command npm.cmd -ErrorAction Stop).Source
$metroPort = 8081
$apiPort = 3000
$metroStatusUrl = "http://127.0.0.1:$metroPort/status"
$metroStdout = Join-Path $mobileRoot "metro.stdout.log"
$metroStderr = Join-Path $mobileRoot "metro.stderr.log"

function Test-Metro {
  try {
    $response = Invoke-WebRequest `
      -Uri $metroStatusUrl `
      -UseBasicParsing `
      -TimeoutSec 2

    $content = if ($response.Content -is [byte[]]) {
      [System.Text.Encoding]::UTF8.GetString($response.Content)
    }
    else {
      [string]$response.Content
    }

    return $content -match "packager-status:running"
  }
  catch {
    return $false
  }
}

function Resolve-Adb {
  $adbCommand = Get-Command adb.exe -ErrorAction SilentlyContinue
  if ($adbCommand) {
    return $adbCommand.Source
  }

  $sdkRoot = if ($env:ANDROID_HOME) {
    $env:ANDROID_HOME
  }
  elseif ($env:ANDROID_SDK_ROOT) {
    $env:ANDROID_SDK_ROOT
  }
  else {
    Join-Path $env:LOCALAPPDATA "Android\Sdk"
  }

  $adbPath = Join-Path $sdkRoot "platform-tools\adb.exe"
  if (-not (Test-Path -LiteralPath $adbPath)) {
    throw "adb.exe não encontrado. Configure ANDROID_HOME ou instale Android SDK Platform-Tools."
  }

  return $adbPath
}

if (-not (Test-Metro)) {
  Write-Host "Iniciando Metro em $metroStatusUrl..."

  Start-Process `
    -FilePath $npmCommand `
    -ArgumentList @("run", "start", "--", "--port", "$metroPort") `
    -WorkingDirectory $mobileRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $metroStdout `
    -RedirectStandardError $metroStderr

  $deadline = (Get-Date).AddSeconds(60)
  while ((Get-Date) -lt $deadline -and -not (Test-Metro)) {
    Start-Sleep -Seconds 1
  }

  if (-not (Test-Metro)) {
    Write-Error "Metro não iniciou. Consulte $metroStdout e $metroStderr."
    exit 1
  }
}

Write-Host "Metro pronto em $metroStatusUrl."

$adb = Resolve-Adb
& $adb start-server | Out-Null

$connectedDevices = (& $adb devices) | Where-Object { $_ -match "\sdevice$" }
if ($connectedDevices) {
  & $adb reverse "tcp:$metroPort" "tcp:$metroPort" | Out-Null
  & $adb reverse "tcp:$apiPort" "tcp:$apiPort" | Out-Null
  Write-Host "ADB reverse configurado para portas $metroPort e $apiPort."
}

& $npmCommand run android --prefix $mobileRoot -- --no-packager --active-arch-only
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $adb reverse "tcp:$metroPort" "tcp:$metroPort" | Out-Null
& $adb reverse "tcp:$apiPort" "tcp:$apiPort" | Out-Null
