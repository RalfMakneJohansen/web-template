/**
 * Danish content for the info pages the footer links to.
 *
 * These render only when Console has no hosted page for the same slug, so an
 * operator can take a page over in Console at any time without changing URLs.
 *
 * Block types: 'paragraph', 'list' (items), 'steps' (items), 'faq' (items with q/a).
 */
const localPages = {
  'saadan-fungerer-det': {
    title: 'Sådan fungerer det',
    intro:
      'Fairway er en markedsplads, hvor golfspillere handler brugt udstyr direkte med hinanden. Vi står for betaling, fragt og tryghed — I står for udstyret.',
    sections: [
      {
        heading: 'Når du sælger',
        type: 'steps',
        items: [
          'Opret din annonce med billeder, stand og pris. Det tager få minutter.',
          'Vælg, hvordan varen skal til køber: i din egen kasse, i en kasse vi sender dig for 59 kr., eller ved afhentning.',
          'Når en køber har betalt, sender vi dig en fragtlabel eller QR-kode (og kassen, hvis du har valgt den).',
          'Pak udstyret, sæt labelen på, og aflever pakken i en pakkeshop.',
          'Når køber har godkendt varen, udbetales din pris til dig, minus 59 kr., hvis du fik en kasse fra os.',
        ],
      },
      {
        heading: 'Når du køber',
        type: 'steps',
        items: [
          'Find udstyret, og betal på siden. Pengene går ikke direkte til sælger.',
          'Sælger pakker og sender, og du følger pakken med track & trace. Leveringstiden står i annoncen.',
          'Du har 48 timer til at tjekke, at varen svarer til beskrivelsen.',
          'Godkender du, frigives betalingen. Er der noget galt, gør du indsigelse.',
        ],
      },
      {
        heading: 'Hvad koster det?',
        type: 'paragraph',
        text:
          'Som sælger betaler du ingen annoncegebyr, ingen kommission og ingen fragt. Vil du have en kasse fra os, koster den 59 kr., som trækkes fra salget. Køber betaler varens pris, et gebyr på 4,99 % og 50 kr. for fragten, når varen sendes.',
      },
    ],
  },

  tryghed: {
    title: 'Tryghed og escrow',
    intro:
      'Den største risiko ved at handle brugt udstyr privat er, at én af parterne ikke leverer. Det problem fjerner vi ved at holde betalingen, indtil begge parter har gjort deres.',
    sections: [
      {
        heading: 'Hvad betyder escrow?',
        type: 'paragraph',
        text:
          'Escrow betyder, at pengene opbevares sikkert hos en tredjepart undervejs i handlen. Når køber betaler, går pengene ikke videre til sælger med det samme — de holdes, indtil varen er modtaget og godkendt.',
      },
      {
        heading: 'Det beskytter begge parter',
        type: 'list',
        items: [
          'Som køber risikerer du ikke at betale for noget, der aldrig dukker op.',
          'Som sælger risikerer du ikke at sende udstyr uden at få pengene.',
          'Fragten er forsikret, så en pakke der bliver væk, ikke bliver dit tab.',
        ],
      },
      {
        heading: '48 timers inspektion',
        type: 'paragraph',
        text:
          'Når pakken er leveret, har køber 48 timer til at tjekke udstyret. Passer det med beskrivelsen, godkendes handlen — enten aktivt eller automatisk, når fristen udløber. Er der fejl eller afvigelser, kan køber gøre indsigelse inden for de 48 timer, og så går sagen ikke videre, før den er afklaret.',
      },
    ],
  },

  forsendelse: {
    title: 'Fragt og forsendelseskasse',
    intro:
      'Når dit udstyr er solgt, sender vi dig en betalt fragtlabel eller QR-kode, og du afleverer pakken i en pakkeshop. Har du ikke en kasse, der passer, sender vi en.',
    sections: [
      {
        heading: 'Sådan foregår det',
        type: 'steps',
        items: [
          'Dit udstyr bliver solgt, og køber betaler.',
          'Vi sender en fragtlabel eller QR-kode til din e-mail, og har du valgt en kasse, kommer den fladpakket med posten.',
          'Du pakker udstyret og sætter labelen på, eller tager QR-koden med.',
          'Du afleverer pakken på nærmeste pakkeshop.',
        ],
      },
      {
        heading: 'Hvad koster kassen?',
        type: 'paragraph',
        text:
          'Kassen koster 59 kr. og trækkes fra salget, så du betaler intet på forhånd. Pakker du i din egen kasse, eller sælger du til afhentning, koster det dig ingenting. Du vælger, når du opretter annoncen.',
      },
      {
        heading: 'Leveringstid',
        type: 'paragraph',
        text:
          'Pakker du selv, er varen normalt hos køber på 2–3 hverdage. Vælger du en kasse fra os, skal den først ud til dig, så køber må regne med 4–6 hverdage. Det står i annoncen, så køber ved det på forhånd.',
      },
    ],
  },

  'saadan-pakker-du': {
    title: 'Sådan pakker du udstyret',
    intro:
      'God pakning betyder, at udstyret kommer frem i samme stand, som da det forlod dig — og at handlen bliver godkendt uden diskussion.',
    sections: [
      {
        heading: 'Køller',
        type: 'list',
        items: [
          'Sæt headcover på, eller vikl køllehovedet ind i bobleplast.',
          'Beskyt skaftet i hele længden — det er der, skader oftest sker.',
          'Pak flere køller samlet, så de ikke kan bevæge sig mod hinanden.',
          'Fyld tomrum i kassen ud, så intet rykker sig under transport.',
        ],
      },
      {
        heading: 'Bags',
        type: 'list',
        items: [
          'Tøm alle lommer — også for bolde, tees og værktøj.',
          'Spænd remme fast, så de ikke hænger løst.',
          'Læg eventuelt et stykke pap i bunden som støtte.',
        ],
      },
      {
        heading: 'Sko og tilbehør',
        type: 'list',
        items: [
          'Stop papir i skoene, så de holder faconen.',
          'Pak elektronik i den originale emballage, hvis du har den.',
        ],
      },
      {
        heading: 'Før du lukker kassen',
        type: 'paragraph',
        text:
          'Tag et par billeder af det pakkede udstyr. Det er den hurtigste dokumentation, hvis der senere skulle opstå tvivl om, hvordan varen så ud ved afsendelse.',
      },
    ],
  },

  faq: {
    title: 'Ofte stillede spørgsmål',
    intro: 'Kan du ikke finde svaret her, er du velkommen til at skrive til os.',
    sections: [
      {
        type: 'faq',
        items: [
          {
            q: 'Hvad koster det at sælge?',
            a:
              'Det er gratis at oprette annoncer og at sælge. Køber betaler et gebyr på 4,99 % og fragten. Den eneste udgift for dig er kassen, hvis du vil have en fra os: 59 kr., trukket fra salget.',
          },
          {
            q: 'Hvornår får jeg pengene som sælger?',
            a:
              'Når køber har godkendt varen — eller senest når de 48 timers inspektionsfrist er udløbet uden indsigelse.',
          },
          {
            q: 'Hvad hvis varen ikke svarer til beskrivelsen?',
            a:
              'Så gør du indsigelse inden for 48 timer efter levering. Pengene bliver ikke frigivet, før sagen er afklaret.',
          },
          {
            q: 'Kan jeg sælge til afhentning i stedet for fragt?',
            a:
              'Ja. Vælg "Afhentning", når du opretter annoncen. Køber betaler stadig gennem Fairway, I aftaler tid og sted i beskederne på ordren, og pengene udbetales, når køber bekræfter, at varen er hentet.',
          },
          {
            q: 'Hvor lang tid tager levering?',
            a:
              'Det står i annoncen. Pakker sælger selv, er varen normalt fremme på 2–3 hverdage. Får sælger en kasse fra os først, må du regne med 4–6 hverdage. Kommer varen ikke frem inden 14 dage, får du hele beløbet retur.',
          },
          {
            q: 'Hvad koster det at købe?',
            a:
              'Du betaler varens pris, et gebyr på 4,99 % og 50 kr. i fragt, når varen sendes. Den samlede pris står tydeligt, før du betaler.',
          },
          {
            q: 'Skal jeg selv skaffe en kasse?',
            a:
              'Nej. Når du opretter annoncen, kan du vælge, at vi sender dig en kasse i den rigtige størrelse sammen med fragtlabelen. Den koster 59 kr., som trækkes fra salget. Pakker du i din egen, sender vi kun labelen eller QR-koden, og det er gratis.',
          },
          {
            q: 'Hvilket udstyr må jeg sælge?',
            a:
              'Alt golfrelateret: køller, bags, sko, tøj og tilbehør. Beskriv altid stand og eventuelle fejl ærligt — det er dét, der gør, at handlen går igennem uden problemer.',
          },
          {
            q: 'Hvordan sætter jeg den rigtige pris?',
            a:
              'Kig på tilsvarende annoncer på Fairway. Alder, stand og efterspørgsel betyder mest — og en ærlig beskrivelse af brugsspor giver hurtigere salg end en for høj pris.',
          },
        ],
      },
    ],
  },

  kontakt: {
    title: 'Kontakt',
    intro: 'Vi svarer så hurtigt vi kan på hverdage.',
    sections: [
      {
        heading: 'Skriv til os',
        type: 'paragraph',
        text:
          'Har du et spørgsmål om en handel, en forsendelse eller din konto, så skriv til os — så vender vi tilbage.',
      },
      {
        heading: 'Handler det om en igangværende handel?',
        type: 'paragraph',
        text:
          'Skriv til den anden part i beskederne på ordren, under Indbakke. Er der noget galt med varen, så meld et problem på ordren inden for 48 timer efter levering, så holder vi pengene tilbage, mens vi hjælper jer.',
      },
    ],
  },
};

export default localPages;
