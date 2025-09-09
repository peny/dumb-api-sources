import axios from 'axios';

class TwelveDataAPI {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.TWELVEDATA_API_KEY;
    this.baseURL = 'https://api.twelvedata.com';
  }

  async getCurrentPrice(symbol) {
    try {
      if (!this.apiKey) {
        throw new Error('TwelveData API key is required. Set TWELVEDATA_API_KEY environment variable or pass it to constructor.');
      }

      const response = await axios.get(`${this.baseURL}/price`, {
        params: {
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey
        }
      });

      if (response.data.status === 'error') {
        throw new Error(`TwelveData API Error: ${response.data.message}`);
      }

      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(response.data.price),
        timestamp: new Date().toISOString(),
        source: 'twelvedata'
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`TwelveData API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getQuote(symbol) {
    try {
      if (!this.apiKey) {
        throw new Error('TwelveData API key is required. Set TWELVEDATA_API_KEY environment variable or pass it to constructor.');
      }

      const response = await axios.get(`${this.baseURL}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey
        }
      });

      if (response.data.status === 'error') {
        throw new Error(`TwelveData API Error: ${response.data.message}`);
      }

      const data = response.data;
      return {
        symbol: data.symbol,
        name: data.name,
        price: parseFloat(data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseInt(data.volume),
        high: parseFloat(data.day_high),
        low: parseFloat(data.day_low),
        open: parseFloat(data.open),
        previousClose: parseFloat(data.previous_close),
        timestamp: new Date().toISOString(),
        source: 'twelvedata'
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`TwelveData API Error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export default TwelveDataAPI;
