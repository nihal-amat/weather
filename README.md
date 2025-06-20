# Weather Dashboard Application

This full-stack weather dashboard application demonstrates the Python concepts covered in Agenda weeks 1-3, including data structures, object-oriented programming, APIs, database management, and data visualization.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Weather Data**: Search for current weather information by city name
- **Favorites**: Save and manage favorite cities for quick access
- **Search History**: Track your previous weather searches
- **Statistics**: View aggregated weather statistics for your searches
- **Data Visualization**: Temperature trends visualized with charts

## Technologies Used

### Frontend
- HTML5, CSS3, JavaScript
- Responsive design with CSS Grid and Flexbox
- Data visualization with Matplotlib (server-side rendering)

### Backend
- FastAPI for API endpoints
- SQLite for database storage
- Pydantic for data validation
- Authentication with HTTP Basic Auth
- Matplotlib and Pandas for data analysis and visualization

## Python Concepts Demonstrated

### Basic Python (Week 1)
- Variables, data types, and operators
- Control flow (if/else statements, loops)
- Functions and modules
- Error handling
- File operations

### Data Structures and Algorithms (Week 2)
- Lists, dictionaries, sets for data management
- Classes and objects for structured code
- Algorithm design patterns
- Working with complex data structures

### Libraries and APIs (Week 3)
- FastAPI for building RESTful APIs
- SQLite for database operations
- Pandas for data analysis
- Matplotlib for data visualization
- HTTP request handling

## Project Structure

```
weather_dashboard/
│
├── app.py                 # Main application file with FastAPI code
├── weather_dashboard.db   # SQLite database (created on first run)
│
├── static/                # Static files
│   ├── css/
│   │   └── style.css      # Application styles
│   └── js/
│       └── script.js      # Frontend JavaScript
│
└── templates/
    └── index.html         # Main HTML template
```

## How to Run

1. Make sure you have Python 3.7+ installed
2. Install the required packages:
   ```
   pip install fastapi uvicorn numpy pandas matplotlib
   ```
3. Navigate to the project directory:
   ```
   cd weather_dashboard
   ```
4. Start the application:
   ```
   uvicorn app:app --reload
   ```
5. Open your browser and navigate to `http://127.0.0.1:8000`

### Troubleshooting Port Connection Issues

If you experience issues connecting to the default port (8000), the following steps may help:

1. **Use an alternate port**: Port 8000 may be blocked by firewalls or used by other services. Try running the application on a different port:
   ```
   uvicorn app:app --reload --port 8080
   ```
   Then navigate to `http://127.0.0.1:8080`

2. **Check firewall settings**: Ensure your firewall is allowing connections to the port. You may need to add an exception for Python or uvicorn.

3. **Clear browser cache**: If you've previously accessed the application, try clearing your browser cache and cookies.

4. **Try a different browser**: If one browser is having issues, try another like Chrome, Firefox, or Edge.

5. **Check for proxy settings**: Corporate networks may have proxy settings that affect localhost connections.

6. **Restart your computer**: Sometimes a simple restart can resolve port binding issues.

For convenience, we've included `run_alt_port.py` which starts the server on port 8080:

## Default User

A default test user is automatically created for you:
- Username: `demo`
- Password: `password`

## Implementation Details

- **Authentication**: Uses salted hashing for password security
- **Database**: SQLite with foreign key constraints for data integrity
- **API Endpoints**: RESTful design with clear semantics
- **Data Visualization**: Dynamic chart generation based on user data
- **Mock Weather Data**: Simulated API for demonstration purposes (easily replaceable with a real weather API)

## Extending the Application

You can extend this application in several ways:
- Connect to a real weather API (OpenWeatherMap, WeatherAPI, etc.)
- Add more visualization types (humidity, pressure trends, etc.)
- Implement user preferences and settings
- Add social sharing features
- Create a mobile-friendly PWA version

