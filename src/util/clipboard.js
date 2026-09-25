/**
 * Copies text with the async clipboard API, or — where that is missing or
 * refused (older browsers, plain http) — with a selected textarea and the
 * legacy copy command, so copying works everywhere.
 *
 * @param {string} text
 * @returns {Promise<boolean>} whether the text was copied
 */
export const copyText = async text => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through to the legacy path
  }
  if (typeof document === 'undefined') {
    return false;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
};
