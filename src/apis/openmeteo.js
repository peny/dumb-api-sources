import axios from 'axios';

class OpenMeteoAPI {
  constructor() {
    this.forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast';
    this.geocodingBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    
    // Weather code mapping to simple descriptions
    this.weatherCodeMap = {
      0: 'clear',
      1: 'mostly_clear',
      2: 'partly_cloudy',
      3: 'overcast',
      45: 'foggy',
      48: 'foggy',
      51: 'drizzling',
      53: 'drizzling',
      55: 'drizzling',
      61: 'raining',
      63: 'raining',
      65: 'raining',
      71: 'snowing',
      73: 'snowing',
      75: 'snowing',
      77: 'snowing',
      80: 'light_rain',
      81: 'light_rain',
      82: 'heavy_rain',
      85: 'light_snow',
      86: 'heavy_snow',
      95: 'thunderstorm',
      96: 'thunderstorm',
      99: 'thunderstorm'
    };
  }

  getWeatherDescription(code) {
    return this.weatherCodeMap[code] || 'unknown';
  }

  async getCurrent(placeOrCoordinates) {
    const { latitude, longitude, name } = await this.resolveLocation(placeOrCoordinates);

    const response = await axios.get(this.forecastBaseUrl, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,wind_speed_10m,wind_direction_10m,weather_code',
        timezone: 'UTC'
      }
    });

    const current = response.data?.current;
    if (!current) {
      throw new Error('Open-Meteo: missing current weather in response');
    }

    const weatherCode = current.weather_code ?? null;
    const weatherDescription = weatherCode !== null ? this.getWeatherDescription(weatherCode) : 'unknown';

    return {
      location: name,
      latitude,
      longitude,
      temperatureC: typeof current.temperature_2m === 'number' ? current.temperature_2m : null,
      windSpeedMps: typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : null,
      windDirectionDeg: typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : null,
      weatherCode: weatherCode,
      weather: weatherDescription,
      timestamp: current.time ?? new Date().toISOString(),
      source: 'openmeteo'
    };
  }

  async resolveLocation(placeOrCoordinates) {
    if (typeof placeOrCoordinates === 'object' && placeOrCoordinates && 'latitude' in placeOrCoordinates && 'longitude' in placeOrCoordinates) {
      const { latitude, longitude, name } = placeOrCoordinates;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Open-Meteo: latitude/longitude must be numbers');
      }
      return { latitude, longitude, name: name || `${latitude},${longitude}` };
    }

    const place = String(placeOrCoordinates || '').trim();
    if (!place) {
      throw new Error('Open-Meteo: place is required');
    }

    const geocode = await axios.get(this.geocodingBaseUrl, {
      params: { name: place, count: 1, format: 'json' }
    });

    const first = geocode.data?.results?.[0];
    if (!first) {
      throw new Error(`Open-Meteo: could not geocode "${place}"`);
    }

    return {
      latitude: first.latitude,
      longitude: first.longitude,
      name: first.name
    };
  }
}

export default OpenMeteoAPI;
