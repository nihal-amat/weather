"""
Weather Dashboard Application

This application demonstrates concepts from Python crash course weeks 1-3:
- FastAPI for backend API development
- Data structures for storing and manipulating weather data
- SQL database for user management and weather data history
- Authentication using secure password hashing
- Data visualization with matplotlib
- External API integration for weather data
"""

import os
import json
import sqlite3
import hashlib
import secrets
import requests
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Weather Dashboard",
    description="An end-to-end weather application demonstrating Python concepts",
    version="1.0.0"
)

# Setup templates and static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
security = HTTPBasic()

# Initialize SQLite database
DB_PATH = "weather_dashboard.db"

def init_db():
    """Initialize the SQLite database with tables if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create weather_data table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        city TEXT NOT NULL,
        temperature REAL,
        humidity REAL,
        pressure REAL,
        wind_speed REAL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Create favorites table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        city TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, city)
    )
    ''')
    
    conn.commit()
    conn.close()

# Call init_db at startup
init_db()

# Create sample user for testing if it doesn't exist
def create_sample_user():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE username = ?", ("demo",))
    if not cursor.fetchone():
        # Create sample user with password 'password'
        hashed_password = get_password_hash("password")
        cursor.execute(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            ("demo", hashed_password, "demo@example.com")
        )
        conn.commit()
    
    conn.close()

# Pydantic models
class User(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None

class WeatherData(BaseModel):
    city: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    description: str

class FavoriteCity(BaseModel):
    city: str

# Authentication utilities
def get_password_hash(password: str) -> str:
    """Generate a salted SHA-256 hash for password"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256(password.encode() + salt.encode())
    return f"{salt}${hash_obj.hexdigest()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a salted hash"""
    if not hashed_password or "$" not in hashed_password:
        return False
    
    salt, hash_value = hashed_password.split("$", 1)
    password_hash = hashlib.sha256(plain_password.encode() + salt.encode()).hexdigest()
    return password_hash == hash_value

# Now that the password hash function is defined, we can create our sample user
create_sample_user()

def authenticate_user(credentials: HTTPBasicCredentials = Depends(security)):
    """Authenticate a user with HTTP Basic Auth"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, password FROM users WHERE username = ?", (credentials.username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(credentials.password, user[1]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return {"user_id": user[0], "username": credentials.username}

# Open-Meteo API base URL
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Real weather API function using Open-Meteo
def get_weather_data(city: str) -> Dict[str, Any]:
    """
    Get weather data for a city using Open-Meteo API.
    Open-Meteo doesn't require an API key.
    """
    try:
        # Open-Meteo needs geocoding first (converting city name to latitude/longitude)
        geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        geocoding_response = requests.get(geocoding_url, verify = False)
        geocoding_response.raise_for_status()
        geocoding_data = geocoding_response.json()
        print(f"Geocoding response for {city}: {geocoding_response.text}")
        # Check if location was found
        if not geocoding_data.get("results"):
            print(f"Location not found for: {city}")
            return get_mock_weather_data(city)
        
        # Write geocoding data to a text file
        with open(f"{city}_geocoding.txt", "w") as file:
            file.write(json.dumps(geocoding_data, indent=4))
        # Get lat/lon from geocoding
        location = geocoding_data["results"][0]
        lat = location["latitude"]
        lon = location["longitude"]
        location_name = location["name"]
        
        # Make API request to Open-Meteo with lat/lon
        weather_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code",
            "timezone": "auto"
        }
        
        weather_response = requests.get(OPEN_METEO_URL, params=weather_params, verify = False)
        weather_response.raise_for_status()
        data = weather_response.json()
        
        # Map weather code to description
        # Based on WMO Weather interpretation codes (WW)
        weather_code = data["current"]["weather_code"]
        # weather_code = 1000
        weather_descriptions = {
            0: "Clear sky",
            1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Fog", 48: "Depositing rime fog",
            51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
            56: "Light freezing drizzle", 57: "Dense freezing drizzle",
            61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
            66: "Light freezing rain", 67: "Heavy freezing rain",
            71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
            85: "Slight snow showers", 86: "Heavy snow showers",
            95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
        }
        
        description = weather_descriptions.get(weather_code, "Unknown")
        
        # Extract relevant weather data
        weather_data = {
            "city": location_name,
            "temperature": data["current"]["temperature_2m"],
            "humidity": data["current"]["relative_humidity_2m"],
            "pressure": data["current"]["pressure_msl"],
            "wind_speed": data["current"]["wind_speed_10m"],
            "description": description,
            "timestamp": datetime.now().isoformat()
        }
            
        return weather_data
        
    except Exception as e:
        # On error, fall back to mock data
        print(f"Error fetching weather data: {e}")
        return get_mock_weather_data(city)

# Fallback mock weather function
def get_mock_weather_data(city: str) -> Dict[str, Any]:
    """
    Get mock weather data for a city when API is unavailable or for testing
    """
    # Generate some pseudo-random but consistent data based on city name
    city_hash = sum(ord(c) for c in city)
    
    # Base temperature around 20°C with variance
    temperature = 20 + (city_hash % 15)
    
    # Humidity between 30% and 90%
    humidity = 30 + (city_hash % 60)
    
    # Pressure around 1013 hPa with variance
    pressure = 1000 + (city_hash % 30)
    
    # Wind speed between 0 and 15 m/s
    wind_speed = city_hash % 15
    
    # Pick a weather description based on temperature
    if temperature > 25:
        description = "Sunny"
    elif temperature > 20:
        description = "Partly Cloudy"
    elif temperature > 15:
        description = "Cloudy"
    elif temperature > 10:
        description = "Rainy"
    else:
        description = "Stormy"
    
    return {
        "city": city,
        "temperature": temperature,
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": wind_speed,
        "description": description,
        "timestamp": datetime.now().isoformat()
    }

# API Routes

@app.get("/", response_class=HTMLResponse)
async def get_home_page(request: Request):
    """Render the home page template"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/register")
async def register_user(user: User):
    """Register a new user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        hashed_password = get_password_hash(user.password)
        cursor.execute(
            "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
            (user.username, hashed_password, user.email)
        )
        conn.commit()
        
        # Get the new user's ID
        cursor.execute("SELECT last_insert_rowid()")
        user_id = cursor.fetchone()[0]
        
        return {"id": user_id, "username": user.username, "message": "User registered successfully"}
    
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    finally:
        conn.close()

@app.post("/api/login")
async def login(user: User):
    """Login a user and return user info"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, password, email FROM users WHERE username = ?", (user.username,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user[1]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    return {
        "id": db_user[0],
        "username": user.username,
        "email": db_user[2],
        "message": "Login successful"
    }

@app.get("/api/weather/{city}")
async def get_weather(city: str, user=Depends(authenticate_user)):
    """Get current weather data for a city"""
    # Get weather data (mock or from an external API)
    weather = get_weather_data(city)
    
    # Store the request in the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        """
        INSERT INTO weather_data 
        (user_id, city, temperature, humidity, pressure, wind_speed, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user["user_id"], 
            city,
            weather["temperature"],
            weather["humidity"],
            weather["pressure"],
            weather["wind_speed"],
            weather["description"]
        )
    )
    conn.commit()
    conn.close()
    
    return weather

@app.get("/api/history")
async def get_history(days: int = 7, user=Depends(authenticate_user)):
    """Get weather search history for the authenticated user"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get history from the last X days
    cursor.execute(
        """
        SELECT city, temperature, humidity, pressure, wind_speed, description, timestamp
        FROM weather_data
        WHERE user_id = ? AND timestamp > date('now', ?)
        ORDER BY timestamp DESC
        """,
        (user["user_id"], f"-{days} days")
    )
    
    history = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return history

@app.post("/api/favorites")
async def add_favorite(favorite: FavoriteCity, user=Depends(authenticate_user)):
    """Add a city to user's favorites"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO favorites (user_id, city) VALUES (?, ?)",
            (user["user_id"], favorite.city)
        )
        conn.commit()
        return {"message": f"{favorite.city} added to favorites"}
    
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="City already in favorites"
        )
    finally:
        conn.close()

@app.get("/api/favorites")
async def get_favorites(user=Depends(authenticate_user)):
    """Get list of favorite cities for the authenticated user"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, city FROM favorites WHERE user_id = ?",
        (user["user_id"],)
    )
    
    favorites = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return favorites

@app.delete("/api/favorites/{city}")
async def delete_favorite(city: str, user=Depends(authenticate_user)):
    """Remove a city from user's favorites"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "DELETE FROM favorites WHERE user_id = ? AND city = ?",
        (user["user_id"], city)
    )
    conn.commit()
    
    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found in favorites"
        )
    
    conn.close()
    return {"message": f"{city} removed from favorites"}

@app.get("/api/stats")
async def get_stats(user=Depends(authenticate_user)):
    """Get weather statistics for the authenticated user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get statistics for the user's searches
    cursor.execute(
        """
        SELECT 
            city, 
            COUNT(*) as search_count,
            AVG(temperature) as avg_temperature,
            AVG(humidity) as avg_humidity,
            AVG(pressure) as avg_pressure,
            AVG(wind_speed) as avg_wind_speed
        FROM weather_data
        WHERE user_id = ?
        GROUP BY city
        ORDER BY search_count DESC
        LIMIT 5
        """,
        (user["user_id"],)
    )
    
    stats = [
        {
            "city": row[0],
            "search_count": row[1],
            "avg_temperature": row[2],
            "avg_humidity": row[3],
            "avg_pressure": row[4],
            "avg_wind_speed": row[5]
        }
        for row in cursor.fetchall()
    ]
    
    conn.close()
    return stats

@app.get("/api/visualization/temperature")
async def get_temperature_chart(days: int = 7, user=Depends(authenticate_user)):
    """Generate a visualization of temperature data over time"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        """
        SELECT city, temperature, timestamp
        FROM weather_data
        WHERE user_id = ? AND timestamp > date('now', ?)
        ORDER BY timestamp
        """,
        (user["user_id"], f"-{days} days")
    )
    
    data = cursor.fetchall()
    conn.close()
    
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No temperature data found"
        )
    
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(data, columns=['city', 'temperature', 'timestamp'])
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Group by city
    cities = df['city'].unique()
    
    # Create visualization
    plt.figure(figsize=(10, 6))
    
    for city in cities:
        city_data = df[df['city'] == city]
        plt.plot(city_data['timestamp'], city_data['temperature'], 'o-', label=city)
    
    plt.title('Temperature Trends by City')
    plt.xlabel('Date/Time')
    plt.ylabel('Temperature (°C)')
    plt.grid(True)
    plt.legend()
      # Make sure the static directory exists
    os.makedirs("static", exist_ok=True)
    
    # Save visualization to a file with absolute path
    chart_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "temperature_chart.png")
    plt.savefig(chart_path)
    plt.close()
    
    # Return the file response with appropriate content type
    return FileResponse(chart_path, media_type="image/png")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8080, reload=True)
