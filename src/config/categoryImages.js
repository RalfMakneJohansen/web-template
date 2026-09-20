// Newer models, shot at 700x700 — used wherever we have one for the category.
import elyte3Wood from '../assets/klubber/elyte-3wood.jpg';
import g430Hybrid from '../assets/klubber/g430-hybrid.jpg';
import gt3Driver from '../assets/klubber/gt3-driver.jpg';
import puttershot from '../assets/klubber/putter.jpg';
import vokeyWedges from '../assets/klubber/vokey-wedges.jpg';

// The rest, at 300x300, until there are product shots for them.
import andet from '../assets/categories/andet.jpg';
import bag from '../assets/categories/bag.jpg';
import jernsaet from '../assets/categories/jernsaet.jpg';
import sko from '../assets/categories/sko.jpg';

/**
 * FAIRWAY: one picture per category, in one place.
 *
 * The wizard's category picker and the front page's category strip both draw
 * these, and they have to agree — a driver that looks like one thing when you
 * list it and another when you browse for it is the kind of small wrongness
 * people notice without being able to say why.
 *
 * Keyed on the category ids in configListing.js. A category with no entry here
 * is simply not shown as a picture; nothing falls back to a blank frame.
 */
const CATEGORY_IMAGES = {
  driver: gt3Driver,
  'fairway-wood': elyte3Wood,
  hybrid: g430Hybrid,
  jernsaet,
  wedge: vokeyWedges,
  putter: puttershot,
  bag,
  sko,
  andet,
};

export default CATEGORY_IMAGES;
