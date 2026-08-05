/* ============================================================
   Weather App — OpenWeather API + Mock Fallback
   ============================================================ */

// ─── Configuration ───────────────────────────────────────────
const API_KEY = 'YOUR_API_KEY';
const API_BASE = 'https://api.openweathermap.org/data/2.5';

const UNITS = {
  metric: { label: '°C', speed: 'm/s' },
  imperial: { label: '°F', speed: 'mph' },
};

// ─── State ───────────────────────────────────────────────────
let currentUnit = 'metric';
let currentCity = '';

// ─── DOM References ──────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const cityInput = $('#cityInput');
const searchBtn = $('#searchBtn');
const unitToggle = $('#unitToggle');
const errorDisplay = $('#errorDisplay');
const loadingSpinner = $('#loadingSpinner');
const currentWeather = $('#currentWeather');
const forecastSection = $('#forecastSection');
const forecastContainer = $('#forecastContainer');
const historyList = $('#historyList');

const cityName = $('#cityName');
const temperature = $('#temperature');
const condition = $('#condition');
const weatherIcon = $('#weatherIcon');
const humidity = $('#humidity');
const windSpeed = $('#windSpeed');
const feelsLike = $('#feelsLike');
const pressure = $('#pressure');

// ─── Helpers ─────────────────────────────────────────────────
function showError(msg) {
  errorDisplay.textContent = msg;
  errorDisplay.classList.remove('hidden');
  currentWeather.classList.add('hidden');
  forecastSection.classList.add('hidden');
}
function hideError() { errorDisplay.classList.add('hidden'); }

function showLoading() { loadingSpinner.classList.remove('hidden'); }
function hideLoading() { loadingSpinner.classList.add('hidden'); }

function formatTemp(k) {
  if (currentUnit === 'metric') return `${Math.round(k - 273.15)}°C`;
  return `${Math.round((k - 273.15) * 9 / 5 + 32)}°F`;
}

function formatTempValue(k) {
  if (currentUnit === 'metric') return Math.round(k - 273.15);
  return Math.round((k - 273.15) * 9 / 5 + 32);
}

function getWindSpeed(mps) {
  if (currentUnit === 'imperial') return `${Math.round(mps * 2.237)} mph`;
  return `${Math.round(mps)} m/s`;
}

function getDayName(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}

function getDateLabel(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Dynamic Background ──────────────────────────────────────
function setBackground(conditionId) {
  const classes = ['bg-sunny', 'bg-cloudy', 'bg-rainy', 'bg-snowy', 'bg-default'];
  document.body.classList.remove(...classes);
  if (conditionId >= 200 && conditionId < 300) {
    document.body.classList.add('bg-rainy');
  } else if (conditionId >= 300 && conditionId < 400) {
    document.body.classList.add('bg-rainy');
  } else if (conditionId >= 500 && conditionId < 600) {
    document.body.classList.add('bg-rainy');
  } else if (conditionId >= 600 && conditionId < 700) {
    document.body.classList.add('bg-snowy');
  } else if (conditionId >= 700 && conditionId < 800) {
    document.body.classList.add('bg-cloudy');
  } else if (conditionId === 800) {
    document.body.classList.add('bg-sunny');
  } else if (conditionId > 800 && conditionId < 900) {
    document.body.classList.add('bg-cloudy');
  } else {
    document.body.classList.add('bg-default');
  }
}

// ─── Mock Data ───────────────────────────────────────────────
function buildMockData(city) {
  const now = Math.floor(Date.now() / 1000);
  const mockCurrent = {
    name: city || 'Sample City',
    main: {
      temp: 295.37,
      feels_like: 293.82,
      humidity: 62,
      pressure: 1013,
    },
    wind: { speed: 4.1 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  };

  const mockForecast = { list: [] };
  for (let i = 0; i < 40; i++) {
    const dt = now + i * 10800;
    let wId = 800;
    let wMain = 'Clear';
    let wDesc = 'clear sky';
    let wIcon = '01d';
    if (i % 8 < 2) { wId = 802; wMain = 'Clouds'; wDesc = 'scattered clouds'; wIcon = '03d'; }
    if (i % 8 >= 2 && i % 8 < 4) { wId = 500; wMain = 'Rain'; wDesc = 'light rain'; wIcon = '10d'; }
    mockForecast.list.push({
      dt,
      main: {
        temp: 293 + Math.sin(i * 0.5) * 6,
        temp_min: 289 + Math.sin(i * 0.5) * 3,
        temp_max: 297 + Math.sin(i * 0.5) * 3,
      },
      weather: [{ id: wId, main: wMain, description: wDesc, icon: wIcon }],
    });
  }
  return { current: mockCurrent, forecast: mockForecast };
}

// ─── API Calls ───────────────────────────────────────────────
async function fetchWeather(city) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    return buildMockData(city);
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`),
    fetch(`${API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    const msg = currentRes.status === 404
      ? `City "${city}" not found. Please try again.`
      : `API error (${currentRes.status}). Please try again later.`;
    throw new Error(msg);
  }

  const current = await currentRes.json();
  const forecast = await forecastRes.json();
  return { current, forecast };
}

// ─── Render ──────────────────────────────────────────────────
function renderCurrent(data) {
  const c = data.current;
  const w = c.weather[0];

  cityName.textContent = c.name;
  temperature.textContent = formatTemp(c.main.temp);
  condition.textContent = w.description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
  weatherIcon.alt = w.description;

  humidity.textContent = `${c.main.humidity}%`;
  windSpeed.textContent = getWindSpeed(c.wind.speed);
  feelsLike.textContent = formatTemp(c.main.feels_like);
  pressure.textContent = `${c.main.pressure} hPa`;

  setBackground(w.id);

  currentWeather.classList.remove('hidden');
}

function renderForecast(data) {
  const list = data.forecast.list;

  // Group 3-hour slots by day (use local date)
  const daily = {};
  for (const slot of list) {
    const date = new Date(slot.dt * 1000).toLocaleDateString('en-CA');
    if (!daily[date]) {
      daily[date] = { slots: [], tempMin: Infinity, tempMax: -Infinity, icon: '', condition: '' };
    }
    daily[date].slots.push(slot);
    if (slot.main.temp_min < daily[date].tempMin) daily[date].tempMin = slot.main.temp_min;
    if (slot.main.temp_max > daily[date].tempMax) daily[date].tempMax = slot.main.temp_max;
    // Use midday-ish slot icon for the day card
    const hour = new Date(slot.dt * 1000).getHours();
    if (hour >= 11 && hour <= 14) {
      daily[date].icon = slot.weather[0].icon;
      daily[date].condition = slot.weather[0].description;
    }
  }

  // Fallback: if no midday slot, use the first
  for (const d in daily) {
    if (!daily[d].icon) {
      daily[d].icon = daily[d].slots[0].weather[0].icon;
      daily[d].condition = daily[d].slots[0].weather[0].description;
    }
  }

  // Take first 5 days
  const days = Object.keys(daily).slice(0, 5);

  forecastContainer.innerHTML = days.map((d, idx) => {
    const day = daily[d];
    const label = idx === 0 ? 'Today' : getDayName(day.slots[0].dt);
    const dateLabel = getDateLabel(day.slots[0].dt);
    return `
      <div class="forecast-card" style="animation-delay:${idx * 0.07}s">
        <div class="day">${label} <span style="font-weight:300;font-size:0.75rem;display:block">${dateLabel}</span></div>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.condition}" loading="lazy">
        <div class="temp-range">
          <span class="temp-high">${formatTempValue(day.tempMax)}°</span>
          <span class="temp-low">${formatTempValue(day.tempMin)}°</span>
        </div>
        <div class="forecast-condition">${day.condition}</div>
      </div>
    `;
  }).join('');

  forecastSection.classList.remove('hidden');
}

// ─── Search History ──────────────────────────────────────────
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('weatherHistory') || '[]');
  } catch { return []; }
}

function saveHistory(city) {
  let h = getHistory().filter((c) => c.toLowerCase() !== city.toLowerCase());
  h.unshift(city);
  if (h.length > 10) h = h.slice(0, 10);
  localStorage.setItem('weatherHistory', JSON.stringify(h));
}

function renderHistory() {
  const h = getHistory();
  if (!h.length) {
    historyList.innerHTML = '<li style="cursor:default;opacity:0.6;font-size:0.85rem"><i class="fas fa-history"></i> No searches yet</li>';
    return;
  }
  historyList.innerHTML = h
    .map((c) => `<li data-city="${c}"><i class="fas fa-map-marker-alt"></i> ${c}</li>`)
    .join('');
}

// ─── Main Search ─────────────────────────────────────────────
async function searchWeather(city) {
  const trimmed = city.trim();
  if (!trimmed) return;

  hideError();
  showLoading();
  currentWeather.classList.add('hidden');
  forecastSection.classList.add('hidden');

  try {
    const data = await fetchWeather(trimmed);
    currentCity = trimmed;
    renderCurrent(data);
    renderForecast(data);
    saveHistory(trimmed);
    renderHistory();
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

// ─── Unit Toggle ─────────────────────────────────────────────
unitToggle.addEventListener('click', () => {
  currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
  unitToggle.textContent = currentUnit === 'metric' ? '°C / °F' : '°F / °C';
  if (currentCity) searchWeather(currentCity);
});

// ─── Event Listeners ─────────────────────────────────────────
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchWeather(cityInput.value);
});

historyList.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-city]');
  if (li) {
    cityInput.value = li.dataset.city;
    searchWeather(li.dataset.city);
  }
});

// ─── Init ────────────────────────────────────────────────────
(function init() {
  renderHistory();
  if (API_KEY && API_KEY !== 'YOUR_API_KEY') {
    searchWeather('London');
  } else {
    // Show mock data on load for demo
    searchWeather('Sample City');
  }
})();
