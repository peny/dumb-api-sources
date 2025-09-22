import Parser from 'rss-parser';

class GoogleNewsAPI {
  constructor() {
    this.parser = new Parser({ timeout: 10000 });
    this.baseUrl = 'https://news.google.com/rss';
  }

  // query can be a string like 'apple', or an object { q, lang, country, max, past24h, excludeSports }
  async getHeadlines(query) {
    const { q, lang = 'en', country = 'US', max = 10, past24h = false, excludeSports = false } = this.normalizeQuery(query);

    const url = `${this.baseUrl}/search?hl=${encodeURIComponent(lang)}&gl=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}&ceid=${encodeURIComponent(country)}:${encodeURIComponent(lang)}`;

    const feed = await this.parser.parseURL(url);

    // Normalize items
    let items = (feed.items || []).map(item => ({
      title: item.title || null,
      link: item.link || null,
      published: item.isoDate || item.pubDate || null,
      source: (item.creator || item.author || '').toString() || null,
      snippet: item.contentSnippet || null
    }));

    // Optional: filter to past 24 hours
    if (past24h) {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      items = items.filter(i => {
        if (!i.published) return false;
        const t = Date.parse(i.published);
        return Number.isFinite(t) && t >= cutoff;
      });
    }

    // Optional: exclude common sports content
    if (excludeSports) {
      const sportsKeywords = [
        // English (general)
        'sport', 'sports', 'football', 'soccer', 'nba', 'nfl', 'mlb', 'nhl', 'tennis', 'golf', 'cricket', 'rugby',
        'fifa', 'uefa', 'premier league', 'la liga', 'serie a', 'bundesliga', 'champions league', 'world cup',
        'olympic', 'olympics', 'marathon', 'motogp', 'formula 1', 'f1', 'boxing', 'ufc', 'mma', 'ncaaf', 'ncaab',
        // English (horse-related)
        'horse', 'horses', 'equestrian', 'equestrianism', 'horse racing', 'horseracing', 'thoroughbred', 'steeplechase',
        'show jumping', 'dressage', 'eventing', 'polo', 'rodeo', 'harness racing', 'sulky', 'trotting', 'trot', 'gallop',
        // Swedish (general)
        'idrott', 'fotboll', 'ishockey', 'hockey', 'handboll', 'innebandy', 'bandy', 'friidrott', 'skidor',
        'längdskidor', 'alpint', 'skridsko', 'shl', 'allsvenskan', 'superettan', 'damallsvenskan', 'elitserien',
        'svenska cupen', 'landslaget', 'vm', 'em', 'sm-guld',
        // Swedish (horse-related)
        'häst', 'hästar', 'hästsport', 'ridsport', 'ridning', 'trav', 'galopp', 'ponnytrav', 'ponnygalopp', 'monté',
        'hoppning', 'dressyr', 'fälttävlan', 'hästpolo', 'sulkylopp'
      ];
      const pattern = new RegExp(`\\b(${sportsKeywords.map(k => k.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')).join('|')})\\b`, 'i');
      items = items.filter(i => {
        const haystack = [i.title, i.snippet, i.link, i.source].filter(Boolean).join(' ').toLowerCase();
        return !pattern.test(haystack);
      });
    }

    // Respect max after filtering
    items = items.slice(0, max);

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
    throw new Error('GoogleNews: query must be a string or { q, lang?, country?, max?, past24h?, excludeSports? }');
  }
}

export default GoogleNewsAPI;
