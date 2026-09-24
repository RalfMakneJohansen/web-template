// FAIRWAY: our own privacy policy, in the page-asset format PageBuilder reads.
//
// The Console page asset for privacy-policy still holds Sharetribe's English
// placeholder, so the page renders this instead. Once the text is final it can
// be moved into Console (Content → Pages → Privacy Policy) and this override
// removed.
//
// Fields in [square brackets] must be filled in before launch. If analytics
// or marketing cookies are added later, section 7 must say so. This is a
// working draft, not legal advice: have it reviewed before going live.

const PRIVACY = `
*Senest opdateret: [dato]*

Her kan du læse, hvilke oplysninger Fairway behandler om dig, hvorfor vi gør det, og hvilke rettigheder du har.

## 1. Dataansvarlig

[Virksomhedsnavn], CVR-nr. [CVR-nummer], [adresse], [postnummer og by], er dataansvarlig for behandlingen af dine personoplysninger på Fairway. Du kan kontakte os om persondata på [e-mail].

## 2. Hvilke oplysninger vi behandler

- **Konto:** navn, e-mail, adgangskode (krypteret), telefonnummer, hvis du oplyser det, profilbillede og profiltekst.
- **Annoncer:** billeder, beskrivelser og priser på det udstyr, du sætter til salg.
- **Handler:** hvad du har købt eller solgt, beløb, ordrestatus og anmeldelser.
- **Levering:** navn og adresse, der skal bruges til at sende varen.
- **Beskeder:** det, du skriver til andre brugere på Fairway.
- **Betaling:** kortbetalinger og udbetalinger håndteres af Stripe. Vi ser ikke dine fulde kortoplysninger.
- **Teknik:** IP-adresse, browser og enhed, som bruges til at drive siden sikkert.

## 3. Hvorfor vi behandler dem

- **At oprette og drive din konto** — for at opfylde aftalen med dig (GDPR art. 6, stk. 1, litra b).
- **At gennemføre køb, betaling og fragt** — for at opfylde aftalen (litra b).
- **Køberbeskyttelse og behandling af sager** — for at opfylde aftalen og ud fra vores legitime interesse i sikker handel (litra b og f).
- **At forebygge svindel og misbrug** — ud fra vores legitime interesse (litra f).
- **Bogføring af handler** — fordi bogføringsloven kræver det (litra c).
- **Nyhedsbreve, hvis du har sagt ja** — ud fra dit samtykke (litra a).

## 4. Hvem vi deler oplysninger med

Vi sælger aldrig dine oplysninger. Vi deler dem kun, når det er nødvendigt for at drive Fairway:

- **Den anden part i en handel** får de oplysninger, der skal bruges til at gennemføre den. Sælger får fx købers navn og leveringsadresse.
- **Sharetribe**, som leverer den teknologi, Fairway er bygget på, og opbevarer data på vores vegne som databehandler.
- **Stripe**, som håndterer betalinger og udbetalinger og foretager den identitetskontrol, loven kræver af sælgere. Stripe er selvstændigt dataansvarlig for den del.
- **Shipmondo og fragtfirmaet**, som skal bruge navn og adresse til fragtlabel og levering.
- **Myndigheder**, hvis vi er forpligtet til det efter loven.

Nogle af vores leverandører kan behandle oplysninger uden for EU. Det sker kun med de garantier, databeskyttelsesreglerne kræver, fx EU-Kommissionens standardkontrakter.

## 5. Hvor længe vi gemmer dem

- Kontooplysninger gemmer vi, så længe du har en konto. Lukker du den, sletter vi dem inden for [30] dage, medmindre vi skal gemme dem af en af grundene nedenfor.
- Oplysninger om handler gemmer vi i fem år efter udgangen af regnskabsåret, som bogføringsloven kræver.
- Oplysninger i en uafsluttet sag gemmer vi, til sagen er afgjort.

## 6. Dine rettigheder

Du har ret til at:

- få indsigt i de oplysninger, vi har om dig
- få forkerte oplysninger rettet
- få dine oplysninger slettet
- få begrænset behandlingen
- få dine oplysninger udleveret i et almindeligt format (dataportabilitet)
- gøre indsigelse mod behandling, der sker på grundlag af legitim interesse
- trække et samtykke tilbage når som helst

Skriv til [e-mail], hvis du vil bruge dine rettigheder. Du kan klage til Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby, datatilsynet.dk.

## 7. Cookies

Fairway bruger kun de cookies, der er nødvendige for, at siden virker, fx for at holde dig logget ind og huske din kurv. De kræver ikke samtykke. Tager vi statistik- eller marketingcookies i brug, spørger vi dig først.

## 8. Ændringer

Vi opdaterer politikken, når vi ændrer, hvordan vi behandler oplysninger. Væsentlige ændringer får du besked om på e-mail.
`;

export const fairwayPrivacySections = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'privacy',
      appearance: { fieldType: 'customAppearance', backgroundColor: '#ffffff' },
      title: { fieldType: 'heading1', content: 'Privatlivspolitik' },
      blocks: [
        {
          blockType: 'defaultBlock',
          blockId: 'privacy-content',
          text: {
            fieldType: 'markdown',
            content: PRIVACY,
          },
        },
      ],
    },
  ],
  meta: {
    pageTitle: {
      fieldType: 'metaTitle',
      content: 'Privatlivspolitik | Fairway',
    },
    pageDescription: {
      fieldType: 'metaDescription',
      content:
        'Sådan behandler Fairway dine personoplysninger, når du køber og sælger brugt golfudstyr.',
    },
  },
};
