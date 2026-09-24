#!/usr/bin/env bash
# FAIRWAY: the search indexes the listing filters need.
#
# Sharetribe only filters on an extended-data key that has a search schema.
# Without one, the filter is ignored and every listing comes back, which is
# why category, flex, hand and the rest did nothing. Run once per marketplace
# environment (Dev first, then Live):
#
#   flex-cli login                         # you, with your own API key
#   bash scripts/fairway-search-indexes.sh <marketplace-ident>
#
# <marketplace-ident> is the short name in the Console URL,
# console.sharetribe.com/o/<organisation>/m/<marketplace-ident>/…
# (for example "fairway-dev"), not the marketplace's UUID.
#
# Keys are given without the "pub_" prefix; --scope public adds it. Running
# the script again is harmless: setting an existing schema just rewrites it.

set -euo pipefail

MARKETPLACE="${1:-}"
if [ -z "$MARKETPLACE" ]; then
  echo "Usage: bash scripts/fairway-search-indexes.sh <marketplace-ident>" >&2
  exit 1
fi

set_schema() {
  local key="$1" type="$2" doc="$3"
  echo "→ pub_${key} (${type})"
  flex-cli search set --key "$key" --type "$type" --scope public --doc "$doc" -m "$MARKETPLACE"
}

# Not here: pub_categoryLevel1. Sharetribe indexes it itself once the nine
# categories exist in Console (docs/console-setup.md, step 1).

# The filters on the search page (configListing.js)
set_schema condition      enum "Stand"
set_schema shipment_type  enum "Levering"
set_schema dexterity      enum "Hånd"
set_schema shaft_flex     enum "Flex"
set_schema shaft_material enum "Skaftmateriale"
set_schema loft           enum "Loft"
set_schema wedge_loft     enum "Wedge-loft"
set_schema putter_type    enum "Puttertype"
set_schema putter_length  enum "Putterlængde"
set_schema shoe_size      enum "Skostørrelse"

# Free-text fields, so a keyword search for "Scotty Cameron" or "Vokey" finds
# the listing even when the brand is not in the title
set_schema brand text "Mærke"
set_schema model text "Model"

echo
echo "Done. Current schemas:"
flex-cli search -m "$MARKETPLACE"
