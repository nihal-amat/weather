@echo off
echo Deactivating virtual environment...

REM For standard Python venv
if defined VIRTUAL_ENV (
    echo Detected standard virtual environment, deactivating...
    call deactivate
) else (
    echo No standard virtual environment detected.
    
    REM Check for conda environment as fallback
    if defined CONDA_PREFIX (
        echo Detected conda environment, deactivating...
        call conda deactivate
    ) else (
        echo No active environments detected.
    )
)

echo.
echo Checking current environment:
call check_env.bat
echo.
if not defined VIRTUAL_ENV (
    echo Successfully deactivated - now using system Python environment
) else (
    echo WARNING: Environment is still active: %VIRTUAL_ENV%
    echo Try closing this terminal and opening a new one.
)
