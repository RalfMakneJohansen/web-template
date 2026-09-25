// FAIRWAY: our own terms of service, in the page-asset format PageBuilder reads.
//
// The Console page asset for terms-of-service still holds Sharetribe's English
// placeholder, so the page renders this instead. Once the text is final it can
// be moved into Console (Content → Pages → Terms of Service) and this override
// removed.
//
// The rules below describe what the transaction process actually does — the
// 48-hour inspection, the 14-day delivery window with automatic refund, the
// flat 50 kr. freight and the 4.99% buyer fee — so keep them in step with
// ext/transaction-processes/default-purchase/process.edn and
// server/api-util/lineItems.js if either changes.
//
// Fields in [square brackets] are company details that must be filled in
// before launch. This is a working draft, not legal advice: have it reviewed
// by a lawyer before the marketplace goes live.

const TERMS = `
*Senest opdateret: [dato]*

Disse handelsbetingelser gælder for din brug af Fairway, en markedsplads for køb og salg af brugt golfudstyr. Ved at oprette en konto eller handle på Fairway accepterer du betingelserne.

## 1. Om Fairway

Fairway drives af [virksomhedsnavn], CVR-nr. [CVR-nummer], [adresse], [postnummer og by]. Du kan kontakte os på [e-mail].

Fairway er en platform, der forbinder købere og sælgere. Købsaftalen om en vare indgås direkte mellem køber og sælger. Fairway er ikke selv part i købet, men står for betalingen, fragten og køberbeskyttelsen, som beskrevet nedenfor.

## 2. Din konto

- Du skal være fyldt 18 år for at oprette en konto.
- De oplysninger, du giver os, skal være korrekte, og du skal holde dem opdateret.
- Du må kun have én konto, og du er ansvarlig for alt, der sker på den. Hold din adgangskode for dig selv.
- Vi kan suspendere eller lukke en konto, der bruges i strid med betingelserne.

## 3. Når du sælger

- Du må kun sælge udstyr, du selv ejer og har ret til at sælge.
- Annoncen skal beskrive varen ærligt: model, specifikationer, stand og eventuelle fejl eller mangler. Billederne skal vise den konkrete vare.
- Kopivarer, stjålne varer og varer, der ikke er golfudstyr, må ikke sælges.
- Du sætter selv prisen. Når en køber har betalt, er du forpligtet til at sælge varen til den aftalte pris.
- For at modtage penge skal du oprette en udbetalingskonto hos vores betalingspartner Stripe og gennemføre deres identitetskontrol.
- Du vælger, hvordan varen kommer til køber: Du sender den i din egen kasse, du får tilsendt en kasse fra Fairway, eller køber henter den hos dig. Sender du varen, får du en fragtlabel eller QR-kode fra Fairway og afleverer pakken i en pakkeshop. Fragten betales af køber. Vælger du en kasse fra Fairway, koster den 59 kr., som trækkes fra din udbetaling, når varen er solgt.
- Sender du varen, skal du pakke den forsvarligt og sende den hurtigst muligt og senest inden for 14 dage efter købet.
- Ved afhentning aftaler I tid og sted i beskederne på ordren. Betalingen går stadig gennem Fairway.
- Det koster ikke noget at oprette annoncer eller at sælge på Fairway. Den eneste udgift er kassen, hvis du vælger at få en tilsendt.

## 4. Når du køber

- Prisen i annoncen er sælgers pris. Oveni betaler du Fairways gebyr på 4,99 % af varens pris og, når varen sendes, fragt (50 kr.). Ved afhentning er der ingen fragt. Den samlede pris står tydeligt, før du betaler.
- Leveringstiden står i annoncen: normalt 2–3 hverdage, eller 4–6 hverdage hvis sælger først skal have tilsendt en kasse.
- Du kan give et bud på en vare. Et bud er bindende, hvis sælger accepterer det.
- Du betaler med kort via Stripe. Pengene trækkes, når du køber, men de holdes hos Fairway og udbetales først til sælger, når handlen er afsluttet.

## 5. Betaling og køberbeskyttelse

Fairway holder pengene, indtil du har modtaget varen og haft tid til at kontrollere den.

1. **Levering.** Sælger sender varen med forsikret fragt og track & trace. Ved afhentning får du varen udleveret af sælger.
2. **48 timers kontrol.** Når varen er leveret, har du 48 timer til at kontrollere den.
3. **Godkendelse.** Svarer varen til beskrivelsen, godkender du den, og pengene udbetales til sælger. Gør du ikke noget inden for de 48 timer, regnes varen som godkendt.
4. **Problemer.** Svarer varen ikke til beskrivelsen, skal du melde det i ordren inden for de 48 timer. Så bliver pengene hos os, mens sagen behandles.

Hvis varen ikke er leveret senest 14 dage efter købet, annulleres ordren automatisk, og du får hele beløbet retur.

## 6. Hvis varen ikke svarer til beskrivelsen

Meld et problem i ordren inden for de 48 timers kontrol og beskriv det gerne med billeder. Vi gennemgår sagen med køber og sælger.

- Er varen væsentligt anderledes end beskrevet, beskadiget under forsendelse, eller kommer den aldrig frem, får køber pengene retur. Køber kan blive bedt om at sende varen tilbage.
- Svarer varen til beskrivelsen, udbetales pengene til sælger.
- Er en sag ikke afgjort inden for 60 dage, annulleres ordren, og køber får pengene retur.

Fairways afgørelse i en sag er endelig i forhold til udbetalingen, men påvirker ikke dine rettigheder efter lovgivningen.

## 7. Fortrydelsesret

Når du køber af en privat sælger, gælder forbrugeraftalelovens 14 dages fortrydelsesret ikke, fordi sælger ikke er en erhvervsdrivende. I stedet har du Fairways køberbeskyttelse med 48 timers kontrol, som beskrevet ovenfor.

Sælger en erhvervsdrivende på Fairway, skal det fremgå af annoncen, og så gælder de almindelige regler om fortrydelsesret og reklamation over for den sælger.

## 8. Handel skal ske på Fairway

Betaling skal altid ske gennem Fairway. Aftaler I at betale uden om platformen, fx med MobilePay eller bankoverførsel, er handlen ikke omfattet af køberbeskyttelsen, og vi kan lukke kontoen. Del ikke kontaktoplysninger for at komme uden om betalingen.

## 9. Anmeldelser og beskeder

Anmeldelser skal være ærlige og handle om den konkrete handel. Beskeder skal være saglige. Vi kan fjerne indhold, der er vildledende, krænkende eller ulovligt.

## 10. Fairways ansvar

Fairway står inde for betalingen og køberbeskyttelsen som beskrevet i disse betingelser. Vi er ikke ansvarlige for varens stand eller for, at oplysningerne i en annonce er rigtige — det er sælgers ansvar. Vi er ikke ansvarlige for indirekte tab, og vores samlede ansvar over for dig i forbindelse med en handel kan ikke overstige det beløb, der blev betalt i den handel. Det gælder ikke, hvis vi har handlet groft uagtsomt eller med forsæt.

## 11. Ændringer

Vi kan ændre betingelserne. Væsentlige ændringer får du besked om på e-mail, før de træder i kraft. De betingelser, der gjaldt, da du købte eller satte en vare til salg, gælder for den handel.

## 12. Opsigelse

Du kan til enhver tid lukke din konto under kontoindstillinger. Igangværende handler skal gøres færdige først.

## 13. Lovvalg og klager

Betingelserne følger dansk ret. Har du en klage over Fairway, så skriv til os på [e-mail], så finder vi en løsning. Som forbruger kan du også klage til Nævnenes Hus, Toldboden 2, 8800 Viborg, via forbrug.dk, eller bruge EU-Kommissionens klageportal på ec.europa.eu/odr.
`;

export const fairwayTermsSections = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'terms',
      appearance: { fieldType: 'customAppearance', backgroundColor: '#ffffff' },
      title: { fieldType: 'heading1', content: 'Handelsbetingelser' },
      blocks: [
        {
          blockType: 'defaultBlock',
          blockId: 'terms-content',
          text: {
            fieldType: 'markdown',
            content: TERMS,
          },
        },
      ],
    },
  ],
  meta: {
    pageTitle: {
      fieldType: 'metaTitle',
      content: 'Handelsbetingelser | Fairway',
    },
    pageDescription: {
      fieldType: 'metaDescription',
      content:
        'Handelsbetingelser for Fairway: køb og salg af brugt golfudstyr med køberbeskyttelse, 48 timers kontrol og forsikret fragt.',
    },
  },
};
