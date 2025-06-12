// Weather Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentWeather = document.getElementById('current-weather');
    const favoritesList = document.getElementById('favorites-list');
    const historyData = document.getElementById('history-data');
    const statsContainer = document.getElementById('stats-container');
    const tempChart = document.getElementById('temp-chart');
    const daysSelect = document.getElementById('days-select');
    const updateChartBtn = document.getElementById('update-chart-btn');
    
    // Authentication elements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const authModal = document.getElementById('auth-modal');
    const closeBtn = document.querySelector('.close');
    const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
    const modalTabPanes = document.querySelectorAll('.modal-tab-pane');
    const loginForm = document.getElementById('login-form-el');
    const registerForm = document.getElementById('register-form-el');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Authentication state
    let isAuthenticated = false;
    let authData = null;
    
    // Check if user is already logged in (session storage)
    function checkAuthentication() {
        const storedAuthData = sessionStorage.getItem('authData');
        if (storedAuthData) {
            authData = JSON.parse(storedAuthData);
            isAuthenticated = true;
            updateAuthUI();
            loadUserData();
        }
    }
    
    // Update UI based on authentication state
    function updateAuthUI() {
        if (isAuthenticated && authData) {
            usernameDisplay.textContent = `Welcome, ${authData.username}!`;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            usernameDisplay.textContent = 'Not logged in';
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }
    
    // Load user data (favorites, history, etc.)
    function loadUserData() {
        if (isAuthenticated) {
            fetchFavorites();
            fetchHistory();
            fetchStats();
            fetchVisualization(daysSelect.value);
        } else {
            favoritesList.innerHTML = '<li>Please login to see favorites</li>';
            historyData.innerHTML = '<tr><td colspan="4">Please login to see history</td></tr>';
            statsContainer.innerHTML = '<div class="placeholder"><p>Please login to see statistics</p></div>';
            tempChart.src = '';
        }
    }
    
    // Event Listeners for Auth UI
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        document.querySelector('[data-tab="login-form"]').click();
    });
    
    registerBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        document.querySelector('[data-tab="register-form"]').click();
    });
    
    closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });
    
    // Switch between modal tabs
    modalTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-tab');
            modalTabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Switch between main content tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.getAttribute('data-tab') + '-tab';
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
              const data = await response.json();
            
            if (response.ok) {
                // Store both the response data and the password for Basic Auth
                authData = {
                    ...data,
                    password: password // Store the password for Basic Auth
                };
                isAuthenticated = true;
                sessionStorage.setItem('authData', JSON.stringify(authData));
                
                updateAuthUI();
                loadUserData();
                authModal.style.display = 'none';
                loginForm.reset();
                
                loginMessage.textContent = '';
            } else {
                loginMessage.textContent = data.detail || 'Login failed';
                loginMessage.classList.add('error-message');
            }
        } catch (error) {
            loginMessage.textContent = 'An error occurred during login';
            loginMessage.classList.add('error-message');
            console.error('Login error:', error);
        }
    });
    
    // Register Form Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            registerMessage.textContent = 'Passwords do not match';
            registerMessage.classList.add('error-message');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                registerMessage.textContent = 'Registration successful! You can now login.';
                registerMessage.classList.remove('error-message');
                registerMessage.classList.add('success-message');
                registerForm.reset();
                
                // Switch to login tab after successful registration
                setTimeout(() => {
                    document.querySelector('[data-tab="login-form"]').click();
                }, 2000);
            } else {
                registerMessage.textContent = data.detail || 'Registration failed';
                registerMessage.classList.add('error-message');
            }
        } catch (error) {
            registerMessage.textContent = 'An error occurred during registration';
            registerMessage.classList.add('error-message');
            console.error('Registration error:', error);
        }
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        authData = null;
        isAuthenticated = false;
        sessionStorage.removeItem('authData');
        updateAuthUI();
        loadUserData();
    });
    
    // Search for weather
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });
    
    cityInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });
    
    // Update chart button
    updateChartBtn.addEventListener('click', () => {
        const days = daysSelect.value;
        fetchVisualization(days);
    });
    
    // Fetch weather data
    async function fetchWeather(city) {
        if (!isAuthenticated) {
            alert('Please login to view weather data');
            loginBtn.click();
            return;
        }
        
        try {
            // Show loading state
            currentWeather.innerHTML = `<div class="placeholder">
                <i class="fas fa-spinner fa-spin fa-3x"></i>
                <p>Loading weather data...</p>
            </div>`;
            
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch(`/api/weather/${encodeURIComponent(city)}`, {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }
            
            const data = await response.json();
            
            // Update UI with weather data
            displayWeather(data);
            
            // Refresh history and visualization
            fetchHistory();
            fetchVisualization(daysSelect.value);
            
        } catch (error) {
            currentWeather.innerHTML = `<div class="placeholder">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>Error loading weather data</p>
            </div>`;
            console.error('Weather fetch error:', error);
        }
    }
    
    // Display weather data
    function displayWeather(data) {
        // Select weather icon based on description
        let iconClass = 'fas fa-cloud';
        if (data.description.toLowerCase().includes('sun') || data.description.toLowerCase().includes('clear')) {
            iconClass = 'fas fa-sun';
        } else if (data.description.toLowerCase().includes('rain')) {
            iconClass = 'fas fa-cloud-rain';
        } else if (data.description.toLowerCase().includes('storm')) {
            iconClass = 'fas fa-bolt';
        } else if (data.description.toLowerCase().includes('snow')) {
            iconClass = 'fas fa-snowflake';
        } else if (data.description.toLowerCase().includes('cloud')) {
            iconClass = 'fas fa-cloud';
        }
        
        // Create HTML for weather display
        currentWeather.innerHTML = `
            <i class="${iconClass} weather-icon"></i>
            <h2 class="city-name">${data.city}</h2>
            <p class="temperature">${data.temperature.toFixed(1)}°C</p>
            <p class="weather-description">${data.description}</p>
            
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-tint detail-icon"></i>
                    <span class="detail-value">${data.humidity}%</span>
                    <span class="detail-label">Humidity</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind detail-icon"></i>
                    <span class="detail-value">${data.wind_speed} m/s</span>
                    <span class="detail-label">Wind</span>
                </div>
                <div class="detail">
                    <i class="fas fa-compress-alt detail-icon"></i>
                    <span class="detail-value">${data.pressure} hPa</span>
                    <span class="detail-label">Pressure</span>
                </div>
            </div>
            
            <button id="add-favorite-btn" class="btn" data-city="${data.city}">
                <i class="fas fa-heart"></i> Add to Favorites
            </button>
        `;
        
        // Add event listener to favorite button
        document.getElementById('add-favorite-btn').addEventListener('click', function() {
            const city = this.getAttribute('data-city');
            addFavorite(city);
        });
    }
    
    // Fetch user's favorites
    async function fetchFavorites() {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Favorites fetch failed');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                favoritesList.innerHTML = '<li>No favorite cities yet</li>';
                return;
            }
            
            // Display favorites
            favoritesList.innerHTML = '';
            data.forEach(favorite => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="favorite-city">${favorite.city}</span>
                    <div>
                        <button class="view-favorite" data-city="${favorite.city}">View</button>
                        <button class="remove-favorite" data-city="${favorite.city}">Remove</button>
                    </div>
                `;
                favoritesList.appendChild(li);
            });
            
            // Add event listeners to favorite buttons
            document.querySelectorAll('.view-favorite').forEach(btn => {
                btn.addEventListener('click', function() {
                    const city = this.getAttribute('data-city');
                    fetchWeather(city);
                });
            });
            
            document.querySelectorAll('.remove-favorite').forEach(btn => {
                btn.addEventListener('click', function() {
                    const city = this.getAttribute('data-city');
                    removeFavorite(city);
                });
            });
            
        } catch (error) {
            favoritesList.innerHTML = '<li>Error loading favorites</li>';
            console.error('Favorites fetch error:', error);
        }
    }
    
    // Add city to favorites
    async function addFavorite(city) {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ city })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400 && errorData.detail === "City already in favorites") {
                    alert('This city is already in your favorites');
                } else {
                    throw new Error('Add favorite failed');
                }
                return;
            }
            
            // Refresh favorites list
            fetchFavorites();
            
        } catch (error) {
            console.error('Add favorite error:', error);
            alert('Failed to add favorite');
        }
    }
    
    // Remove city from favorites
    async function removeFavorite(city) {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch(`/api/favorites/${encodeURIComponent(city)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Remove favorite failed');
            }
            
            // Refresh favorites list
            fetchFavorites();
            
        } catch (error) {
            console.error('Remove favorite error:', error);
            alert('Failed to remove favorite');
        }
    }
    
    // Fetch user's search history
    async function fetchHistory() {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch('/api/history', {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('History fetch failed');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                historyData.innerHTML = '<tr><td colspan="4">No search history yet</td></tr>';
                return;
            }
            
            // Display history
            historyData.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                // Format date
                const date = new Date(item.timestamp);
                const formattedDate = date.toLocaleString();
                
                row.innerHTML = `
                    <td>${item.city}</td>
                    <td>${item.temperature.toFixed(1)}°C</td>
                    <td>${item.description}</td>
                    <td>${formattedDate}</td>
                `;
                historyData.appendChild(row);
            });
            
        } catch (error) {
            historyData.innerHTML = '<tr><td colspan="4">Error loading history</td></tr>';
            console.error('History fetch error:', error);
        }
    }
    
    // Fetch user's stats
    async function fetchStats() {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            const response = await fetch('/api/stats', {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Stats fetch failed');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                statsContainer.innerHTML = '<div class="placeholder"><p>No statistics available yet</p></div>';
                return;
            }
            
            // Display stats
            statsContainer.innerHTML = '<div class="stats-grid"></div>';
            const statsGrid = document.querySelector('.stats-grid');
            
            data.forEach(item => {
                const statCard = document.createElement('div');
                statCard.className = 'stats-card';
                statCard.innerHTML = `
                    <h3>${item.city}</h3>
                    <p><strong>Searches:</strong> ${item.search_count}</p>
                    <p><strong>Average Temperature:</strong> ${item.avg_temperature.toFixed(1)}°C</p>
                    <p><strong>Average Humidity:</strong> ${item.avg_humidity.toFixed(1)}%</p>
                    <p><strong>Average Pressure:</strong> ${item.avg_pressure.toFixed(1)} hPa</p>
                    <p><strong>Average Wind:</strong> ${item.avg_wind_speed.toFixed(1)} m/s</p>
                `;
                statsGrid.appendChild(statCard);
            });
            
        } catch (error) {
            statsContainer.innerHTML = '<div class="placeholder"><p>Error loading statistics</p></div>';
            console.error('Stats fetch error:', error);
        }
    }
    
    // Fetch temperature visualization
    async function fetchVisualization(days) {
        if (!isAuthenticated) return;
        
        try {
            // Get Basic Auth header
            const credentials = btoa(`${authData.username}:${authData.password}`);
            
            // Show loading state
            tempChart.src = '';
            tempChart.alt = 'Loading chart...';
            
            // Fetch the chart with cache-busting parameter
            tempChart.src = `/api/visualization/temperature?days=${days}&_cache=${Date.now()}`;
            
        } catch (error) {
            tempChart.alt = 'Error loading chart';
            console.error('Visualization fetch error:', error);
        }
    }
    
    // Initialize the application
    function init() {
        checkAuthentication();
    }
    
    // Start the application
    init();
});
