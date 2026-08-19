// Favorite packages, persisted per browser.
//
// Favorites are global rather than per-manifest: the unit of interest is the package, not
// the package-in-a-manifest, so starring bu-navigation in prod/cms stars it everywhere it
// appears. Package ids are not sensitive, so localStorage is an appropriate home.
//
// All localStorage access lives here. It throws in Safari private browsing and when
// disabled by policy, and the stored value can be hand-edited or corrupt, so both
// directions are guarded and degrade to "favorites work for this session only".
const STORAGE_KEY = 'wp-deploy:favorites';

function readFavorites() {
    if (typeof window === 'undefined') return [];
    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
        // Reject anything that isn't a list of strings rather than trusting storage.
        return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
    } catch {
        return [];
    }
}

function writeFavorites(ids) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
        // Storage unavailable or full -- favorites stay in memory for this session.
    }
}

export { readFavorites, writeFavorites };
