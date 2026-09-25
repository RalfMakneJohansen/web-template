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
