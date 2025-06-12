@echo off
REM Commands to activate the virtual environment and install requirements

REM Show the active operation
echo ======================================================================
echo                     WEATHER DASHBOARD STARTUP
echo ======================================================================

REM Navigate to the weather_dashboard directory
cd C:\Users\e191866\OneDrive - Applied Materials\search_team\Siba_teaching\weather_dashboard

REM Run the check_env script before activation to show differences
echo BEFORE ACTIVATION - CHECKING ENVIRONMENT:
echo ------------------------------------------------
call check_env.bat

REM Clearly show the virtual environment is being activated
echo.
echo ACTIVATING VIRTUAL ENVIRONMENT...
echo ------------------------------------------------
call .\weather\Scripts\activate.bat

REM Run check_env again to show the activated environment
echo.
echo AFTER ACTIVATION - CHECKING ENVIRONMENT:
echo ------------------------------------------------
call check_env.bat

REM Install requirements from requirements.txt
echo.
echo INSTALLING REQUIREMENTS...
echo ------------------------------------------------
pip install -r requirements.txt

REM Show a clear divider before starting the server
echo.
echo ======================================================================
echo                STARTING SERVER ON PORT 8080
echo ======================================================================
echo.

REM Run the application with explicit port 8080 to match app.py and include detailed logging
uvicorn app:app --reload --port 8080 --log-level debug

REM Keep the window open if there's an error
pause
