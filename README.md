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
// Fallback: If TwelveData doesn't have a symbol, use Yahoo automatically
// Example: OMXS30 index (try TD first, then Yahoo fallback)
const omxs30 = await dumbAPISources.get('twelvedata', 'OMXS30', { fallback: 'yahoo' });
// Or directly via yahoo
const omxs30Yahoo = await dumbAPISources.get('yahoo', 'OMXS30');

// => { symbol, name, price, change, changePercent, volume, high, low, open, previousClose, timestamp, source }

// Open‑Meteo: weather by place name
const stockholm = await dumbAPISources.get('openmeteo', 'stockholm');
// => { location, latitude, longitude, temperatureC, windSpeedMps, windDirectionDeg, weatherCode, weather, timestamp, source: 'openmeteo' }

// Open‑Meteo: weather by coordinates
const nyc = await dumbAPISources.get('openmeteo', { latitude: 40.7128, longitude: -74.0060, name: 'New York' });

// Google News: headlines by query (locale optional)
const appleNews = await dumbAPISources.get('googlenews', { q: 'Apple', lang: 'en', country: 'US', max: 5 });
// Only news from the past 24 hours
const appleNews24h = await dumbAPISources.get('googlenews', { q: 'Apple', lang: 'en', country: 'US', max: 5, past24h: true });
// Exclude sports (broad) and add custom exclusions (keywords/domains)
const appleFiltered = await dumbAPISources.get('googlenews', {
  q: 'Apple',
  lang: 'en',
  country: 'US',
  max: 10,
  past24h: true,
  excludeSports: true,
  excludeKeywords: ['tennis', 'galopp', 'equestrian', 'hästsport'],
  excludeDomains: ['espn.com', 'theathletic.com', 'svenskafans.com']
});
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
  - Options object: `{ q: string, lang?: string, country?: string, max?: number, past24h?: boolean, excludeSports?: boolean, excludeKeywords?: string|string[], excludeDomains?: string|string[] }`
    - `lang` defaults to `en`, `country` defaults to `US`, `max` defaults to `10`, `past24h` defaults to `false`, `excludeSports` defaults to `false`
    - `excludeKeywords`: additional words/phrases to exclude (pre-query and post-filter)
    - `excludeDomains`: domains to exclude (pre-query via `site:` and post-filter)
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
- Set `past24h: true` to filter results to items published within the last 24 hours.
- Set `excludeSports: true` to remove common sports-related headlines (English/Swedish, includes horse sports) and blacklist popular sports domains by default (augment with `excludeDomains`).
- Use `excludeKeywords` and `excludeDomains` for additional precise filtering.

## Available Methods
- `get(source, query, options?)`
- `getQuote(source, symbol)` (TwelveData)
- `getAvailableSources()`
- `addSource(name, apiInstance)`

Notes:
- `get('twelvedata', symbol, { fallback: 'yahoo' })` will transparently try Yahoo if TwelveData fails.
- Yahoo provider includes helpful aliases for `OMXS30` and `OMXS30GI` (tries known Yahoo symbols and ETFs).

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
