import yahooFinance from 'yahoo-finance2';

class YahooFinanceAPI {
  constructor() {}

  async getCurrentPrice(symbolOrAlias) {
    const candidates = this.getCandidateSymbols(symbolOrAlias);
    let lastError = null;
    for (const candidate of candidates) {
      try {
        const quote = await yahooFinance.quote(candidate);
        if (!quote || quote.regularMarketPrice == null) {
          throw new Error('No price in quote');
        }
        return {
          symbol: candidate,
          price: Number(quote.regularMarketPrice),
          timestamp: new Date().toISOString(),
          source: 'yahoo'
        };
      } catch (err) {
        lastError = err;
      }
    }
    throw new Error(`Yahoo: failed to fetch price for ${symbolOrAlias}: ${lastError?.message || 'unknown error'}`);
  }

  async getQuote(symbolOrAlias) {
    const candidates = this.getCandidateSymbols(symbolOrAlias);
    let lastError = null;
    for (const candidate of candidates) {
      try {
        const quote = await yahooFinance.quote(candidate);
        if (!quote || quote.regularMarketPrice == null) {
          throw new Error('No price in quote');
        }
        return {
          symbol: candidate,
          name: quote.shortName || quote.longName || candidate,
          price: Number(quote.regularMarketPrice),
          change: quote.regularMarketChange != null ? Number(quote.regularMarketChange) : null,
          changePercent: quote.regularMarketChangePercent != null ? Number(quote.regularMarketChangePercent) : null,
          volume: quote.regularMarketVolume != null ? Number(quote.regularMarketVolume) : null,
          high: quote.regularMarketDayHigh != null ? Number(quote.regularMarketDayHigh) : null,
          low: quote.regularMarketDayLow != null ? Number(quote.regularMarketDayLow) : null,
          open: quote.regularMarketOpen != null ? Number(quote.regularMarketOpen) : null,
          previousClose: quote.regularMarketPreviousClose != null ? Number(quote.regularMarketPreviousClose) : null,
          timestamp: new Date().toISOString(),
          source: 'yahoo'
        };
      } catch (err) {
        lastError = err;
      }
    }
    throw new Error(`Yahoo: failed to fetch quote for ${symbolOrAlias}: ${lastError?.message || 'unknown error'}`);
  }

  getCandidateSymbols(symbolOrAlias) {
    const s = String(symbolOrAlias).toUpperCase().trim();
    // Provide helpful fallbacks for common indices/funds
    if (s === 'OMXS30') {
      // Try candidates commonly used on Yahoo; include ETF tracker as last resort
      return ['^OMX', '^OMXS30', '^OMX30', 'XACT-OMXS30.ST'];
    }
    if (s === 'OMXS30GI') {
      return ['^OMXS30GI', '^OMXS30', '^OMX30'];
    }
    // Default: try as-is
    return [s];
  }
}

export default YahooFinanceAPI;


