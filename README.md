# Dumb API Sources

A simple Node.js library for easy connection to third-party APIs.

Currently supported sources:
- TwelveData (stocks, quotes)
- Open‑Meteo (current weather)
- Google News (RSS headlines)

## Installation

```bash
npm install
```

## Setup

### TwelveData API Key
You need a free API key from `twelvedata.com`.

Set your API key as an environment variable:
```bash
export TWELVEDATA_API_KEY="your-api-key-here"
```

Or pass it directly when creating an instance:
```javascript
import { DumbAPISources } from './src/index.js';

const api = new DumbAPISources({
  twelvedata: { apiKey: 'your-api-key-here' }
});
```

Open‑Meteo and Google News do not require API keys.

## Usage

```javascript
import 'dotenv/config';
import dumbAPISources from './src/index.js';

// TwelveData: current price
const aapl = await dumbAPISources.get('twelvedata', 'AAPL');
// => { symbol, price, timestamp, source: 'twelvedata' }

// TwelveData: detailed quote
const aaplQuote = await dumbAPISources.getQuote('twelvedata', 'AAPL');
// => { symbol, name, price, change, changePercent, volume, high, low, open, previousClose, timestamp, source }

// Open‑Meteo: weather by place name
const stockholm = await dumbAPISources.get('openmeteo', 'stockholm');
// => { location, latitude, longitude, temperatureC, windSpeedMps, windDirectionDeg, weatherCode, weather, timestamp, source: 'openmeteo' }

// Open‑Meteo: weather by coordinates
const nyc = await dumbAPISources.get('openmeteo', { latitude: 40.7128, longitude: -74.0060, name: 'New York' });

// Google News: headlines by query (locale optional)
const appleNews = await dumbAPISources.get('googlenews', { q: 'Apple', lang: 'en', country: 'US', max: 5 });
// => { query, lang, country, items: [{ title, link, published, source, snippet }], total, source: 'googlenews' }
```

## API Details (Inputs/Outputs)

### 1) TwelveData
- Input for `get`:
  - `symbol` (string): e.g., `"AAPL"`, `"MSFT"`, `"SPY"`
- Output for `get` (current price):
  ```json
  {
    "symbol": "AAPL",
    "price": 150.25,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "source": "twelvedata"
  }
  ```
- Input for `getQuote`:
  - `symbol` (string): e.g., `"AAPL"`
- Output for `getQuote` (detailed):
  ```json
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 150.25,
    "change": 2.15,
    "changePercent": 1.45,
    "volume": 45000000,
    "high": 152.10,
    "low": 148.50,
    "open": 149.80,
    "previousClose": 148.10,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "source": "twelvedata"
  }
  ```

Notes:
- Requires `TWELVEDATA_API_KEY`.
- Some symbols (e.g., indices) may require paid plans; ETFs like `SPY` typically work on the free tier.

### 2) Open‑Meteo (Current Weather)
- Inputs accepted by `get('openmeteo', ...)`:
  - Place name (string), e.g., `"stockholm"`, `"barcelona"`
  - Coordinates object: `{ latitude: number, longitude: number, name?: string }`
- Output:
  ```json
  {
    "location": "Stockholm",
    "latitude": 59.32938,
    "longitude": 18.06871,
    "temperatureC": 17.5,
    "windSpeedMps": 7.6,
    "windDirectionDeg": 87,
    "weatherCode": 3,
    "weather": "overcast",
    "timestamp": "2025-09-09T07:15",
    "source": "openmeteo"
  }
  ```

Notes:
- No API key required.
- `weather` is a simplified label derived from Open‑Meteo weather codes: e.g., `clear`, `overcast`, `raining`, `snowing`, etc.

### 3) Google News (RSS)
- Inputs accepted by `get('googlenews', ...)`:
  - Query string, e.g., `"Apple"`, or
  - Options object: `{ q: string, lang?: string, country?: string, max?: number }`
    - `lang` defaults to `en`, `country` defaults to `US`, `max` defaults to `10`
- Output:
  ```json
  {
    "query": "Apple",
    "lang": "en",
    "country": "US",
    "items": [
      { "title": "...", "link": "https://...", "published": "2025-09-08T12:01:00.000Z", "source": "...", "snippet": "..." }
    ],
    "total": 5,
    "source": "googlenews"
  }
  ```

Notes:
- Uses public Google News RSS endpoint; no API key required.
- Results depend on locale (`lang`, `country`).

## Available Methods
- `get(source, query, options?)`
- `getQuote(source, symbol)` (TwelveData)
- `getAvailableSources()`
- `addSource(name, apiInstance)`

## Development

Project structure:
```
src/
├── index.js              # Main library interface
└── apis/
    ├── twelvedata.js     # Stocks (TwelveData)
    ├── openmeteo.js      # Weather (Open‑Meteo)
    └── googlenews.js     # News (Google News RSS)
```

## License
MIT
