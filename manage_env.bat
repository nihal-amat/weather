@echo off
echo ======================================================================
echo                   CONDA ENVIRONMENT MANAGEMENT
echo ======================================================================

if "%1"=="activate" goto :activate
if "%1"=="deactivate" goto :deactivate
if "%1"=="status" goto :status

echo.
echo Missing or invalid parameter. Please use:
echo.
echo   manage_env.bat activate   - Activate weather environment
echo   manage_env.bat deactivate - Return to base/system environment
echo   manage_env.bat status     - Show current environment status
echo.
goto :end

:activate
echo.
echo Activating weather environment...
call .\weather\Scripts\activate.bat
goto :status

:deactivate
echo.
echo Deactivating current environment...
call conda deactivate
if defined CONDA_PREFIX (
    if not "!CONDA_PREFIX:%USERPROFILE%\anaconda3=!"=="!CONDA_PREFIX!" (
        echo Still in a conda environment, activating base...
        call conda activate base
    )
)
goto :status

:status
echo.
echo ======================================================================
echo                   CURRENT ENVIRONMENT STATUS
echo ======================================================================
echo.
echo Python location:
where python 2>nul
if %ERRORLEVEL% NEQ 0 echo Python not found in PATH
echo.
echo Python version:
python --version 2>nul
if %ERRORLEVEL% NEQ 0 echo Python not found
echo.
echo Conda info:
conda info --envs 2>nul
if %ERRORLEVEL% NEQ 0 echo Conda information not available
echo.
if defined CONDA_PREFIX (
    echo Active conda environment: %CONDA_PREFIX%
) else (
    if defined VIRTUAL_ENV (
        echo Active virtual environment: %VIRTUAL_ENV%
    ) else (
        echo No virtual environment is active
    )
)
echo ======================================================================

:end
