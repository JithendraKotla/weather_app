const apiKey = '19caad9dff9836bcea2d032bd1f499b7'; // Replace with your OpenWeatherMap API key
let isCelsius = true;
let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
function getWeather(city = null) {
    const inputCity = city || document.getElementById('cityInput').value.trim();
    if (!inputCity) {
        document.getElementById('weatherResult').innerHTML = `<p class="error">Please enter a city name!</p>`;
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) throw new Error('City not found. Try adding a country code (e.g., "London, UK")!');
                if (response.status === 401) throw new Error('Invalid API key. Please check your key!');
                throw new Error('Something went wrong. Please try again.');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            checkWeatherAlert(data); // New alert feature
            updateSearchHistory(inputCity);
            suggestMood(data.weather[0].main);
            setDynamicBackground(data.weather[0].main); // Updated colors
            getMiniForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            document.getElementById('weatherResult').innerHTML = `<p class="error">${error.message}</p>`;
        });
}

// New Function: Weather Alerts
function checkWeatherAlert(data) {
    if (data.main.temp > 35 && isCelsius) {
        alert("Extreme Heat Warning: Stay hydrated and avoid direct sunlight!");
    } else if (data.weather[0].main === 'Thunderstorm') {
        alert("Thunderstorm Alert: Stay indoors and avoid open fields!");
    }
}

// Updated Function: Dynamic Background with New Colors
function setDynamicBackground(weatherType) {
    const body = document.body;
    switch (weatherType.toLowerCase()) {
        case 'clear': 
            body.style.background = 'linear-gradient(135deg, #ffcc00, #ff5733)'; /* Yellow to Orange */
            break;
        case 'rain': 
            body.style.background = 'linear-gradient(135deg, #3366ff, #6600cc)'; /* Blue to Purple */
            break;
        case 'clouds': 
            body.style.background = 'linear-gradient(135deg, #66cccc, #999999)'; /* Teal to Gray */
            break;
        default: 
            body.style.background = 'linear-gradient(135deg, #00ddeb, #ff00cc)'; /* Cyan to Magenta */
    }
}

function displayWeather(data) {
    const unit = isCelsius ? '°C' : '°F';
    document.getElementById('weatherResult').innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
        <p>Temperature: ${data.main.temp}${unit}</p>
        <p>Feels Like: ${data.main.feels_like}${unit}</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
    `;
}

function toggleUnits() {
    isCelsius = !isCelsius;
    document.getElementById('unitToggle').textContent = isCelsius ? '°C / °F' : '°F / °C';
    const lastCity = searchHistory[0];
    if (lastCity) getWeather(lastCity);
}

// Unique Feature: Dynamic Background
function setDynamicBackground(weatherType) {
    const body = document.body;
    switch (weatherType.toLowerCase()) {
        case 'clear': body.style.background = 'linear-gradient(135deg, #ffdd57, #ff6f61)'; break;
        case 'rain': body.style.background = 'linear-gradient(135deg, #4a90e2, #2c3e50)'; break;
        case 'clouds': body.style.background = 'linear-gradient(135deg, #bdc3c7, #7f8c8d)'; break;
        default: body.style.background = 'linear-gradient(135deg, #74ebd5, #acb6e5)';
    }
}

// Unique Feature: Mini Forecast
function getMiniForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecast = data.list.slice(0, 3); // Next 3 time slots (9 hours)
            document.getElementById('forecast').innerHTML = `
                <h3>Next Few Hours</h3>
                ${forecast.map(item => `
                    <div class="forecast-item">
                        <p>${new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Icon">
                        <p>${item.main.temp}${isCelsius ? '°C' : '°F'}</p>
                    </div>
                `).join('')}
            `;
        });
}

// Mood Suggestion
function suggestMood(weatherType) {
    const moodCard = document.getElementById('moodSuggestion');
    let suggestion = '';
    switch (weatherType.toLowerCase()) {
        case 'clear': suggestion = 'Perfect for a picnic or a sunny hike!'; break;
        case 'rain': suggestion = 'Time for a cozy movie marathon indoors.'; break;
        case 'clouds': suggestion = 'Ideal for a coffee date or sketching.'; break;
        default: suggestion = 'Enjoy the day your way!';
    }
    moodCard.innerHTML = `<h3>Weather Mood</h3><p>${suggestion}</p>`;
}

// Search History
function updateSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    }
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = searchHistory.map(city => `
        <li onclick="getWeather('${city}')">${city}</li>
    `).join('');
}

// Geolocation on Load
window.onload = () => {
    displayHistory();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}&units=metric`;
            fetch(url).then(res => res.json()).then(data => getWeather(data.name));
        });
    }
};