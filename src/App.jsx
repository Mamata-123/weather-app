
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Kathmandu");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results?.length) {
        throw new Error("City not found. Try another city.");
      }

      const place = geoData.results[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
      );

      const data = await response.json();

      setWeather({
        name: place.name,
        country: place.country,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        condition: getCondition(data.current.weather_code),
        icon: getWeatherIcon(data.current.weather_code),
        forecast: data.daily.time.map((date, index) => ({
         date,
         max: data.daily.temperature_2m_max[index],
         min: data.daily.temperature_2m_min[index],
         icon: getWeatherIcon(data.daily.weather_code[index]),
        })),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getCondition = (code) => {
    if (code === 0) return "Clear Sky ☀️";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy ⛅";
    if ([45, 48].includes(code)) return "Foggy 🌫️";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rainy 🌧️";
    if ([71, 73, 75, 77].includes(code)) return "Snowy ❄️";
    if ([80, 81, 82].includes(code)) return "Rain Showers 🌦️";
    if ([95, 96, 99].includes(code)) return "Thunderstorm ⛈️";
    return "Unknown";
  };

  const getWeatherIcon = (code) => {
   if (code === 0) return "☀️";
   if ([1, 2].includes(code)) return "🌤️";
   if (code === 3) return "☁️";
   if ([45, 48].includes(code)) return "🌫️";
   if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
   if ([71, 73, 75, 77].includes(code)) return "❄️";
   if ([95, 96, 99].includes(code)) return "⛈️";
   return "🌡️";
  }; 

  useEffect(() => {
    getWeather("Kathmandu");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    getWeather(city);
  };

  return (
    <div className="app">
      <div className="weather-card">
        <h1>Weather App 🌦️</h1>
        <p>Find the weather in your city</p>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading && <p className="status">Fetching weather...</p>}

        {weather && !loading && (
          <div className="weather-info">
            <h2>{weather.name}, {weather.country}</h2>
            <div className="weather-icon">{weather.icon}</div>
            <h1>{weather.temperature}°C</h1>
            <p>{weather.condition}</p>

            <div className="weather-details">
              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>
              <div>
                <span>💨</span>
                <p>Wind Speed</p>
                <strong>{weather.wind} km/h</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
