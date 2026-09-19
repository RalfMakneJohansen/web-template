import React from 'react';

import hero1 from '../../assets/hero/hero-1.jpg';
import hero2 from '../../assets/hero/hero-2.jpg';
import hero3 from '../../assets/hero/hero-3.jpg';
import hero4 from '../../assets/hero/hero-4.jpg';

import css from './LandingPage.module.css';

const PANELS = [hero1, hero2, hero3, hero4];

/**
 * Angled photo panels beside the hero headline. Each panel is skewed and the
 * image inside is counter-skewed, so the photos stay undistorted.
 */
const HeroCollage = () => (
  <div className={css.collage} aria-hidden={true}>
    {PANELS.map((src, index) => (
      <div key={src} className={css.collagePanel}>
        <img className={css.collageImage} src={src} alt="" loading={index > 1 ? 'lazy' : 'eager'} />
      </div>
    ))}
    <span className={css.collageScrim} />
  </div>
);

export default HeroCollage;
