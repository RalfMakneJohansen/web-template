/**
 * Danish content for the info pages the footer links to.
 *
 * These render only when Console has no hosted page for the same slug, so an
 * operator can take a page over in Console at any time without changing URLs.
 *
 * Block types: 'paragraph', 'list' (items), 'steps' (items),
 * 'promises' (items with title/text), 'faq' (items with q/a).
 *
 * Voice: short sentences, "du" and "vi", golf words over marketplace words.
 * Say it once; if a sentence could sit on any website, cut it.
 */
const localPages = {
  'saadan-fungerer-det': {
    title: 'Sådan fungerer det',
    intro:
      'Du betaler. Vi holder på pengene. Sælger får dem først, når du har haft udstyret i hænderne og er tilfreds.',
    sections: [
      {
        heading: 'Når du køber',
        type: 'steps',
        items: [
          'Find det, du leder efter, og betal med kort.',
          'Sælger sender. Du følger pakken på din ordre.',
          'Når den er fremme, har du 48 timer til at se den efter.',
          'Er alt i orden, trykker du godkend. Så får sælger pengene.',
        ],
      },
      {
        heading: 'Det får du som køber',
        type: 'promises',
        items: [
          {
            title: '48 timer',
            text:
              'Tag køllen i hånden, kig på sålen og greb. Er den ikke som beskrevet, siger du til.',
          },
          {
            title: 'Pengene venter hos os',
            text: 'Sælger ser ikke en krone, før du har godkendt.',
          },
          {
            title: 'Kommer den ikke?',
            text: 'Så får du alle pengene tilbage efter 14 dage.',
          },
          {
            title: 'Track & trace',
            text: 'Står på din ordre, så du ikke skal spørge sælger, hvor pakken er.',
          },
        ],
      },
      {
        heading: 'Når du sælger',
        type: 'steps',
        items: [
          'Tag et par gode billeder, skriv standen ærligt, sæt en pris.',
          'Når den er solgt, får du en fragtlabel på mail.',
          'Pak den, og aflever den i en pakkeshop.',
          'Når køber har godkendt, går pengene til din konto.',
        ],
      },
      {
        heading: 'Det får du som sælger',
        type: 'promises',
        items: [
          {
            title: 'Betalt på forhånd',
            text: 'Du sender aldrig noget, før køber har betalt.',
          },
          {
            title: 'Gratis',
            text: 'Det koster ikke noget at sælge. Mangler du en kasse, sender vi en for 59 kr.',
          },
        ],
      },
    ],
  },

  tryghed: {
    title: 'Tryghed og escrow',
    intro:
      'Det værste ved at handle brugt er at betale en fremmed og håbe på det bedste. Det slipper du for her.',
    sections: [
      {
        heading: 'Hvad er escrow?',
        type: 'paragraph',
        text:
          'Et fint ord for, at vi holder på pengene undervejs. Køber betaler til os, ikke til sælger. Pengene bliver hos os, til varen er fremme og godkendt.',
      },
      {
        heading: 'Hvad betyder det for dig?',
        type: 'list',
        items: [
          'Køber du, betaler du ikke for noget, der aldrig kommer.',
          'Sælger du, sender du ikke noget, før det er betalt.',
        ],
      },
      {
        heading: 'De 48 timer',
        type: 'paragraph',
        text:
          'Når pakken er leveret, har køber 48 timer til at se udstyret efter. Er det fint, godkender køber, eller også sker det af sig selv, når tiden er gået. Er der noget galt, melder køber det, og så sidder pengene fast hos os, til vi har fundet en løsning.',
      },
    ],
  },

  forsendelse: {
    title: 'Fragt og forsendelseskasse',
    intro:
      'Når dit udstyr er solgt, får du en fragtlabel på mail. Har du ikke en kasse, der passer, sender vi en.',
    sections: [
      {
        heading: 'Sådan gør du',
        type: 'steps',
        items: [
          'Varen bliver solgt, og du får en fragtlabel eller QR-kode på mail.',
          'Pak udstyret. Har du bestilt en kasse, kommer den med posten først.',
          'Sæt labelen på, eller vis QR-koden i pakkeshoppen.',
          'Aflever pakken. Det var det.',
        ],
      },
      {
        heading: 'Kassen',
        type: 'paragraph',
        text:
          'Den er lang nok til en driver og koster 59 kr., som vi trækker fra salget. Du betaler altså ikke noget på forhånd. Har du selv en kasse, koster fragten dig ingenting.',
      },
      {
        heading: 'Hvor lang tid tager det?',
        type: 'paragraph',
        text:
          'Pakker du i din egen kasse, er varen typisk hos køber på 2–3 hverdage. Med en kasse fra os skal den først ud til dig, så regn med 4–6.',
      },
    ],
  },

  'saadan-pakker-du': {
    title: 'Sådan pakker du udstyret',
    intro: 'Pak det, som hvis det var dit eget, der skulle sendes. Det var det jo også.',
    sections: [
      {
        heading: 'Køller',
        type: 'list',
        items: [
          'Headcover på, eller bobleplast om hovedet.',
          'Pas på skaftet hele vejen ned. Det er der, de knækker.',
          'Flere køller? Tape dem sammen, så de ikke slår mod hinanden.',
          'Fyld hullerne i kassen ud med avis eller pap.',
        ],
      },
      {
        heading: 'Bags',
        type: 'list',
        items: [
          'Tøm lommerne. Også for tees og gamle scorekort.',
          'Spænd remmene, så de ikke hænger og flagrer.',
        ],
      },
      {
        heading: 'Sko og tilbehør',
        type: 'list',
        items: [
          'Avis i skoene, så de holder formen.',
          'Afstandsmåler og ure i den originale æske, hvis du har den.',
        ],
      },
      {
        heading: 'Et godt råd',
        type: 'paragraph',
        text:
          'Tag et billede af udstyret i kassen, før du lukker den. Hvis der bliver tvivl bagefter, er det guld værd.',
      },
    ],
  },

  faq: {
    title: 'Spørgsmål og svar',
    intro: 'Kan du ikke finde svaret, så skriv til os.',
    sections: [
      {
        heading: 'Når du køber',
        type: 'faq',
        items: [
          {
            q: 'Er jeg sikret, hvis noget går galt?',
            a:
              'Ja. Pengene ligger hos os, ikke hos sælger. Sælger får dem først, når du har haft varen i 48 timer eller har godkendt den.',
          },
          {
            q: 'Hvad hvis den ikke er som beskrevet?',
            a:
              'Meld det på ordren inden for 48 timer. Så bliver pengene hos os, mens vi finder ud af det.',
          },
          {
            q: 'Hvad hvis den aldrig kommer?',
            a: 'Er den ikke leveret efter 14 dage, får du alle pengene tilbage.',
          },
          {
            q: 'Hvor lang tid tager levering?',
            a:
              'Det står i annoncen. Typisk 2–3 hverdage, eller 4–6 hvis sælger først skal have en kasse.',
          },
          {
            q: 'Hvad koster det?',
            a:
              'Du ser den samlede pris med fragt, før du betaler. Henter du selv, er der ingen fragt.',
          },
          {
            q: 'Kan jeg betale med MobilePay?',
            a:
              'Nej, kun med kort her på siden. Beder sælger dig betale på MobilePay eller overførsel, så lad være. Så er du ikke dækket.',
          },
        ],
      },
      {
        heading: 'Når du sælger',
        type: 'faq',
        items: [
          {
            q: 'Hvad koster det at sælge?',
            a:
              'Ingenting. Kun hvis du vil have en kasse fra os, koster den 59 kr., som vi trækker fra salget.',
          },
          {
            q: 'Hvornår får jeg pengene?',
            a:
              'Når køber har godkendt, eller 48 timer efter levering. Så sender Stripe dem til din konto.',
          },
          {
            q: 'Skal jeg selv finde en kasse?',
            a: 'Hvis du har en, så ja. Ellers sender vi en, der passer, også til en driver.',
          },
          {
            q: 'Kan køber hente den i stedet?',
            a:
              'Ja. Vælg "Afhentning" på annoncen. Køber betaler stadig her, og I aftaler tid og sted i beskederne.',
          },
          {
            q: 'Hvad må jeg sælge?',
            a:
              'Alt til golf: køller, bags, sko, tøj og tilbehør. Skriv ærligt om brugsspor. Det sparer jer begge for bøvl.',
          },
          {
            q: 'Hvad skal jeg tage for den?',
            a:
              'Kig på lignende annoncer. En fair pris og ærlige billeder sælger hurtigere end en høj pris.',
          },
        ],
      },
    ],
  },

  kontakt: {
    title: 'Kontakt',
    intro: 'Vi svarer så hurtigt, vi kan, på hverdage.',
    sections: [
      {
        heading: 'Skriv til os',
        type: 'paragraph',
        text: 'Spørgsmål om en handel, en pakke eller din konto? Skriv, så hjælper vi.',
      },
      {
        heading: 'Er det en igangværende handel?',
        type: 'paragraph',
        text:
          'Skriv først til den anden part i beskederne på ordren. Er der noget galt med varen, så meld det på ordren inden 48 timer efter levering. Så holder vi pengene, mens vi hjælper jer.',
      },
    ],
  },
};

export default localPages;
