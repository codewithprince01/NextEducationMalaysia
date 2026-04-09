 
const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const sitemapIndexUrl = process.env.SITEMAP_URL || `${baseUrl}/sitemap.xml`;
const maxUrls = Number(process.env.SITEMAP_MAX_URLS || 0); // 0 => no limit

function extractLocs(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gim)];
  return matches.map((m) => m[1].trim()).filter(Boolean);
}

async function fetchText(url) {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url} (${res.status})`);
  }
  return res.text();
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return { url, status: res.status, ok: res.status >= 200 && res.status < 300 };
  } catch (error) {
    return { url, status: 0, ok: false, error: String(error) };
  }
}

async function main() {
  console.log(`Checking sitemap index: ${sitemapIndexUrl}`);
  const sitemapIndexXml = await fetchText(sitemapIndexUrl);
  const sitemapUrls = extractLocs(sitemapIndexXml);

  if (!sitemapUrls.length) {
    throw new Error('No child sitemaps found in sitemap index.');
  }

  const allPageUrls = [];
  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchText(sitemapUrl);
    const locs = extractLocs(xml);
    allPageUrls.push(...locs);
  }

  const uniqueUrls = [...new Set(allPageUrls)];
  const urlsToCheck = maxUrls > 0 ? uniqueUrls.slice(0, maxUrls) : uniqueUrls;

  console.log(`Found ${uniqueUrls.length} URLs. Checking ${urlsToCheck.length} URLs...`);

  const results = [];
  const concurrency = 12;
  for (let i = 0; i < urlsToCheck.length; i += concurrency) {
    const chunk = urlsToCheck.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(checkUrl));
    results.push(...chunkResults);
  }

  const failed = results.filter((r) => !r.ok);
  const byStatus = results.reduce((acc, r) => {
    const key = String(r.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log('Status summary:', byStatus);

  if (failed.length) {
    console.error(`\nNon-200 URLs (${failed.length}):`);
    failed.forEach((r) => console.error(`${r.status} -> ${r.url}${r.error ? ` (${r.error})` : ''}`));
    process.exit(1);
  }

  console.log('\nAll sitemap URLs returned HTTP 200.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

