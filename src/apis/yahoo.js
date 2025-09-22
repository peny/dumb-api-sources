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
        const currentPrice = Number(quote.regularMarketPrice);
        const prevClose = quote.regularMarketPreviousClose != null ? Number(quote.regularMarketPreviousClose) : null;
        const dailyChangePercent = prevClose && prevClose !== 0 ? ((currentPrice - prevClose) / prevClose) * 100 : (quote.regularMarketChangePercent != null ? Number(quote.regularMarketChangePercent) : null);
        const ytdChangePercent = await this.computeYtdChangePercent(candidate, currentPrice);
        return {
          symbol: candidate,
          price: currentPrice,
          timestamp: new Date().toISOString(),
          source: 'yahoo',
          dailyChangePercent: dailyChangePercent != null ? Number(dailyChangePercent.toFixed(4)) : null,
          ytdChangePercent: ytdChangePercent != null ? Number(ytdChangePercent.toFixed(4)) : null
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
        const currentPrice = Number(quote.regularMarketPrice);
        const prevClose = quote.regularMarketPreviousClose != null ? Number(quote.regularMarketPreviousClose) : null;
        const dailyChange = quote.regularMarketChange != null ? Number(quote.regularMarketChange) : (prevClose != null ? currentPrice - prevClose : null);
        const dailyChangePercent = quote.regularMarketChangePercent != null ? Number(quote.regularMarketChangePercent) : (prevClose && prevClose !== 0 ? ((currentPrice - prevClose) / prevClose) * 100 : null);
        const ytdChangePercent = await this.computeYtdChangePercent(candidate, currentPrice);
        return {
          symbol: candidate,
          name: quote.shortName || quote.longName || candidate,
          price: currentPrice,
          change: dailyChange,
          changePercent: dailyChangePercent,
          dailyChangePercent: dailyChangePercent,
          ytdChangePercent: ytdChangePercent != null ? Number(ytdChangePercent.toFixed(4)) : null,
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

  async computeYtdChangePercent(symbol, currentPrice) {
    try {
      const now = new Date();
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const period1 = Math.floor(startOfYear.getTime() / 1000) - (7 * 24 * 60 * 60); // 1 week before, to catch first trading day
      const period2 = Math.floor(Date.now() / 1000);
      const hist = await yahooFinance.historical(symbol, { period1, period2, interval: '1d' });
      if (!Array.isArray(hist) || hist.length === 0) return null;
      // Find first data point in current year with valid close
      const first = hist.find(h => {
        const d = new Date(h.date);
        return d.getUTCFullYear() === now.getUTCFullYear() && h.close != null;
      }) || hist[0];
      if (!first || first.close == null) return null;
      const base = Number(first.close);
      if (!Number.isFinite(base) || base === 0) return null;
      return ((currentPrice - base) / base) * 100;
    } catch {
      return null;
    }
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
    if (s === 'NORDEA_GLOBAL_ENHANCED') {
      return ['0P0001KL37.ST', '0P0001CKSU.ST', '0P0001CKSS.F'];
    }
    // Default: try as-is
    return [s];
  }
}

export default YahooFinanceAPI;


