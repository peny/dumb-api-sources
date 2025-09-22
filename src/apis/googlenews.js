import Parser from 'rss-parser';

class GoogleNewsAPI {
  constructor() {
    this.parser = new Parser({ timeout: 10000 });
    this.baseUrl = 'https://news.google.com/rss';
  }

  // query can be a string like 'apple', or an object { q, lang, country, max, past24h, excludeSports, excludeKeywords, excludeDomains }
  async getHeadlines(query) {
    const {
      q,
      lang = 'en',
      country = 'US',
      max = 10,
      past24h = false,
      excludeSports = false,
      excludeKeywords = [],
      excludeDomains = []
    } = this.normalizeQuery(query);

    // Build pre-query exclusions (minus terms) to reduce sports content upstream
    const preExcludeSportsKeywords = excludeSports ? [
      // English common sports
      'sport', 'sports', 'football', 'soccer', 'nba', 'nfl', 'mlb', 'nhl', 'tennis', 'golf', 'cricket', 'rugby',
      'fifa', 'uefa', 'premier league', 'la liga', 'serie a', 'bundesliga', 'champions league', 'world cup',
      'olympic', 'olympics', 'marathon', 'motogp', 'formula 1', 'f1', 'boxing', 'ufc', 'mma',
      // English equestrian/horse
      'horse', 'horses', 'equestrian', 'equestrianism', 'horse racing', 'horseracing', 'thoroughbred', 'steeplechase',
      'show jumping', 'dressage', 'eventing', 'polo', 'rodeo', 'harness racing', 'sulky', 'trotting', 'trot', 'gallop',
      // Swedish common sports
      'idrott', 'fotboll', 'ishockey', 'hockey', 'handboll', 'innebandy', 'bandy', 'friidrott', 'skidor',
      'längdskidor', 'alpint', 'skridsko', 'shl', 'allsvenskan', 'superettan', 'damallsvenskan', 'elitserien',
      'svenska cupen', 'landslaget', 'vm', 'em', 'sm-guld',
      // Swedish equestrian/horse
      'häst', 'hästar', 'hästsport', 'ridsport', 'ridning', 'trav', 'galopp', 'ponnytrav', 'ponnygalopp', 'monté',
      'hoppning', 'dressyr', 'fälttävlan', 'hästpolo', 'sulkylopp'
    ] : [];

    const keywordList = Array.isArray(excludeKeywords)
      ? excludeKeywords
      : (excludeKeywords ? [excludeKeywords] : []);
    const domainList = Array.isArray(excludeDomains)
      ? excludeDomains
      : (excludeDomains ? [excludeDomains] : []);

    const allExcludeKeywords = [...new Set([...keywordList, ...preExcludeSportsKeywords])];
    const defaultSportsDomains = excludeSports ? [
      // English/global sports outlets (include common regionals)
      'espn.com', 'espn.co.uk', 'espn.com.au', 'espncricinfo.com', 'cbssports.com', 'foxsports.com', 'nbcsports.com', 'skysports.com', 'tsn.ca', 'theathletic.com', 'bleacherreport.com', 'goal.com', 'si.com', 'sports.yahoo.com', 'bbc.co.uk/sport', 'bbc.com/sport',
      // Tennis
      'lavercup.com', 'atptour.com', 'wtatennis.com', 'tennis.com', 'tennis365.com',
      // Hockey-specific
      'nhl.com', 'thehockeynews.com',
      // Soccer/football
      'uefa.com', 'fifa.com', 'premierleague.com',
      // Swedish sports outlets (incl. horse racing)
      'svt.se/sport', 'svenskafans.com', 'aftonbladet.se/sportbladet', 'expressen.se/sport', 'fotbollskanalen.se', 'hockeysverige.se',
      'svenskgalopp.se', 'travsport.se', 'atg.se', 'broparken.se', 'bropark.se'
    ] : [];
    const allExcludeDomains = [...new Set([...domainList, ...defaultSportsDomains])];

    const minusTerms = [
      ...allExcludeKeywords.map(term => `-${term.trim().includes(' ') ? '"' + term.trim() + '"' : term.trim()}`),
      ...allExcludeDomains.map(domain => `-site:${domain.trim()}`)
    ].filter(Boolean).join(' ');

    const qWithExclusions = [q, minusTerms].filter(Boolean).join(' ').trim();

    const url = `${this.baseUrl}/search?hl=${encodeURIComponent(lang)}&gl=${encodeURIComponent(country)}&q=${encodeURIComponent(qWithExclusions)}&ceid=${encodeURIComponent(country)}:${encodeURIComponent(lang)}`;

    const feed = await this.parser.parseURL(url);

    // Normalize items
    let items = (feed.items || []).map(item => ({
      title: item.title || null,
      link: item.link || null,
      published: item.isoDate || item.pubDate || null,
      source: (item.creator || item.author || '').toString() || null,
      snippet: item.contentSnippet || null
    }));

    // Filter to past 24 hours
    if (past24h) {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      items = items.filter(i => {
        if (!i.published) return false;
        const t = Date.parse(i.published);
        return Number.isFinite(t) && t >= cutoff;
      });
    }

    // Post-filter by keywords (sports or provided keywords)
    if (excludeSports || allExcludeKeywords.length > 0) {
      const defaults = excludeSports ? preExcludeSportsKeywords : [];
      const combined = [...new Set([...(allExcludeKeywords || []), ...defaults])];
      if (combined.length > 0) {
        const needles = combined.map(k => k.toLowerCase());
        items = items.filter(i => {
          const haystack = [i.title, i.snippet, i.link, i.source].filter(Boolean).join(' ').toLowerCase();
          return !needles.some(n => n && haystack.includes(n));
        });
      }
    }

    // Post-filter by domains
    if (allExcludeDomains.length > 0) {
      items = items.filter(i => {
        if (!i.link) return true;
        try {
          const host = new URL(i.link).hostname.toLowerCase();
          return !allExcludeDomains.some(d => {
            const needle = d.toLowerCase();
            // allow entries like 'bbc.com/sport' by checking path when provided
            if (needle.includes('/')) {
              const url = new URL(i.link);
              return url.hostname.toLowerCase().endsWith(needle.split('/')[0]) && url.pathname.toLowerCase().startsWith('/' + needle.split('/').slice(1).join('/'));
            }
            return host === needle || host.endsWith('.' + needle) || host.includes(needle);
          });
        } catch {
          return true;
        }
      });
    }

    // Respect max after filtering
    items = items.slice(0, max);

    return {
      query: qWithExclusions || q,
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
    throw new Error('GoogleNews: query must be a string or { q, lang?, country?, max?, past24h?, excludeSports?, excludeKeywords?, excludeDomains? }');
  }
}

export default GoogleNewsAPI;
