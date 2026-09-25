import React, { useState } from 'react';

import css from './LandingPage.module.css';

/**
 * The two ways a seller can ship: we send a box, or they use their own.
 *
 * Each option is three short lines. The point is the choice, not the prose —
 * the full terms live on the shipping page.
 *
 * Option ids match the shipment_type values on the listing.
 */
const OPTIONS = [
  {
    id: 'box',
    tab: 'Jeg mangler en kasse',
    items: ['Kasse i den rigtige størrelse, 59 kr.', 'Label eller QR-kode, porto betalt', 'Aflever i pakkeshoppen'],
  },
  {
    id: 'own',
    tab: 'Jeg har selv en kasse',
    items: ['Brug den kasse, du har', 'Label eller QR-kode, porto betalt', 'Aflever i pakkeshoppen'],
  },
];

const ShippingChoice = () => {
  const [activeId, setActiveId] = useState(OPTIONS[0].id);
  const active = OPTIONS.find(option => option.id === activeId);

  return (
    <div className={css.choice}>
      <div className={css.choiceTabs} role="tablist" aria-label="Har du en kasse?">
        {OPTIONS.map(option => {
          const isActive = option.id === activeId;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`shipping-tab-${option.id}`}
              aria-selected={isActive}
              aria-controls={`shipping-panel-${option.id}`}
              className={isActive ? `${css.choiceTab} ${css.choiceTabOn}` : css.choiceTab}
              onClick={() => setActiveId(option.id)}
            >
              {option.tab}
            </button>
          );
        })}
      </div>

      <ul
        className={css.choiceList}
        role="tabpanel"
        id={`shipping-panel-${active.id}`}
        aria-labelledby={`shipping-tab-${active.id}`}
      >
        {active.items.map(item => (
          <li key={item} className={css.choiceItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShippingChoice;
