# LedgerOne PowerShell Orchestrator Launcher
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$PythonExe = "$ScriptDir\scripts\.venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    $PythonExe = "python"
}

& $PythonExe "$ScriptDir\scripts\orchestrate.py" @args
