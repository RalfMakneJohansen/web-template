import React from 'react';

import css from './LandingPage.module.css';

/**
 * The curved edge between a dark section and the light page.
 *
 * One path, used at every boundary, so the whole page is cut by the same line.
 * The fill is the light surface, and the wave is drawn *inside* the dark
 * section — at the bottom it lets the light page rise into it, at the top it
 * lets the light page come down.
 *
 * @param {'top'|'bottom'} position which edge of the dark section to cut
 */
const PATH = 'M0 30 C 220 2, 420 46, 720 26 S 1240 0, 1440 22 L1440 48 L0 48 Z';

const SectionWave = props => {
  const { position = 'bottom' } = props;
  const positionClass = position === 'top' ? css.waveTop : css.waveBottom;

  return (
    <svg
      className={`${css.wave} ${positionClass}`}
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
