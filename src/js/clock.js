/** Часы, дата и погода. */

import { S } from './state.js';
import { emit } from './events.js';
import { getLanguage, locale, t } from './i18n.js';
import { $ } from './util.js';

let dateFormat = null;
let dateFormatLocale = '';

function formatDate(date) {
  if (dateFormatLocale !== locale()) {
    dateFormatLocale = locale();
    dateFormat = new Intl.DateTimeFormat(dateFormatLocale, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  return dateFormat.format(date);
}

export function updateClock() {
  const now = new Date();
  const o = S.opts;

  $('#time').textContent = now.toLocaleTimeString(locale(), {
    hour: '2-digit',
    minute: '2-digit',
    second: o.showSeconds ? '2-digit' : undefined,
    hour12: o.hour12
  });
  $('#date').textContent = formatDate(now);
}

export function startClock() {
  setInterval(updateClock, 1000);
}

/* ---- Погода (Open-Meteo, без ключа) ---- */

const WEATHER_CACHE_KEY = 'weather';
const WEATHER_TTL = 15 * 60 * 1000;

const weatherIcon = code =>
  code === 0 ? '☀️' : code < 3 ? '🌤' : code === 3 ? '☁️' : code < 50 ? '🌫' : code < 70 ? '🌧' : code < 80 ? '❄️' : code < 90 ? '🌦' : '⛈';

async function fetchWeather(city) {
  const geo = await (await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?count=1&language=${getLanguage()}&name=` + encodeURIComponent(city)
  )).json();
  const place = geo.results?.[0];
  if (!place) return null;

  const forecast = await (await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code`
  )).json();
  return {
    city,
    time: Date.now(),
    temperature: Math.round(forecast.current.temperature_2m),
    code: forecast.current.weather_code
  };
}

export async function updateWeather(force = false) {
  const { showWeather, city } = S.opts;
  const element = $('#weather');

  if (!showWeather) { element.textContent = ''; return; }
  if (!city) {
    element.textContent = t('weather.addCity');
    element.style.cursor = 'pointer';
    element.onclick = () => emit('settings:open');
    return;
  }
  element.style.cursor = '';
  element.onclick = null;
  element.title = city;

  try {
    let cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || 'null');
    if (force || !cached || cached.city !== city || Date.now() - cached.time > WEATHER_TTL) {
      cached = await fetchWeather(city);
      if (!cached) { element.textContent = t('weather.notFound'); return; }
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cached));
    }
    const sign = cached.temperature > 0 ? '+' : '';
    element.textContent = `${weatherIcon(cached.code)} ${sign}${cached.temperature}°`;
  } catch {
    element.textContent = t('weather.unavailable');
  }
}
