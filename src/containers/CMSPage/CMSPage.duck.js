import { fetchPageAssets } from '../../ducks/hostedAssets.duck';

import localPages from './localPages';

export const loadData = (params, search) => dispatch => {
  const pageId = params.pageId;
  const pageAsset = { [pageId]: `content/pages/${pageId}.json` };
  const hasFallbackContent = false;
  // FAIRWAY: pages with local copy (localPages.js) are expected to 404 until an
  // operator creates them in Console, and CMSPage then renders the local copy.
  // That 404 is not an error, so it is neither logged nor passed on to the
  // route loader, which would report a failed data load.
  const hasLocalCopy = !!localPages[pageId];
  return dispatch(fetchPageAssets(pageAsset, hasFallbackContent, hasLocalCopy)).catch(e => {
    if (hasLocalCopy && e?.status === 404) {
      return null;
    }
    throw e;
  });
};
