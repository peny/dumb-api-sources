import 'dotenv/config';
import dumbAPISources from './src/index.js';

// Example usage of the dumb-api-sources library

async function example() {
  try {
    console.log('🚀 Testing dumb-api-sources library...\n');

    // Use the default instance (will read from environment variables)
    const api = dumbAPISources;

    console.log('Available sources:', api.getAvailableSources());
    console.log('');
    // Example 1: Get current price for Apple stock
    console.log('📈 Getting current price for Apple (AAPL)...');
    const applePrice = await api.get('twelvedata', 'AAPL');
    console.log('Apple current price:', applePrice);
    console.log('');
     
    /*
    // Example 2: Get current price for OMXS30 stock
    console.log('📈 Getting current price for OMXS30 (OMXS30)...');
    const omxs30Price = await api.get('twelvedata', 'OMXS30');
    console.log('OMXS30 current price:', omxs30Price);
    console.log('');

    // Example 2: Get detailed quote for OMXS30 stock
    console.log('📊 Getting detailed quote for OMXS30 (OMXS30)...');
    const omxs30Quote = await api.getQuote('twelvedata', 'OMXS30');
    console.log('OMXS30 detailed quote:', omxs30Quote);
    console.log('');
    */

    // Example 2: Get current price for S&P 500 ETF (SPY)

    console.log('💻 Getting current price for S&P 500 ETF (SPY)...');
    const spxPrice = await api.get('twelvedata', 'SPY');
    console.log('S&P 500 current price:', spxPrice);
    console.log('');

    // Example 3: Weather examples via Open-Meteo
    console.log('🌤️ (3a) Getting current weather for Stockholm...');
    const stockholmWeather = await api.get('openmeteo', 'stockholm');
    console.log('Stockholm weather:', stockholmWeather);
    console.log('');

    console.log('🌤️ (3b) Getting current weather for New York via coordinates...');
    const nycWeather = await api.get('openmeteo', { latitude: 40.7128, longitude: -74.0060, name: 'New York' });
    console.log('New York weather:', nycWeather);
    console.log('');

    // Example 4: Google News example
    console.log('🗞️ Getting Google News headlines for Apple...');
    const gn = await api.get('googlenews', { q: 'Apple', lang: 'en', country: 'US', max: 5 });
    console.log('Google News (Apple):', gn);
    console.log('');

    // Example 5: Error handling
    console.log('❌ Testing error handling with invalid symbol...');
    try {
      await api.get('twelvedata', 'INVALID_SYMBOL_12345');
    } catch (error) {
      console.log('Expected error caught:', error.message);
    }
    console.log('');

    // Example 6: Testing unsupported source
    console.log('❌ Testing unsupported source...');
    try {
      await api.get('unsupported', 'AAPL');
    } catch (error) {
      console.log('Expected error caught:', error.message);
    }

  } catch (error) {
    console.error('❌ Error in example:', error.message);
    console.log('\n💡 Make sure your TWELVEDATA_API_KEY is set in your .env file or as an environment variable.');
  }
}

// Run the example
example();
