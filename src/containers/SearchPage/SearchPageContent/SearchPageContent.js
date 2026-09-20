import React from 'react';

import { useConfiguration } from '../../../context/configurationContext';

import css from './SearchPageContent.module.css';

/**
 * FAIRWAY: what stands under the results.
 *
 * The page used to stop dead after the last card — on a category with two
 * listings that is a screen of nothing above the footer. Retailers put the
 * answers and the category copy there instead, and it does three things at
 * once: it fills the page honestly, it answers what a buyer is about to ask,
 * and it is the text search engines read when someone looks for "brugt driver".
 *
 * The copy is per category where we have something specific to say, and falls
 * back to the general case. Nothing here claims stock or activity we do not
 * have.
 */
const GENERAL = {
  title: 'Brugt golfudstyr, uden risikoen',
  body: [
    'Fairway er markedspladsen for brugt golfudstyr i Danmark. Du handler med andre golfspillere, men aldrig direkte: pengene står hos os, indtil køberen har fået varen og sagt god for den.',
    'Sælger du, sender vi kassen og fragtlabelen. Køber du, har du 48 timer til at tjekke, at udstyret er som beskrevet — passer det ikke, går pengene retur.',
  ],
};

const PER_CATEGORY = {
  driver: {
    title: 'Brugte drivere',
    body: [
      'En driver er den kølle, der taber mest i værdi det første år, og den der ændrer sig mindst. Derfor er brugt sjældent et kompromis — det er den samme kølle et par sæsoner senere.',
      'Kig efter loft og flex først. Loftet afgør boldflugten, flex afgør om skaftet passer til din sving. Begge dele står i annoncens titel, så du kan sammenligne uden at åbne dem.',
    ],
  },
  jernsaet: {
    title: 'Brugte jernsæt',
    body: [
      'Et jernsæt er den dyreste post i bagen, og det er også der brugtkøb giver mest. Tjek hvilke jern der er med i sættet, og hvad skaftet er lavet af.',
      'Stål er tungere og mere stabilt, grafit er lettere og skånsommere. Sælgeren angiver begge dele, når det er oplyst.',
    ],
  },
  putter: {
    title: 'Brugte puttere',
    body: [
      'En putter slides næsten ikke, og den er personlig — derfor skifter mange den ud, længe før den er brugt op. Det er godt nyt, hvis du køber den næste.',
      'Længden betyder mest for, om den passer: den står i titlen sammen med modellen. Blade eller mallet er smag og stilart, ikke kvalitet.',
    ],
  },
  wedge: {
    title: 'Brugte wedges',
    body: [
      'Wedges er den kølle, der slides hurtigst, fordi rillerne rammer sand og græs hver runde. Kig på stand og loft — en velholdt wedge med skarpe riller er mere værd end en nyere med slidt slagflade.',
      'Loftet står i titlen, så du kan samle et sæt op uden at gætte.',
    ],
  },
  sko: {
    title: 'Brugte golfsko',
    body: [
      'Golfsko bliver ofte købt i den forkerte størrelse og næsten ikke brugt. Størrelsen står i annoncens titel, og stand fortæller resten.',
    ],
  },
};

const SearchPageContent = props => {
  const { categoryId } = props;
  const config = useConfiguration();

  const copy = PER_CATEGORY[categoryId] || GENERAL;
  const categoryName = config.categoryConfiguration?.categories?.find(c => c.id === categoryId)
    ?.name;

  return (
    <section className={css.root}>
      <div className={css.inner}>
        <h2 className={css.title}>{copy.title}</h2>
        {copy.body.map(paragraph => (
          <p key={paragraph.slice(0, 24)} className={css.paragraph}>
            {paragraph}
          </p>
        ))}

        <h3 className={css.faqTitle}>
          {categoryName ? `Spørgsmål om brugte ${categoryName.toLowerCase()}` : 'Spørgsmål og svar'}
        </h3>

        <div className={css.faq}>
          {[
            {
              q: 'Hvordan ved jeg, at udstyret er som beskrevet?',
              a:
                'Du har 48 timer fra levering til at tjekke det. Passer det ikke til annoncen, stopper vi udbetalingen til sælger, og du får dine penge tilbage.',
            },
            {
              q: 'Hvad koster fragten?',
              a:
                '50 kr. pr. handel, uanset om det er en putter eller et helt jernsæt. Beløbet står i oversigten, inden du trykker køb.',
            },
            {
              q: 'Kan jeg give et bud?',
              a:
                'Ja. På hver annonce kan du enten købe til prisen, give et bud eller skrive til sælgeren først.',
            },
            {
              q: 'Hvad koster det at sælge?',
              a:
                'Det er gratis at oprette en annonce, og du får en kasse tilsendt, når varen er solgt.',
            },
          ].map(item => (
            <details key={item.q} className={css.item}>
              <summary className={css.question}>
                {item.q}
                <span className={css.mark} aria-hidden={true} />
              </summary>
              <p className={css.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchPageContent;
