# Where the freight data lives

Everything a Shipmondo label needs is collected before money moves. This is
where the automation reads it, all through the Integration API (the backend
can read protected data; other users cannot).

## Recipient — the buyer

Collected at checkout (`CheckoutPage/ShippingDetails`), required before the
buyer can pay, and stored on the **transaction**:

```
transaction.attributes.protectedData.shippingDetails = {
  name: "Mette Jensen",
  phoneNumber: "+45 12 34 56 78",     // always this format
  address: {
    line1: "Vejnavn 12",
    line2: "2. tv.",                   // optional
    postalCode: "2100",                // four digits
    city: "København Ø",
    country: "DK"                      // Denmark only
  }
}
```

Email: `user.attributes.email` of the transaction's customer.

## Sender — the seller

Collected on the listing wizard's shipping step
(`EditListingShippingPanel`), required before a listing can be saved, and
stored once on the **seller's profile**, shared by all their listings:

```
user.attributes.profile.protectedData.senderAddress = {
  name: "Ole Hansen",
  line1: "Gade 3",
  postalCode: "8000",
  city: "Aarhus C",
  country: "DK"
}
user.attributes.profile.protectedData.phoneNumber = "+45 87 65 43 21"
```

Email: `user.attributes.email` of the transaction's provider.

The box is sent to this address too, when the seller chose it.

## What to send — the listing

```
listing.attributes.publicData.shipment_type = "own" | "box" | "meetup"
```

- `own`: send only the label; the seller packs in their own box. Buyer sees 2–3 working days.
- `box`: send the seller a box and a label first. Buyer sees 4–6 working days.
- `meetup`: nothing to send. The order's deliveryMethod is `pickup`; buyer and
  seller arrange the handover in the order messages, and the buyer marking the
  order received releases the payout. No sender address is required.

`own` and `box` ship with the flat 50 kr. freight the buyer paid
(`server/api-util/lineItems.js`); a meetup has no freight line. Meetup needs
pickup enabled on the listing type in Console, or the option is hidden in the
listing wizard.

## Box progress on the order

When the automation has sent a box, it writes to the transaction's metadata,
which the order page shows to both sides:

```
transaction.attributes.metadata.boxDispatchedAt = "2026-09-25T09:00:00Z"
transaction.attributes.metadata.boxTracking = "00370712345678901234"   // optional
```

## Listings created before 2026-09-24

Their sellers have no `senderAddress` yet. They get it the next time they open
the listing's shipping step, and the automation should treat a missing sender
address as "ask the seller" rather than failing silently.

The phone and postcode rules are shared in `src/util/fairwayContact.js`.

## Marking delivery — this starts the buyer's 48 hours

The process's `delivered` state is what starts the 48-hour window
(`transition/auto-mark-received`, 48 hours after entering `delivered`). It
must therefore be entered when the parcel **arrives**, not when it is sent —
otherwise the buyer's window, and the payout, run while the parcel is still
in transit.

- The seller's button on a shipped order says "Pakken er leveret" and the
  order page tells them to press it when track & trace shows delivery.
- The automation should do this itself: when Shipmondo reports the parcel as
  delivered, call `transition/operator-mark-delivered` on the transaction
  through the Integration API. Sellers then never need to press it.

## Track & trace on the order

Buyer and seller both see the parcel's tracking on the order page
(`TransactionPanel/ShipmentTrackingMaybe`). It is read from the transaction's
metadata, which users cannot write:

```
transaction.attributes.metadata.shipment = {       // the parcel to the buyer
  carrier: "gls" | "postnord" | "dao" | "bring" | "dhl",
  trackingNumber: "00370712345678901234",
  trackingUrl: "https://…",                          // optional; else the carrier's page
  status: "label_created" | "in_transit" | "ready_for_pickup" | "delivered" | "exception",
  events: [{ at, text, location }],                  // optional, newest first, max 20
  updatedAt: "2026-09-25T12:00:00Z"
}
transaction.attributes.metadata.boxShipment = { … }  // same shape: the box to the seller
```

Two ways it gets there, both through `server/api-util/integrationApi.js`:

- **The seller types it in.** While the order waits to be sent, the seller
  sees "Tilføj track & trace" and enters the number from the label
  (`POST /api/transaction-tracking`). The server checks it is the order's
  seller, that the order is shipped and still in `purchased`.
- **The freight automation reports it.** `POST /api/shipping/webhook` with
  the header `x-fairway-secret` and a JSON body
  `{ transactionId, leg: "parcel" | "box", carrier, trackingNumber, status, trackingUrl?, events? }`.
  When the parcel to the buyer is `delivered` and the order is still in
  `purchased`, it also calls `transition/operator-mark-delivered`, which
  starts the buyer's 48 hours. Shipmondo's webhook format is translated into
  this body when Shipmondo is connected.

Environment variables (server only, never `REACT_APP_`):

```
SHARETRIBE_INTEGRATION_CLIENT_ID=      # Console → Advanced → Applications → Integration API
SHARETRIBE_INTEGRATION_CLIENT_SECRET=
FAIRWAY_SHIPPING_WEBHOOK_SECRET=       # a long random string, shared with the automation
```

Without the Integration API credentials both endpoints answer 503 and the
seller's form says tracking is not switched on yet, pointing them to the
order messages instead.
