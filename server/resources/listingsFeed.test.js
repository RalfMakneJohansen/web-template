const { buildFeed, escapeXml } = require('./listingsFeed');

describe('listings feed', () => {
  it('escapes XML', () => {
    expect(escapeXml('Ping <G425> & "Max"')).toBe('Ping &lt;G425&gt; &amp; &quot;Max&quot;');
  });

  it('lists each listing with link, price, details and image', () => {
    const xml = buildFeed(
      {
        data: {
          data: [
            {
              id: { uuid: 'abc' },
              attributes: {
                title: 'Ping G425 Max driver',
                price: { amount: 124900, currency: 'DKK' },
                publicData: { brand: 'Ping', condition: 'god' },
                createdAt: new Date('2026-09-25T10:00:00Z'),
              },
              relationships: { images: { data: [{ id: { uuid: 'img1' } }] } },
            },
          ],
          included: [
            {
              id: { uuid: 'img1' },
              type: 'image',
              attributes: { variants: { 'listing-card': { url: 'https://img.example/1.jpg' } } },
            },
          ],
        },
      },
      'https://fairway.dk'
    );

    expect(xml).toContain('<title>Ping G425 Max driver</title>');
    expect(xml).toContain('<link>https://fairway.dk/l/abc</link>');
    expect(xml).toContain('<description>1.249 kr. · Ping · Stand: God</description>');
    expect(xml).toContain('<media:content url="https://img.example/1.jpg"');
    expect(xml).toContain('<language>da</language>');
  });

  it('is a valid empty feed without listings', () => {
    const xml = buildFeed({ data: { data: [] } }, 'https://fairway.dk');
    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });
});
