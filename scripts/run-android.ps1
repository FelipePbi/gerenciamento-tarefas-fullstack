param(
  [string]$AvdName = "RN_Pixel_4_API_36"
)

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

function Resolve-Emulator {
  $emulatorCommand = Get-Command emulator.exe -ErrorAction SilentlyContinue
  if ($emulatorCommand) {
    return $emulatorCommand.Source
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

  $emulatorPath = Join-Path $sdkRoot "emulator\emulator.exe"
  if (-not (Test-Path -LiteralPath $emulatorPath)) {
    throw "emulator.exe não encontrado. Configure ANDROID_HOME ou instale o Android Emulator."
  }

  return $emulatorPath
}

function Get-RunningAvdSerial {
  param(
    [string]$AdbPath,
    [string]$Name
  )

  $deviceLines = (& $AdbPath devices) |
    Select-Object -Skip 1 |
    Where-Object { $_ -match "^(emulator-\d+)\s+device$" }

  foreach ($line in $deviceLines) {
    $serial = ($line -split "\s+")[0]
    $runningName = (
      & $AdbPath -s $serial emu avd name 2>$null |
        Select-Object -First 1
    )
    if ($runningName -and $runningName.Trim() -eq $Name) {
      return $serial
    }
  }

  return $null
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
$emulator = Resolve-Emulator
& $adb start-server | Out-Null

$availableAvds = & $emulator -list-avds
if ($AvdName -notin $availableAvds) {
  throw "AVD '$AvdName' não encontrado. Disponíveis: $($availableAvds -join ', ')."
}

$targetSerial = Get-RunningAvdSerial -AdbPath $adb -Name $AvdName
if (-not $targetSerial) {
  Write-Host "Iniciando emulador compacto $AvdName..."
  Start-Process `
    -FilePath $emulator `
    -ArgumentList @("-avd", $AvdName)

  $emulatorDeadline = (Get-Date).AddMinutes(3)
  while ((Get-Date) -lt $emulatorDeadline -and -not $targetSerial) {
    Start-Sleep -Seconds 2
    $targetSerial = Get-RunningAvdSerial -AdbPath $adb -Name $AvdName
  }
}

if (-not $targetSerial) {
  throw "Emulador '$AvdName' não ficou disponível dentro de 3 minutos."
}

$bootDeadline = (Get-Date).AddMinutes(2)
do {
  $bootCompleted = (& $adb -s $targetSerial shell getprop sys.boot_completed 2>$null).Trim()
  if ($bootCompleted -eq "1") {
    break
  }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $bootDeadline)

if ($bootCompleted -ne "1") {
  throw "Android não concluiu a inicialização no emulador '$AvdName'."
}

Write-Host "Executando no $AvdName ($targetSerial)."
& $adb -s $targetSerial reverse "tcp:$metroPort" "tcp:$metroPort" | Out-Null
& $adb -s $targetSerial reverse "tcp:$apiPort" "tcp:$apiPort" | Out-Null
Write-Host "ADB reverse configurado para portas $metroPort e $apiPort."

& $npmCommand run android --prefix $mobileRoot -- `
  --no-packager `
  --active-arch-only `
  --device $targetSerial
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $adb -s $targetSerial reverse "tcp:$metroPort" "tcp:$metroPort" | Out-Null
& $adb -s $targetSerial reverse "tcp:$apiPort" "tcp:$apiPort" | Out-Null
