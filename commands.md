# Weather Dashboard Application Commands

This document contains all the essential commands for setting up, running, and working with the Weather Dashboard application.

## Virtual Environment Management

### Activating the Virtual Environment

```powershell
# Navigate to the weather_dashboard directory
cd C:\Users\e191866\OneDrive - Applied Materials\search_team\Siba_teaching\weather_dashboard

# Activate the virtual environment
.\weather\Scripts\Activate.ps1
```

When the virtual environment is activated, you'll see `(weather)` at the beginning of your PowerShell prompt.

### Deactivating the Virtual Environment

```powershell
deactivate
```

## Package Management

### Installing Requirements

```powershell
# Make sure your virtual environment is activated first
pip install -r requirements.txt
```

### Checking Package Versions

```powershell
# Check version of a specific package
pip show fastapi        # Replace fastapi with any package name

# List all installed packages with versions
pip list

# Check version using Python
python -c "import fastapi; print(fastapi.__version__)"
```

### Installing Additional Packages

```powershell
# Install a specific package
pip install package_name

# Install a specific version of a package
pip install package_name==1.2.3
```

## Running the Application

### Starting the Application

```powershell
# Make sure your virtual environment is activated
uvicorn app:app --reload
```

### Using the Batch File

```powershell
# Simply run the batch file (will activate venv, install requirements, and start server)
.\start_app.bat
```

### Access the Application

After starting the server, access the application at:
- http://127.0.0.1:8000 or
- http://localhost:8000

## Database Management

### Resetting the Database

If you need to reset the database:

```powershell
# Delete the database file
Remove-Item weather_dashboard.db

# Restart the application (it will recreate the DB)
uvicorn app:app --reload
```

### Accessing SQLite Database Directly

```powershell
# Install sqlite3 tool if needed
# Then access the database
sqlite3 weather_dashboard.db

# Some useful SQLite commands:
# .tables                  # List all tables
# .schema users           # Show schema for the users table
# SELECT * FROM users;    # List all users
# .quit                   # Exit SQLite
```

## Development Workflow

### Starting a Development Session

```powershell
# 1. Navigate to project directory
cd C:\Users\e191866\OneDrive - Applied Materials\search_team\Siba_teaching\weather_dashboard

# 2. Activate the virtual environment
.\weather\Scripts\Activate.ps1

# 3. Start the server with auto-reload
uvicorn app:app --reload
```

### API Documentation

FastAPI automatically generates documentation for your APIs. After starting the server:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Default User Credentials

The application comes with a pre-configured test user:
- Username: `demo`
- Password: `password`

Use these credentials to test the application without registering a new user.

## Troubleshooting

### PowerShell Execution Policy Issues

If you encounter execution policy errors when running scripts:

```powershell
# Option 1: Change policy for current session only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Option 2: Change policy for current user (more permanent)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Authentication Issues (401 Unauthorized)

If you see 401 Unauthorized errors in the console:

1. Make sure you're logged in with correct credentials
2. The default user is:
   - Username: `demo`
   - Password: `password`
3. If still having issues, try clearing browser cache or opening in incognito mode
4. Restart the application to ensure the sample user is properly created

### Visualization Not Found (404 Error)

If temperature charts return 404 errors:

1. Make sure you've searched for weather data for at least one city first
2. Check if the `static` folder has proper write permissions
3. Restart the application and try again

### Package Installation Issues

```powershell
# Update pip itself
python -m pip install --upgrade pip

# If a package fails to install
pip install --no-cache-dir package_name
```

### Port Already in Use

If port 8000 is already in use, specify a different port:

```powershell
uvicorn app:app --reload --port 8001
```

Then access the application at http://127.0.0.1:8001
