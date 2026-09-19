import React from 'react';
import classNames from 'classnames';

import css from './SectionWave.module.css';

/**
 * FAIRWAY: the curved edge between two sections.
 *
 * One path, used at every boundary on the site, so the whole thing is cut by
 * the same line. The wave is drawn *inside* the section it belongs to and
 * filled with the colour of the neighbouring surface: at the bottom it lets the
 * next section rise into this one, at the top it lets the previous one come
 * down.
 *
 * The section it sits in must be `position: relative`.
 *
 * @param {'top'|'bottom'} [position='bottom'] which edge to cut
 * @param {string} [fill] CSS colour of the *neighbouring* surface; defaults to
 *   the light page background
 * @param {string} [className]
 */
const PATH = 'M0 30 C 220 2, 420 46, 720 26 S 1240 0, 1440 22 L1440 48 L0 48 Z';

const SectionWave = props => {
  const { position = 'bottom', fill, className } = props;
  const positionClass = position === 'top' ? css.waveTop : css.waveBottom;

  return (
    <svg
      className={classNames(css.wave, positionClass, className)}
      style={fill ? { fill } : undefined}
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden={true}
      focusable="false"
    >
      <path d={PATH} />
    </svg>
  );
};

export default SectionWave;
