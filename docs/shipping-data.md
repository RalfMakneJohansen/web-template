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
listing.attributes.publicData.shipment_type = "box" | "own"
```

- `box`: send the seller a box and a label.
- `own`: send only the label; the seller packs in their own box.

Both ship with the flat 50 kr. freight the buyer paid
(`server/api-util/lineItems.js`).

## Listings created before 2026-09-24

Their sellers have no `senderAddress` yet. They get it the next time they open
the listing's shipping step, and the automation should treat a missing sender
address as "ask the seller" rather than failing silently.

The phone and postcode rules are shared in `src/util/fairwayContact.js`.
