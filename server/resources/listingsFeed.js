const { createTTLCache } = require('../api-util/cache.js');
const { getRootURL } = require('../api-util/rootURL.js');
const sdkUtils = require('../api-util/sdk.js');

/**
 * FAIRWAY: an RSS feed of the newest listings — /feed/nyeste-annoncer.xml
 *
 * Mailchimp's "RSS to email" campaign reads this and sends subscribers the
 * week's new gear by itself, images and prices included. Any feed reader can
 * use it too. Public listings only, the same ones search shows; cached for ten
 * minutes so a burst of requests costs one API call.
 */

const TTL_SECONDS = 600;
const MAX_ITEMS = 30;
const cache = createTTLCache(TTL_SECONDS);

const escapeXml = value =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// 124950 øre → "1.250 kr."
const formatPrice = price => {
  if (!price || typeof price.amount !== 'number') {
    return null;
  }
  const kroner = Math.round(price.amount / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return price.currency === 'DKK' ? `${kroner} kr.` : `${kroner} ${price.currency}`;
};

const CONDITION = { 'som-ny': 'Som ny', god: 'God', okay: 'Okay', slidt: 'Slidt' };

/**
 * Builds the feed XML from a listings.query response.
 *
 * @param {Object} response SDK response with included images
 * @param {string} rootUrl the marketplace's public URL
 * @returns {string} RSS 2.0 XML
 */
const buildFeed = (response, rootUrl) => {
  const listings = response?.data?.data || [];
  const images = (response?.data?.included || []).filter(i => i.type === 'image');
  const imageUrl = listing => {
    const ref = listing.relationships?.images?.data?.[0];
    const image = ref && images.find(i => i.id.uuid === ref.id.uuid);
    const variants = image?.attributes?.variants || {};
    return (variants['listing-card-2x'] || variants['listing-card'] || variants.default)?.url;
  };

  const items = listings.map(listing => {
    const { title, price, publicData = {}, createdAt } = listing.attributes;
    const url = `${rootUrl}/l/${listing.id.uuid}`;
    const details = [
      formatPrice(price),
      publicData.brand,
      CONDITION[publicData.condition] ? `Stand: ${CONDITION[publicData.condition]}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    const image = imageUrl(listing);
    return [
      '    <item>',
      `      <title>${escapeXml(title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(details)}</description>`,
      createdAt ? `      <pubDate>${new Date(createdAt).toUTCString()}</pubDate>` : null,
      image
        ? `      <media:content url="${escapeXml(image)}" medium="image" type="image/jpeg" />`
        : null,
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Fairway – nyeste annoncer</title>',
    `    <link>${escapeXml(rootUrl)}</link>`,
    `    <atom:link href="${escapeXml(
      `${rootUrl}/feed/nyeste-annoncer.xml`
    )}" rel="self" type="application/rss+xml" />`,
    '    <description>Nyt brugt golfudstyr på Fairway</description>',
    '    <language>da</language>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
};

/**
 * Route: GET /feed/nyeste-annoncer.xml
 */
const listingsFeed = (req, res) => {
  res.set({
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': `public, max-age=${TTL_SECONDS}`,
  });

  const { data } = cache.newestListings;
  if (data) {
    res.send(data);
    return;
  }

  const sdk = sdkUtils.getSdk(req, res);
  const rootUrl = getRootURL();

  sdkUtils
    .fetchAccessControlAsset(sdk)
    .then(
      response => {
        const asset = response.data.data[0];
        const { marketplace } = asset?.type === 'jsonAsset' ? asset.attributes.data : {};
        return marketplace?.private === true;
      },
      // No access-control asset means a public marketplace, as for the sitemap.
      e => (e.status === 404 ? false : Promise.reject(e))
    )
    .then(isPrivate => {
      if (isPrivate) {
        res.status(404).end();
        return null;
      }
      return sdk.listings
        .query({
          perPage: MAX_ITEMS,
          sort: '-createdAt',
          include: ['images'],
          'fields.listing': ['title', 'price', 'publicData', 'createdAt'],
          'fields.image': ['variants.listing-card', 'variants.listing-card-2x', 'variants.default'],
          'imageVariant.listing-card': 'w:400;h:400;fit:crop',
          'imageVariant.listing-card-2x': 'w:800;h:800;fit:crop',
        })
        .then(response => {
          const xml = buildFeed(response, rootUrl);
          cache.newestListings = xml;
          res.send(xml);
        });
    })
    .catch(e => {
      console.error('listings-feed-failed', e.message);
      res.status(503).end();
    });
};

module.exports = listingsFeed;
module.exports.buildFeed = buildFeed;
module.exports.escapeXml = escapeXml;
