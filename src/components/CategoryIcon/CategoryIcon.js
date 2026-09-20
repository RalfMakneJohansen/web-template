import React from 'react';

/**
 * Line-art icons for the Fairway category grid. Each icon draws in currentColor
 * so the card can control the color on hover.
 *
 * @param {Object} props
 * @param {string} props.category category id, e.g. 'driver'
 * @param {string?} props.className
 */
/**
 * The ids this component draws a real icon for. Anything else falls through to
 * the generic mark, which is fine inline but is not enough to justify swapping
 * a whole select control for a picture grid — so callers that need to know
 * whether a category set is drawable check against this.
 */
export const DRAWN_CATEGORY_IDS = [
  'driver',
  'fairway-wood',
  'hybrid',
  'jernsaet',
  'wedge',
  'putter',
  'bag',
  'sko',
  'andet',
];

const CategoryIcon = props => {
  const { category, className } = props;

  const svgProps = {
    className,
    width: '32',
    height: '32',
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (category) {
    case 'driver':
      return (
        <svg {...svgProps}>
          <path d="M20 4 13 19" />
          <path d="M13 19c-3.5 0-6 2-6 4.5S9 28 13 28s7-2 7-5-3-4-7-4Z" />
        </svg>
      );
    case 'fairway-wood':
      return (
        <svg {...svgProps}>
          <path d="M19 5 13.5 19" />
          <path d="M13.5 19c-2.8 0-4.8 1.7-4.8 3.8s1.8 3.7 4.8 3.7 5.6-1.6 5.6-4-2.6-3.5-5.6-3.5Z" />
          <path d="M11 22.5h6" />
        </svg>
      );
    case 'hybrid':
      return (
        <svg {...svgProps}>
          <path d="M18.5 5 14 19" />
          <path d="M14 19c-2.4 0-4.2 1.5-4.2 3.4s1.6 3.3 4.2 3.3 4.9-1.4 4.9-3.5S16.6 19 14 19Z" />
          <path d="M9.8 22.4h8.3" />
        </svg>
      );
    case 'jernsaet':
      return (
        <svg {...svgProps}>
          <path d="M9 4v16.5" />
          <path d="M16 4v16.5" />
          <path d="M23 4v16.5" />
          <path d="M6.5 20.5h5l-1 6h-3Z" />
          <path d="M13.5 20.5h5l-1 6h-3Z" />
          <path d="M20.5 20.5h5l-1 6h-3Z" />
        </svg>
      );
    case 'wedge':
      return (
        <svg {...svgProps}>
          <path d="M17 4 15 20" />
          <path d="M9 20h10l-1.5 7H10Z" />
          <path d="M10.6 22.5h6.6" />
          <path d="M10.3 25h6.3" />
        </svg>
      );
    case 'putter':
      return (
        <svg {...svgProps}>
          <path d="M16 4v18" />
          <rect x="7" y="22" width="18" height="5" rx="1.5" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...svgProps}>
          <path d="M11 9V4" />
          <path d="M15 9V5" />
          <path d="M19 9V4.5" />
          <rect x="8" y="9" width="14" height="19" rx="5" />
          <path d="M8 15h14" />
          <path d="M22 17h3v5h-3" />
        </svg>
      );
    case 'sko':
      return (
        <svg {...svgProps}>
          <path d="M4 22v-8h5l4 3.5 9 1.5c2.6.4 5 1.4 5 3v2Z" />
          <path d="M9 14v3" />
          <path d="M13 17.5 15 15" />
        </svg>
      );
    // Tilbehør: a ball on a tee. The question mark that used to be here said
    // "we do not know what this is", which is not what the category means.
    default:
      return (
        <svg {...svgProps}>
          <circle cx="16" cy="11" r="6" />
          <path d="M13.4 9.2h.01M16 8.2h.01M18.6 9.2h.01M14.4 12h.01M17.6 12h.01" />
          <path d="M13.5 17h5l-2 4.5h-1Z" />
          <path d="M16 21.5V27" />
          <path d="M11 27h10" />
        </svg>
      );
  }
};

export default CategoryIcon;
