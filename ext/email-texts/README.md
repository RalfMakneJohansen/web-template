# Email texts

The texts of Sharetribe's automatic emails live in Console
(Build → Content → Email texts), not in this repo. These files are the source
we paste from.

- `da.json` — our Danish texts for every email the purchase process and the
  account flows send (226 keys). Placeholders such as `{listingTitle}` and
  tags such as `<salelink>` must stay exactly as in the English originals.
- `email-texts.json` — the complete asset as uploaded to Console: Sharetribe's
  584 default keys with `da.json` merged over them. Booking, negotiation and
  download emails are left in English, since Fairway does not use those
  processes.

The wording follows what the process actually does (process.edn): 48 hours
from delivery to automatic approval and payout, a reminder to the buyer after
24 hours, a shipping reminder to the seller after 3 days, and automatic
cancellation with a full refund if nothing is shipped within 14 days.
