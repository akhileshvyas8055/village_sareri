/**
 * Search and Ranking algorithm for Local Business Directory
 */
export const rankAndFilterBusinesses = (businesses, { query = '', category = 'ALL', sortBy = 'relevance' }) => {
  if (!Array.isArray(businesses)) return [];

  const cleanQuery = query.toLowerCase().trim();
  const searchTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  // 1. Filter by category
  let list = businesses.filter((b) => {
    if (!b || b.status !== 'approved') return false;
    if (category !== 'ALL' && b.category !== category) return false;
    return true;
  });

  // 2. Score relevance if there is a search query
  if (searchTokens.length > 0) {
    list = list
      .map((b) => {
        let score = 0;
        const name = (b.name || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const desc = (b.description || '').toLowerCase();
        const locality = (b.locality || '').toLowerCase();
        const address = (b.address || '').toLowerCase();
        const products = Array.isArray(b.products) ? b.products.join(' ').toLowerCase() : '';
        const services = Array.isArray(b.services) ? b.services.join(' ').toLowerCase() : '';
        const keywords = Array.isArray(b.keywords) ? b.keywords.join(' ').toLowerCase() : '';

        // Exact full phrase match in name
        if (name === cleanQuery) score += 50;
        else if (name.startsWith(cleanQuery)) score += 30;
        else if (name.includes(cleanQuery)) score += 20;

        // Token matches
        for (const token of searchTokens) {
          if (name.includes(token)) score += 15;
          if (cat.includes(token)) score += 12;
          if (products.includes(token)) score += 10;
          if (services.includes(token)) score += 10;
          if (keywords.includes(token)) score += 8;
          if (desc.includes(token)) score += 4;
          if (locality.includes(token) || address.includes(token)) score += 5;
        }

        // Slight quality boost for genuine reviews & completeness
        if (b.rating && b.reviewCount) {
          score += Math.min(5, b.rating * (Math.log10(b.reviewCount + 1)));
        }

        // Boost featured businesses slightly
        if (b.featured) score += 5;

        return { business: b, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.business);
  }

  // 3. Apply sorting
  if (sortBy === 'top-rated') {
    list.sort((a, b) => {
      const rateA = Number(a.rating) || 0;
      const rateB = Number(b.rating) || 0;
      if (rateB !== rateA) return rateB - rateA;
      return (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0);
    });
  } else if (sortBy === 'most-reviewed') {
    list.sort((a, b) => {
      const revA = Number(a.reviewCount) || 0;
      const revB = Number(b.reviewCount) || 0;
      if (revB !== revA) return revB - revA;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });
  } else if (sortBy === 'name') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'hi'));
  } else if (sortBy === 'recent') {
    list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  } else if (sortBy === 'relevance' && searchTokens.length === 0) {
    // Default when no search query: Featured first, then highest rated, then latest
    list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const rateDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (rateDiff !== 0) return rateDiff;
      return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
    });
  }

  return list;
};
