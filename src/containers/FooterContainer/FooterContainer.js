import React from 'react';

import FairwayFooter from './FairwayFooter';

/**
 * FAIRWAY: every page gets Fairway's own footer.
 *
 * The template renders the footer from the hosted `footer` asset in Console,
 * and returns null when that asset is empty. Ours is empty, so until today the
 * front page carried the Fairway footer while every other page carried the
 * Console placeholder — "In Console, go to Content → Footer to add your slogan
 * here. © 2026 Your marketplace." — in English, on the listing and search
 * pages, which is where buyers actually decide.
 *
 * The footer is a fixed part of the brand rather than something an operator
 * should be editing per page, so it is authored in code and the hosted asset is
 * deliberately not read. To go back to a Console-managed footer, restore the
 * SectionBuilder version from git history and fill in the asset.
 */
const FooterComponent = () => {
  return <FairwayFooter />;
};

export default FooterComponent;
