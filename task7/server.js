const express = require("express");
const fetch   = require("node-fetch");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = 3000;

// ⚠️ PASTE YOUR FREE API KEY FROM openweathermap.org HERE
const API_KEY = "50db5c9734c433d000ef5d60581ec510";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Search history (server-side storage)
let searchHistory = [];

// GET weather by city
app.get("/api/weather/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const url  = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.cod !== 200) {
      return res.status(404).json({ success: false, message: `City "${city}" not found.` });
    }

    // Save to history
    const existing = searchHistory.findIndex(h => h.city.toLowerCase() === city.toLowerCase());
    if (existing !== -1) searchHistory.splice(existing, 1);
    searchHistory.unshift({ city: data.name, country: data.sys.country, searchedAt: new Date().toLocaleString() });
    if (searchHistory.length > 8) searchHistory.pop();

    res.json({
      success: true,
      data: {
        city:        data.name,
        country:     data.sys.country,
        temp:        Math.round(data.main.temp),
        feels_like:  Math.round(data.main.feels_like),
        humidity:    data.main.humidity,
        pressure:    data.main.pressure,
        wind:        data.wind.speed,
        description: data.weather[0].description,
        icon:        data.weather[0].icon,
        visibility:  data.visibility,
        sunrise:     new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset:      new Date(data.sys.sunset  * 1000).toLocaleTimeString(),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch weather. Check your API key." });
  }
});

// GET search history
app.get("/api/history", (req, res) => {
  res.json({ success: true, data: searchHistory });
});

// DELETE history
app.delete("/api/history", (req, res) => {
  searchHistory = [];
  res.json({ success: true, message: "History cleared!" });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => {
  console.log(`✅ Weather App running at http://localhost:${PORT}`);
  console.log(`⚠️  Add your API key in server.js if not done yet!`);
});
