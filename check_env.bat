@echo off
REM Script to check and display the active Python environment

echo =====================================================
echo ACTIVE PYTHON ENVIRONMENT INFORMATION
echo =====================================================
echo.
echo Python interpreter location:
where python
echo.
echo pip location:
where pip
echo.
echo Current Python version:
python --version
echo.
echo Python interpreter path:
python -c "import sys; print(sys.executable)"
echo.
if defined VIRTUAL_ENV (
    echo Virtual environment is ACTIVE
    echo Virtual environment path: %VIRTUAL_ENV%
) else (
    echo No virtual environment is active
)
echo =====================================================
