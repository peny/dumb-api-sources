import TwelveDataAPI from './apis/twelvedata.js';
import OpenMeteoAPI from './apis/openmeteo.js';
import GoogleNewsAPI from './apis/googlenews.js';

class DumbAPISources {
  constructor(config = {}) {
    this.apis = {
      twelvedata: new TwelveDataAPI(config.twelvedata?.apiKey),
      openmeteo: new OpenMeteoAPI(),
      googlenews: new GoogleNewsAPI()
    };
  }

  /**
   * Get data from a specified API source
   * @param {string} source - The API source name (e.g., 'twelvedata', 'openmeteo')
   * @param {string|Object} symbol - Query (e.g., 'AAPL' or place name or { latitude, longitude })
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} The API response data
   */
  async get(source, symbol, options = {}) {
    if (!source || typeof source !== 'string') {
      throw new Error('Source must be a non-empty string');
    }

    const sourceLower = source.toLowerCase();

    if (!this.apis[sourceLower]) {
      throw new Error(`Unsupported API source: ${source}. Available sources: ${Object.keys(this.apis).join(', ')}`);
    }

    // Validate symbol/query input
    if (sourceLower === 'openmeteo' || sourceLower === 'googlenews') {
      if (symbol === undefined || symbol === null || (typeof symbol !== 'string' && typeof symbol !== 'object')) {
        throw new Error('For openmeteo/googlenews, provide a string or options object');
      }
    } else {
      if (!symbol || typeof symbol !== 'string') {
        throw new Error('Symbol must be a non-empty string');
      }
    }

    try {
      if (sourceLower === 'twelvedata') {
        if (options.quote) {
          return await this.apis.twelvedata.getQuote(symbol);
        }
        return await this.apis.twelvedata.getCurrentPrice(symbol);
      }

      if (sourceLower === 'openmeteo') {
        return await this.apis.openmeteo.getCurrent(symbol);
      }

      if (sourceLower === 'googlenews') {
        return await this.apis.googlenews.getHeadlines(symbol);
      }

      throw new Error(`No implementation found for source: ${source}`);
    } catch (error) {
      throw new Error(`Failed to fetch data from ${source} for symbol ${typeof symbol === 'string' ? symbol : '[coordinates]'}: ${error.message}`);
    }
  }

  /**
   * Get a quote (detailed information) from a specified API source
   * @param {string} source - The API source name (e.g., 'twelvedata')
   * @param {string} symbol - The symbol to query (e.g., 'AAPL')
   * @returns {Promise<Object>} The detailed quote data
   */
  async getQuote(source, symbol) {
    return this.get(source, symbol, { quote: true });
  }

  /**
   * Add a new API source
   * @param {string} name - The name of the API source
   * @param {Object} apiInstance - The API instance
   */
  addSource(name, apiInstance) {
    if (!name || typeof name !== 'string') {
      throw new Error('Source name must be a non-empty string');
    }
    
    if (!apiInstance || typeof apiInstance !== 'object') {
      throw new Error('API instance must be an object');
    }

    this.apis[name.toLowerCase()] = apiInstance;
  }

  /**
   * Get list of available API sources
   * @returns {Array<string>} List of available source names
   */
  getAvailableSources() {
    return Object.keys(this.apis);
  }
}

// Create and export a default instance
const dumbAPISources = new DumbAPISources();

// Export both the class and the default instance
export default dumbAPISources;
export { DumbAPISources };
