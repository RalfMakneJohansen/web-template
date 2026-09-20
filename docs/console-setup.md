# Fairway — Console setup

The frontend is ahead of the marketplace configuration. This is what has to be
set in Sharetribe Console for the site to actually work, in dependency order.

Everything here was read from the API on 2026-09-20, not assumed:

| Asset | State |
| --- | --- |
| `/listings/listing-categories.json` | **404 — does not exist** |
| `/listings/listing-fields.json` | exists, **0 fields** |
| `/listings/listing-types.json` | 1 type — fine |
| `/integrations/analytics.json` | **404 — no GA4** |
| `/listings/listing-search.json` | exists, keyword search |

The site currently runs on local fallbacks in `src/config/configListing.js` and
`src/util/configHelpers.js`. They exist because Console is empty. Once Console
is filled in they should be deleted — each one is marked with a FAIRWAY comment
saying how to revert it.

**Environment:** the local app and the test deploy talk to **Fairway Dev**
(marketplace `6a8d8ee7-27af-4c85-b3d9-07860d28cbe1`). Console opens on Live by
default — switch to Dev before doing any of this, or it lands in the wrong
database.

---

## 1. Categories — do this first

This is the highest-value item on the whole project. There are no categories in
Console, which is why `pub_categoryLevel1` is not indexed, which is why **every
category link on the site changes the URL and nothing else**: the topbar nav,
the filter rail, the footer links and the mobile menu are all decorative today.

Console → Listings → Categories. Create nine, no subcategories.

**The ids must match exactly** — the code, the existing listings and the
category photographs are all keyed on them. The display name can be edited
later; the id cannot.

| id | Name |
| --- | --- |
| `driver` | Driver |
| `fairway-wood` | Fairway wood |
| `hybrid` | Hybrid |
| `jernsaet` | Jernsæt |
| `wedge` | Wedge |
| `putter` | Putter |
| `bag` | Bag |
| `sko` | Sko |
| `andet` | Andet |

When this is done, tell me: I remove the local category fallback in
`configHelpers.js` and re-test the navigation end to end.

---

## 2. Listing fields

Console has zero listing fields, so all fourteen come from
`src/config/configListing.js`. That works — the wizard, the listing page and the
review step all read it — but nothing can be **filtered** on a field that only
exists in the frontend.

Two ways forward. Either is fine; do not do both.

**(a) Keep them in code, add search indexes.** Cheapest. The fields stay where
they are and only become searchable. One command each, then I flip `FILTER_OFF`
to on in `configListing.js`:

```
flex-cli search set --key pub_condition      --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_dexterity      --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_shaft_flex     --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_shaft_material --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_loft           --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_wedge_loft     --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_putter_type    --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_putter_length  --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_shoe_size      --type enum --scope public -m <marketplace-id>
flex-cli search set --key pub_shipment_type  --type enum --scope public -m <marketplace-id>
```

`brand` and `model` are free text, so they are found by the keyword search
rather than by a filter. They need no index.

**(b) Recreate them in Console.** More work, but then an operator can change
options without a developer. If you go this way the keys, types and options
have to match the table below exactly, or existing listings lose their data.

| key | type | required | categories | options |
| --- | --- | --- | --- | --- |
| `brand` | text | yes | all | — |
| `model` | text | no | all | — |
| `condition` | enum | yes | all | `som-ny` `god` `okay` `slidt` |
| `shipment_type` | enum | yes | all | `box` `own` |
| `dexterity` | enum | yes | clubs¹ | `right` `left` |
| `shaft_flex` | enum | yes | shafted² | `ladies` `senior` `regular` `stiff` `extra-stiff` |
| `shaft_material` | enum | no | shafted² | `steel` `graphite` |
| `shaft_model` | text | no | shafted² | — |
| `loft` | enum | yes | driver, fairway-wood, hybrid | `8-0` … `27-0` (17 steps) |
| `wedge_loft` | enum | yes | wedge | `46` … `64` (even) |
| `iron_set` | text | no | jernsaet | — |
| `putter_type` | enum | no | putter | `blade` `mallet` |
| `putter_length` | enum | no | putter | `32` … `36` |
| `shoe_size` | enum | no | sko | `38` … `48` |

¹ driver, fairway-wood, hybrid, jernsaet, wedge, putter
² driver, fairway-wood, hybrid, jernsaet, wedge

There are also three metadata fields (`tracking_a`, `tracking_b`,
`box_dispatched_at`). Metadata can only be written by the Integration API, so
they need an integration client before they do anything.

---

## 3. Commission — decided, not yet applied

The decision was **the buyer pays 10%**. The server currently does the
opposite: it returns `provider-commission −10%` and no customer commission, so
the seller is paying it.

Console → Transactions → Commission: set a **customer commission of 10%** and
remove the provider commission.

The listing page's price breakdown reads the real line items, so it follows
this by itself — "Køberbeskyttelse — Inkluderet" becomes a real charged line the
moment you change it. What does **not** follow automatically is the written
copy, which still says selling costs 10%. Tell me when it is flipped and I
change those strings in the same pass, so the site is never telling two stories
at once.

---

## 4. Analytics

`/integrations/analytics.json` is 404, so the sixteen events the site already
sends go nowhere. Console → Integrations → Analytics, paste the GA4 measurement
id. Nothing in the code changes; `window.gtag` starts existing and the events
start landing.

Events currently fired: signup, login, listing draft created, each wizard step,
listing published, listing viewed, search performed, contact seller, offer
started, buy clicked, listing shared, price guidance shown.

---

## 5. Inventory

30–40 real listings. Not a configuration task, but it blocks judgement on
everything else: the related-listings strip needs more than one listing in a
category to appear at all, and the wizard's price guidance stays hidden until
there are four comparable listings. Neither has ever been seen working.

---

## 6. Before launch

- **Stripe.** Connect it, then remove `REACT_APP_SKIP_STRIPE_PAYOUT_DETAILS`
  from `.env` and from `render.yaml`. Until then the payout step is skipped and
  no money can actually move.
- **Facebook login.** `REACT_APP_FACEBOOK_APP_ID` plus the identity provider in
  Console. The template already has the buttons and the signup-with-idp flow.
- **Bidding.** "Giv bud" composes an offer into the first message today. Real
  binding offers need the `default-negotiation` process on the listing type,
  which is a different state machine and a business decision.
- **Basic auth off.** Delete `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`
  from the deploy on launch day.

---

## What is still unverified

Nobody has completed the seller flow or a purchase. The wizard has never been
seen reaching publish, and no transaction has been made. That is where the
expensive defects live — the one bug found there so far, checkout breaking on
orders of two or more items, was in code that looked fine and passed review.

One end-to-end run, together, after step 1 and step 5.
