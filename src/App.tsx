

import './App.css'
import { useState, useEffect, useRef } from "react";

/* ---------- Types ---------- */
interface Suggestion {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

function App() {
  const [city, setCity] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const API_KEY = "61c0b490865841f290a28434dfe1b581";
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Fetch City Suggestions ---------- */
  useEffect(() => {
    if (!city) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSuggestions();
  }, [city]);

  /* ---------- Fetch Weather ---------- */
  const fetchWeather = async (selectedCity?: string) => {
    const q = selectedCity || city;

    if (!q.trim()) {
      setError("Enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) throw new Error("City not found");

      const data: WeatherData = await response.json();
      setWeather(data);
      setSuggestions([]);
      setCity(data.name);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Click Outside ---------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cToF = (c: number) => (c * 9 / 5 + 32).toFixed(1);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "50px",
        overflow: "hidden",
        backgroundImage: "url('ig.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        animation: "bg-zoom 30s ease-in-out infinite alternate",
      }}
    >
      {/* Glass Container */}
      <div
        ref={wrapperRef}
        style={{
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "25px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          width: "400px",
          padding: "30px",
          color: "#fff",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Weather App
        </h1>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              padding: "12px",
              width: "100%",
              borderRadius: "10px",
              border: "none",
              outline: "none",
            }}
          />

          {suggestions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                position: "absolute",
                width: "100%",
                background: "#fff",
                color: "#000",
                borderRadius: "8px",
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  style={{ padding: "10px", cursor: "pointer" }}
                  onClick={() => fetchWeather(s.name)}
                >
                  {s.name}, {s.country}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => fetchWeather()}
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {weather && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <p>
              {weather.main.temp}°C / {cToF(weather.main.temp)}°F
            </p>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind: {weather.wind.speed} m/s</p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes bg-zoom {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
