@echo off
setlocal
cd /d "%~dp0"

REM Check for virtualenv Python
if exist "scripts\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=scripts\.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

"%PYTHON_EXE%" "scripts\orchestrate.py" %*
endlocal
