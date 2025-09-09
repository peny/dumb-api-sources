# Dumb API Sources

A simple Node.js library for easy connection to third-party APIs. Currently supports TwelveData for stock market data.

## Installation

```bash
npm install
```

## Setup

### TwelveData API Key

You need a free API key from [TwelveData](https://twelvedata.com/). You can get one by signing up at their website.

The API key is already configured in the `config.js` file. You can also:

Set your API key as an environment variable:

```bash
export TWELVEDATA_API_KEY="your-api-key-here"
```

Or pass it directly when creating an instance:

```javascript
import { DumbAPISources } from './src/index.js';

const api = new DumbAPISources({
  twelvedata: {
    apiKey: 'your-api-key-here'
  }
});
```

## Usage

### Basic Usage

```javascript
import dumbAPISources from './src/index.js';

// Get current price for Apple stock
const applePrice = await dumbAPISources.get('twelvedata', 'apple');
console.log(applePrice);
// Output: { symbol: 'AAPL', price: 150.25, timestamp: '2024-01-15T10:30:00.000Z', source: 'twelvedata' }
```

### Get Detailed Quote

```javascript
// Get detailed quote with more information
const appleQuote = await dumbAPISources.getQuote('twelvedata', 'AAPL');
console.log(appleQuote);
// Output: { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.15, changePercent: 1.45, ... }
```

### Available Methods

- `get(source, symbol, options)` - Get basic data (current price by default)
- `getQuote(source, symbol)` - Get detailed quote information
- `getAvailableSources()` - Get list of available API sources
- `addSource(name, apiInstance)` - Add a new API source

### Supported Sources

- **twelvedata** - Stock market data (prices, quotes, etc.)

## Examples

Run the example file to see the library in action:

```bash
node example.js
```

## API Response Format

### Current Price Response
```javascript
{
  symbol: 'AAPL',
  price: 150.25,
  timestamp: '2024-01-15T10:30:00.000Z',
  source: 'twelvedata'
}
```

### Quote Response
```javascript
{
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 150.25,
  change: 2.15,
  changePercent: 1.45,
  volume: 45000000,
  high: 152.10,
  low: 148.50,
  open: 149.80,
  previousClose: 148.10,
  timestamp: '2024-01-15T10:30:00.000Z',
  source: 'twelvedata'
}
```

## Error Handling

The library includes comprehensive error handling:

```javascript
try {
  const data = await dumbAPISources.get('twelvedata', 'AAPL');
} catch (error) {
  console.error('Error:', error.message);
}
```

Common errors:
- Missing API key
- Invalid symbol
- Network issues
- API rate limits

## Development

### Project Structure

```
src/
├── index.js          # Main library interface
└── apis/
    └── twelvedata.js # TwelveData API client
```

### Adding New API Sources

To add a new API source, create a new file in `src/apis/` and implement the required methods. Then add it to the main class in `src/index.js`.

## License

MIT
