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
      'Fairway er markedspladsen for brugt golfudstyr, hvor både køber og sælger er beskyttet. Pengene står sikkert hos os, til køber har haft udstyret i hænderne og sagt god for det.',
    sections: [
      {
        heading: 'Når du køber',
        type: 'steps',
        items: [
          'Find udstyret, og betal på siden med kort. Pengene går ikke til sælger, men står sikkert hos Fairway.',
          'Sælger sender varen, og du følger pakken med track & trace direkte på din ordre.',
          'Når pakken er leveret, har du 48 timer til at tjekke, at udstyret svarer til beskrivelsen.',
          'Er alt i orden, godkender du, og først da får sælger pengene. Er der noget galt, melder du det, og pengene bliver hos os, mens vi finder en løsning.',
        ],
      },
      {
        heading: 'Din tryghed som køber',
        type: 'promises',
        items: [
          {
            title: '48 timers tjek',
            text:
              'Du ser og prøver udstyret, før handlen er endelig. Passer det ikke med beskrivelsen, siger du fra.',
          },
          {
            title: 'Pengene står sikkert',
            text: 'Sælger får ikke en krone, før du har modtaget varen og godkendt den.',
          },
          {
            title: 'Pengene retur',
            text: 'Kommer varen ikke frem inden for 14 dage, får du hele beløbet tilbage.',
          },
          {
            title: 'Følg pakken',
            text: 'Track & trace står på din ordre, så du ved, hvor udstyret er hele vejen.',
          },
        ],
      },
      {
        heading: 'Når du sælger',
        type: 'steps',
        items: [
          'Opret din annonce med billeder, stand og pris. Det tager få minutter.',
          'Vælg, hvordan varen skal til køber: i din egen kasse, i en kasse vi sender dig, eller ved afhentning.',
          'Når en køber har betalt, sender vi dig en fragtlabel eller QR-kode.',
          'Pak udstyret, og aflever pakken i en pakkeshop.',
          'Når køber har godkendt varen, sender vi pengene til din bankkonto.',
        ],
      },
      {
        heading: 'Din tryghed som sælger',
        type: 'promises',
        items: [
          {
            title: 'Betalt, før du sender',
            text:
              'Køber har betalt, før du får besked om at sende. Du sender aldrig udstyr uden dækning.',
          },
          {
            title: 'Gratis at sælge',
            text: 'Ingen annoncegebyr og ingen kommission. Fragtlabelen er betalt.',
          },
        ],
      },
      {
        heading: 'Hvad med prisen?',
        type: 'paragraph',
        text:
          'Du ser altid den samlede pris med fragt og køberbeskyttelse, før du betaler, så der ingen overraskelser er bagefter. Som sælger koster det kun noget, hvis du vil have en kasse fra os. Alle priser står i handelsbetingelserne.',
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
        heading: 'Når du køber',
        type: 'faq',
        items: [
          {
            q: 'Hvordan er jeg beskyttet som køber?',
            a:
              'Pengene går ikke til sælger, når du betaler. De står sikkert hos Fairway, til du har modtaget varen og haft 48 timer til at tjekke den. Først når du godkender, eller de 48 timer er gået uden indsigelse, får sælger pengene.',
          },
          {
            q: 'Hvad hvis varen ikke svarer til beskrivelsen?',
            a:
              'Så melder du et problem på ordren inden for 48 timer efter levering. Pengene bliver hos os, mens vi hjælper jer med at finde en løsning.',
          },
          {
            q: 'Hvad hvis varen aldrig kommer?',
            a:
              'Er varen ikke leveret inden for 14 dage, bliver handlen annulleret, og du får hele beløbet tilbage. Du kan hele vejen følge pakken med track & trace på din ordre.',
          },
          {
            q: 'Hvor lang tid tager levering?',
            a:
              'Det står i annoncen. Normalt er varen fremme på 2–3 hverdage. Skal sælger først have tilsendt en kasse fra os, må du regne med 4–6 hverdage.',
          },
          {
            q: 'Hvad koster det at købe?',
            a:
              'Du ser den samlede pris med fragt og køberbeskyttelse, før du betaler, så der kommer ingen overraskelser bagefter. Henter du selv varen, er der ingen fragt.',
          },
          {
            q: 'Hvordan betaler jeg?',
            a:
              'Med kort, direkte på siden. Betalingen håndteres af Stripe, så vi ser aldrig dine kortoplysninger. Betal aldrig med MobilePay eller bankoverførsel uden om Fairway, for så er du ikke beskyttet.',
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
              'Det er gratis at oprette annoncer og at sælge, og fragtlabelen er betalt. Den eneste udgift er kassen, hvis du vil have en fra os: 59 kr., trukket fra salget.',
          },
          {
            q: 'Hvornår får jeg pengene?',
            a:
              'Når køber har godkendt varen, eller senest når de 48 timers tjek er gået uden indsigelse. Så sender Stripe pengene til din bankkonto.',
          },
          {
            q: 'Skal jeg selv skaffe en kasse?',
            a:
              'Nej. Når du opretter annoncen, kan du vælge, at vi sender dig en kasse i den rigtige størrelse sammen med fragtlabelen. Den koster 59 kr., som trækkes fra salget. Pakker du i din egen, sender vi kun labelen eller QR-koden, og det er gratis.',
          },
          {
            q: 'Kan jeg sælge til afhentning i stedet for fragt?',
            a:
              'Ja. Vælg "Afhentning", når du opretter annoncen. Køber betaler stadig gennem Fairway, I aftaler tid og sted i beskederne på ordren, og pengene udbetales, når køber bekræfter, at varen er hentet.',
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
