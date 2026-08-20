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
let acIndex = -1;

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
const autocompleteDropdown = $('#autocompleteDropdown');

const cityName = $('#cityName');
const temperature = $('#temperature');
const condition = $('#condition');
const weatherIcon = $('#weatherIcon');
const humidity = $('#humidity');
const windSpeed = $('#windSpeed');
const feelsLike = $('#feelsLike');
const pressure = $('#pressure');

// ─── City Database ──────────────────────────────────────────
const CITY_DB = [
  { name: 'Madrid', country: 'ES' }, { name: 'Malaga', country: 'ES' }, { name: 'Manila', country: 'PH' },
  { name: 'Melbourne', country: 'AU' }, { name: 'Mexico City', country: 'MX' }, { name: 'Miami', country: 'US' },
  { name: 'Milan', country: 'IT' }, { name: 'Minsk', country: 'BY' }, { name: 'Monaco', country: 'MC' },
  { name: 'Montreal', country: 'CA' }, { name: 'Moscow', country: 'RU' }, { name: 'Mumbai', country: 'IN' },
  { name: 'Munich', country: 'DE' }, { name: 'Macau', country: 'MO' }, { name: 'Marseille', country: 'FR' },
  { name: 'Mecca', country: 'SA' }, { name: 'Medina', country: 'SA' }, { name: 'Milwaukee', country: 'US' },
  { name: 'Minneapolis', country: 'US' }, { name: 'Mandalay', country: 'MM' }, { name: 'Muscat', country: 'OM' },
  { name: 'Maracaibo', country: 'VE' }, { name: 'Montevideo', country: 'UY' }, { name: 'Nagoya', country: 'JP' },
  { name: 'Nairobi', country: 'KE' }, { name: 'Naples', country: 'IT' }, { name: 'Nashville', country: 'US' },
  { name: 'New Delhi', country: 'IN' }, { name: 'New York', country: 'US' }, { name: 'Osaka', country: 'JP' },
  { name: 'Oslo', country: 'NO' }, { name: 'Ottawa', country: 'CA' }, { name: 'Phoenix', country: 'US' },
  { name: 'Paris', country: 'FR' }, { name: 'Perth', country: 'AU' }, { name: 'Prague', country: 'CZ' },
  { name: 'Porto', country: 'PT' }, { name: 'Quebec', country: 'CA' }, { name: 'Rome', country: 'IT' },
  { name: 'Rio de Janeiro', country: 'BR' }, { name: 'Seoul', country: 'KR' }, { name: 'Shanghai', country: 'CN' },
  { name: 'Singapore', country: 'SG' }, { name: 'Stockholm', country: 'SE' }, { name: 'Sydney', country: 'AU' },
  { name: 'Taipei', country: 'TW' }, { name: 'Tokyo', country: 'JP' }, { name: 'Toronto', country: 'CA' },
  { name: 'Vancouver', country: 'CA' }, { name: 'Vienna', country: 'AT' }, { name: 'Warsaw', country: 'PL' },
  { name: 'Washington', country: 'US' }, { name: 'London', country: 'GB' }, { name: 'Los Angeles', country: 'US' },
  { name: 'Lima', country: 'PE' }, { name: 'Lisbon', country: 'PT' }, { name: 'Lagos', country: 'NG' },
  { name: 'Lahore', country: 'PK' }, { name: 'Kyoto', country: 'JP' }, { name: 'Kuala Lumpur', country: 'MY' },
  { name: 'Istanbul', country: 'TR' }, { name: 'Jakarta', country: 'ID' }, { name: 'Johannesburg', country: 'ZA' },
  { name: 'Dubai', country: 'AE' }, { name: 'Dublin', country: 'IE' }, { name: 'Denver', country: 'US' },
  { name: 'Detroit', country: 'US' }, { name: 'Cairo', country: 'EG' }, { name: 'Cologne', country: 'DE' },
  { name: 'Chicago', country: 'US' }, { name: 'Chennai', country: 'IN' }, { name: 'Copenhagen', country: 'DK' },
  { name: 'Bangkok', country: 'TH' }, { name: 'Barcelona', country: 'ES' }, { name: 'Beijing', country: 'CN' },
  { name: 'Berlin', country: 'DE' }, { name: 'Boston', country: 'US' }, { name: 'Brisbane', country: 'AU' },
  { name: 'Brussels', country: 'BE' }, { name: 'Buenos Aires', country: 'AR' }, { name: 'Cape Town', country: 'ZA' },
  { name: 'Amsterdam', country: 'NL' }, { name: 'Athens', country: 'GR' }, { name: 'Auckland', country: 'NZ' },
  { name: 'Austin', country: 'US' }, { name: 'Atlanta', country: 'US' }, { name: 'Abu Dhabi', country: 'AE' },
  { name: 'Adelaide', country: 'AU' }, { name: 'Baku', country: 'AZ' }, { name: 'Baltimore', country: 'US' },
  { name: 'Hamburg', country: 'DE' }, { name: 'Hangzhou', country: 'CN' }, { name: 'Helsinki', country: 'FI' },
  { name: 'Ho Chi Minh City', country: 'VN' }, { name: 'Hong Kong', country: 'HK' }, { name: 'Honolulu', country: 'US' },
  { name: 'Houston', country: 'US' }, { name: 'Hyderabad', country: 'IN' }, { name: 'Dhaka', country: 'BD' },
  { name: 'Doha', country: 'QA' }, { name: 'Frankfurt', country: 'DE' }, { name: 'Fukuoka', country: 'JP' },
  { name: 'Guangzhou', country: 'CN' }, { name: 'Hanoi', country: 'VN' }, { name: 'Dalian', country: 'CN' },
  { name: 'Edinburgh', country: 'GB' }, { name: 'Eindhoven', country: 'NL' }, { name: 'Kathmandu', country: 'NP' },
  { name: 'Kiev', country: 'UA' }, { name: 'Kinshasa', country: 'CD' }, { name: 'Kolkata', country: 'IN' },
  { name: 'Krakow', country: 'PL' }, { name: 'Kunming', country: 'CN' }, { name: 'Las Vegas', country: 'US' },
  { name: 'Leeds', country: 'GB' }, { name: 'Lyon', country: 'FR' }, { name: 'Madrid', country: 'ES' },
  { name: 'Manaus', country: 'BR' }, { name: 'Manchester', country: 'GB' }, { name: 'Monterrey', country: 'MX' },
  { name: 'Nanjing', country: 'CN' }, { name: 'Naples', country: 'IT' }, { name: 'New Orleans', country: 'US' },
  { name: 'Nice', country: 'FR' }, { name: 'Okinawa', country: 'JP' }, { name: 'Panama City', country: 'PA' },
  { name: 'Philadelphia', country: 'US' }, { name: 'Portland', country: 'US' }, { name: 'Riyadh', country: 'SA' },
  { name: 'Salvador', country: 'BR' }, { name: 'San Diego', country: 'US' }, { name: 'San Francisco', country: 'US' },
  { name: 'Santiago', country: 'CL' }, { name: 'Sapporo', country: 'JP' }, { name: 'Seattle', country: 'US' },
  { name: 'Shenzhen', country: 'CN' }, { name: 'St. Petersburg', country: 'RU' }, { name: 'Suzhou', country: 'CN' },
  { name: 'Tehran', country: 'IR' }, { name: 'Tel Aviv', country: 'IL' }, { name: 'Tianjin', country: 'CN' },
  { name: 'Zurich', country: 'CH' }, { name: 'Guadalajara', country: 'MX' }, { name: 'Bogota', country: 'CO' },
  { name: 'Bratislava', country: 'SK' }, { name: 'Budapest', country: 'HU' }, { name: 'Busan', country: 'KR' },
  { name: 'Changsha', country: 'CN' }, { name: 'Chengdu', country: 'CN' }, { name: 'Columbus', country: 'US' },
  { name: 'Dalian', country: 'CN' }, { name: 'Fukuoka', country: 'JP' }, { name: 'Guayaquil', country: 'EC' },
  { name: 'Jinan', country: 'CN' }, { name: 'Kobe', country: 'JP' }, { name: 'Kowloon', country: 'HK' },
  { name: 'Nagasaki', country: 'JP' }, { name: 'Ningbo', country: 'CN' }, { name: 'Novosibirsk', country: 'RU' },
  { name: 'Sendai', country: 'JP' }, { name: 'Shenyang', country: 'CN' }, { name: 'Surabaya', country: 'ID' },
  { name: 'Wuhan', country: 'CN' }, { name: 'Xi\'an', country: 'CN' }, { name: 'Yokohama', country: 'JP' },
  { name: 'Zhengzhou', country: 'CN' }, { name: 'Belfast', country: 'GB' }, { name: 'Bordeaux', country: 'FR' },
  { name: 'Cardiff', country: 'GB' }, { name: 'Florence', country: 'IT' }, { name: 'Gothenburg', country: 'SE' },
  { name: 'Memphis', country: 'US' }, { name: 'Nice', country: 'FR' }, { name: 'Rotterdam', country: 'NL' },
  { name: 'Sapporo', country: 'JP' }, { name: 'Venice', country: 'IT' }, { name: 'Wroclaw', country: 'PL' },
  { name: 'Almaty', country: 'KZ' }, { name: 'Asuncion', country: 'PY' }, { name: 'Baku', country: 'AZ' },
  { name: 'Bamako', country: 'ML' }, { name: 'Bandung', country: 'ID' }, { name: 'Belgrade', country: 'RS' },
  { name: 'Bergamo', country: 'IT' }, { name: 'Bologna', country: 'IT' }, { name: 'Brescia', country: 'IT' },
  { name: 'Calgary', country: 'CA' }, { name: 'Campinas', country: 'BR' }, { name: 'Casablanca', country: 'MA' },
  { name: 'Charlotte', country: 'US' }, { name: 'Chiang Mai', country: 'TH' }, { name: 'Cochin', country: 'IN' },
  { name: 'Curitiba', country: 'BR' }, { name: 'Da Nang', country: 'VN' }, { name: 'Dalian', country: 'CN' },
  { name: 'Davao', country: 'PH' }, { name: 'Edmonton', country: 'CA' }, { name: 'Florianopolis', country: 'BR' },
  { name: 'Fort Lauderdale', country: 'US' }, { name: 'Glasgow', country: 'GB' }, { name: 'Goa', country: 'IN' },
  { name: 'Ha Long', country: 'VN' }, { name: 'Halifax', country: 'CA' }, { name: 'Hamilton', country: 'CA' },
  { name: 'Hanover', country: 'DE' }, { name: 'Harbin', country: 'CN' }, { name: 'Irkutsk', country: 'RU' },
  { name: 'Izmir', country: 'TR' }, { name: 'Dammam', country: 'SA' }, { name: 'Daegu', country: 'KR' },
  { name: 'Lucca', country: 'IT' }, { name: 'Lucknow', country: 'IN' }, { name: 'Maastricht', country: 'NL' },
  { name: 'Macao', country: 'MO' }, { name: 'Malmo', country: 'SE' }, { name: 'Mashhad', country: 'IR' },
  { name: 'Mataram', country: 'ID' }, { name: 'Medellin', country: 'CO' }, { name: 'Meknes', country: 'MA' },
  { name: 'Merida', country: 'MX' }, { name: 'Mysore', country: 'IN' }, { name: 'Nagpur', country: 'IN' },
  { name: 'Odessa', country: 'UA' }, { name: 'Okayama', country: 'JP' }, { name: 'Pune', country: 'IN' },
  { name: 'Pattaya', country: 'TH' }, { name: 'Pohang', country: 'KR' }, { name: 'Ponce', country: 'PR' },
  { name: 'Port au Prince', country: 'HT' }, { name: 'Quito', country: 'EC' }, { name: 'Quanzhou', country: 'CN' },
  { name: 'Sanya', country: 'CN' }, { name: 'Savannah', country: 'US' }, { name: 'Sharjah', country: 'AE' },
  { name: 'Valencia', country: 'ES' }, { name: 'Veracruz', country: 'MX' }, { name: 'Xiamen', country: 'CN' },
  { name: 'Yangon', country: 'MM' }, { name: 'Yaounde', country: 'CM' }, { name: 'Yerevan', country: 'AM' },
  { name: 'Zanzibar', country: 'TZ' }, { name: 'Zhuhai', country: 'CN' }, { name: 'Zibo', country: 'CN' },
  { name: 'Macapa', country: 'BR' }, { name: 'Makkah', country: 'SA' }, { name: 'Malatya', country: 'TR' },
  { name: 'Mandaluyong', country: 'PH' }, { name: 'Mangalore', country: 'IN' }, { name: 'Manila', country: 'PH' },
  { name: 'Maputo', country: 'MZ' }, { name: 'Mardin', country: 'TR' }, { name: 'Masdar City', country: 'AE' },
  { name: 'Meknès', country: 'MA' }, { name: 'Melaka', country: 'MY' }, { name: 'Memphis', country: 'US' },
  { name: 'Merida', country: 'VE' }, { name: 'Milpitas', country: 'US' }, { name: 'Muar', country: 'MY' },
  { name: 'Myitkyina', country: 'MM' }, { name: 'Mikkeli', country: 'FI' }, { name: 'Macon', country: 'US' },
  { name: 'Madurai', country: 'IN' }, { name: 'Mangwon', country: 'KR' }, { name: 'Mar del Plata', country: 'AR' },
  { name: 'Maringa', country: 'BR' }, { name: 'Massawa', country: 'ER' }, { name: 'Matadi', country: 'CD' },
  { name: 'Mbale', country: 'UG' }, { name: 'Medinah', country: 'SA' }, { name: 'Meerut', country: 'IN' },
  { name: 'Mekelle', country: 'ET' }, { name: 'Memmingen', country: 'DE' }, { name: 'Meridian', country: 'US' },
  { name: 'Metz', country: 'FR' }, { name: 'Mianyang', country: 'CN' }, { name: 'Middlesbrough', country: 'GB' },
  { name: 'Modesto', country: 'US' }, { name: 'Mogi das Cruzes', country: 'BR' }, { name: 'Moncton', country: 'CA' },
  { name: 'Montpellier', country: 'FR' }, { name: 'Morelia', country: 'MX' }, { name: 'Moroni', country: 'KM' },
  { name: 'Mount Vernon', country: 'US' }, { name: 'Mulhouse', country: 'FR' }, { name: 'Munster', country: 'DE' },
  { name: 'Murcia', country: 'ES' }, { name: 'Muskegon', country: 'US' }, { name: 'Muzaffarabad', country: 'PK' },
];

// ─── Autocomplete ────────────────────────────────────────────
function showAutocomplete(query) {
  if (!query || query.length < 1) {
    hideAutocomplete();
    return;
  }
  const q = query.toLowerCase();
  const matches = CITY_DB.filter(c => c.name.toLowerCase().startsWith(q)).slice(0, 8);
  if (!matches.length) {
    autocompleteDropdown.innerHTML = '<div class="ac-empty">No cities found</div>';
    autocompleteDropdown.classList.remove('hidden');
    return;
  }
  autocompleteDropdown.innerHTML = matches.map((c, i) =>
    `<div class="ac-item" data-city="${c.name}" data-index="${i}">
      <i class="fas fa-map-marker-alt"></i>
      <span>${highlightMatch(c.name, query)}</span>
      <span class="ac-country">${c.country}</span>
    </div>`
  ).join('');
  autocompleteDropdown.classList.remove('hidden');
  acIndex = -1;
}

function highlightMatch(name, query) {
  const i = name.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return name;
  return name.slice(0, i) + '<strong>' + name.slice(i, i + query.length) + '</strong>' + name.slice(i + query.length);
}

function hideAutocomplete() {
  autocompleteDropdown.classList.add('hidden');
  autocompleteDropdown.innerHTML = '';
  acIndex = -1;
}

function selectACItem(city) {
  cityInput.value = city;
  hideAutocomplete();
  searchWeather(city);
}

function navigateAC(dir) {
  const items = autocompleteDropdown.querySelectorAll('.ac-item');
  if (!items.length) return;
  items.forEach(el => el.classList.remove('active'));
  acIndex += dir;
  if (acIndex < 0) acIndex = items.length - 1;
  if (acIndex >= items.length) acIndex = 0;
  items[acIndex].classList.add('active');
  cityInput.value = items[acIndex].dataset.city;
}

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

  try {
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
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('API error')) throw err;
    return buildMockData(city);
  }
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
searchBtn.addEventListener('click', () => {
  hideAutocomplete();
  searchWeather(cityInput.value);
});

cityInput.addEventListener('input', () => {
  showAutocomplete(cityInput.value.trim());
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    hideAutocomplete();
    searchWeather(cityInput.value);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    navigateAC(1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    navigateAC(-1);
  } else if (e.key === 'Escape') {
    hideAutocomplete();
  }
});

autocompleteDropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.ac-item');
  if (item) selectACItem(item.dataset.city);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) hideAutocomplete();
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
  searchWeather('London');
})();
