/**
 * Construct a list of custom CSS Properties from branding config.
 *
 * Fairway's palette is owned in src/styles/marketplaceDefaults.css rather than
 * in Console, so the hosted branding colours are deliberately not injected —
 * Console's single-colour picker cannot express the full palette, and its value
 * would otherwise override the design tokens as an inline style.
 *
 * To hand colour control back to Console, restore the mapping below from
 * brandingConfig.marketplaceColor / colorPrimaryButton and their dark/light
 * variants.
 *
 * @param {Object} brandingConfig branding configuration
 * @returns Object literal containing custom CSS Properties (e.g. ['--marketplaceColor']: #aaff00).
 */
export const getCustomCSSPropertiesFromConfig = brandingConfig => {
  return {};
};

/**
 * This includes Custom CSS Properties, which are defined in hosted asset: branding.json
 *
 * @param {Object} brandingConfig branding configuration
 * @param {Node} element DOM element, which gets these CSS vars included.
 */
export const includeCSSProperties = (brandingConfig, element) => {
  Object.entries(getCustomCSSPropertiesFromConfig(brandingConfig)).forEach(customCSSProperty => {
    const [key, value] = customCSSProperty;
    element.style.setProperty(key, value);
  });
};
