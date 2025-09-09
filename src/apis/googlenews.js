import Parser from 'rss-parser';

class GoogleNewsAPI {
  constructor() {
    this.parser = new Parser({ timeout: 10000 });
    this.baseUrl = 'https://news.google.com/rss';
  }

  // query can be a string like 'apple', or an object { q, lang, country, max }
  async getHeadlines(query) {
    const { q, lang = 'en', country = 'US', max = 10 } = this.normalizeQuery(query);

    const url = `${this.baseUrl}/search?hl=${encodeURIComponent(lang)}&gl=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}&ceid=${encodeURIComponent(country)}:${encodeURIComponent(lang)}`;

    const feed = await this.parser.parseURL(url);

    // Normalize items
    const items = (feed.items || []).slice(0, max).map(item => ({
      title: item.title || null,
      link: item.link || null,
      published: item.isoDate || item.pubDate || null,
      source: (item.creator || item.author || '').toString() || null,
      snippet: item.contentSnippet || null
    }));

    return {
      query: q,
      lang,
      country,
      items,
      total: items.length,
      source: 'googlenews'
    };
  }

  normalizeQuery(query) {
    if (typeof query === 'string') {
      return { q: query.trim() };
    }
    if (query && typeof query === 'object' && query.q) {
      return query;
    }
    throw new Error('GoogleNews: query must be a string or { q, lang?, country?, max? }');
  }
}

export default GoogleNewsAPI;
