# keshi-mail

Il layout email condiviso delle app Keshi, come keshi-ui lo è per l'interfaccia
e keshi-auth per l'accesso. Un solo template HTML (stessa carta, stesso logo,
stessa riga legale) per tutte le email: codici di accesso, inviti, proposte,
firme, notifiche interne.

Zero dipendenze. Node ≥ 20. ESM.

## Cosa contiene

- `keshi-mail` (server-safe)
  - `emailKeshi(opts, brand?)` → HTML completo dell'email (sfondo bianco, nessuna card, colonna a tutta larghezza fino a 640px, logo
    Keshi come immagine, titolo, paragrafi, blocco codice, dati chiave,
    bottone, nota, piè di pagina legale). CSS responsive sotto i 620px, tema
    chiaro fisso.
  - `otpSupabaseTemplate(brand?)` → `{ subject, html }` del codice di accesso
    per Supabase Auth, con il segnaposto `{{ .Token }}` intatto.
  - `sendEmail(msg, opts?)` → invio via Resend. Non lancia mai: senza chiave
    logga e risponde `{ ok: false, reason: "no_api_key" }`.
  - `escapeHtml(s)`, `DEFAULT_BRAND`, tipi `EmailKeshiOpts`, `KeshiMailBrand`.
- `keshi-mail/supabase`
  - `buildAuthTemplatesPayload(brand?, { otpExpSeconds })` → oggetto per la
    Management API (template "Confirm signup" e "Magic Link" + scadenza OTP).
  - `syncSupabaseAuthTemplates({ projectRef, accessToken, brand?, dryRun? })`
    → esegue la PATCH.
- bin `keshi-mail`: `supabase-sync` e `preview` (vedi sotto).

## Installazione

```bash
npm i keshi-mail@github:headformula-hq/keshi-mail#v0.1.0
```

`dist/` è committato nel tag: le app installano senza compilare nulla.

## Setup in un'app — tre righe

```ts
import { emailKeshi, sendEmail } from "keshi-mail";

const html = emailKeshi({ heading: "Sei dentro, Marco.", intro: "Il tuo profilo è pronto.", cta: { label: "Vai al profilo", href: url } });
await sendEmail({ to: "marco@esempio.it", subject: "Il tuo profilo Keshi è pronto", html });
```

Variabili d'ambiente lette da `sendEmail`:

```
RESEND_API_KEY=re_...                       # senza: nessun invio, solo log (no-op sicuro)
EMAIL_FROM="keshi <noreply@keshilabs.com>"  # facoltativa, questo è il default
```

### Le opzioni di `emailKeshi`

```ts
type EmailKeshiOpts = {
  heading: string;                  // titolo (32px, peso 300; 24px nelle interne)
  intro: string;                    // primo paragrafo
  paragraphs?: string[];            // altri paragrafi
  facts?: { label: string; value: string; accent?: boolean }[]; // pannello dati chiave
  code?: { value: string; hint?: string };                      // pannello OTP
  cta?: { label: string; href: string };                        // bottone a pillola
  nota?: string;                    // testo piccolo con bordo superiore
  footer?: string;                  // riga di contesto sotto la riga legale
  variant?: "cliente" | "interna";  // "interna": pillola Interna, misure ridotte
};
```

Ogni contenuto dinamico è escapato: passa testo, non HTML.

## Template OTP su Supabase

Con l'accesso solo via codice non esiste un ripiego con password: se le email
non partono, nessuno entra. Il codice va in **entrambi** i template di
Supabase, perché usa "Confirm signup" per chi non è ancora registrato e
"Magic Link" per chi lo è già. `supabase-sync` li scrive tutti e due e porta la
scadenza del codice a 600 secondi, in un colpo solo:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx keshi-mail supabase-sync --project-ref <ref> [--product "keshi catalog"]
```

- `SUPABASE_ACCESS_TOKEN`: personal access token, da Supabase → menu account
  (in alto a destra) → **Access Tokens** → Generate new token. È un token
  personale, non la chiave del progetto: non va in `.env` dell'app.
- `<ref>`: il project ref, cioè il sottodominio di `https://<ref>.supabase.co`
  (lo trovi anche in Project Settings → General → Reference ID).
- `--dry-run` stampa il payload senza chiamare Supabase.

Dopo il sync, in Authentication → Email Templates vedrai il template Keshi in
"Confirm signup" e "Magic Link"; in Providers → Email, "Email OTP Expiration"
a 600.

### Checklist consegna email (Resend)

1. Supabase → Project Settings → Authentication → SMTP Settings: inserire le
   credenziali SMTP di Resend (host `smtp.resend.com`, utente `resend`,
   password = API key). L'SMTP integrato di Supabase consegna una manciata di
   email l'ora e non è utilizzabile in produzione.
2. Verificare il dominio mittente su Resend (SPF e DKIM).
3. Lanciare `keshi-mail supabase-sync` (sopra) o, a mano, incollare in
   entrambi i template l'HTML di `npx keshi-mail preview` → `otp-supabase.html`.
4. Per le email applicative (`sendEmail`): `RESEND_API_KEY` nell'ambiente
   dell'app.

## Vedere i template nel browser

```bash
npx keshi-mail preview --out ./anteprime [--product "keshi catalog"]
open ./anteprime/index.html
```

Scrive i dieci template della tavola di design (con dati di esempio) più l'OTP
Supabase.

## Cambiare brand e product

Il secondo argomento di `emailKeshi`, `otpSupabaseTemplate` e
`buildAuthTemplatesPayload` è un `Partial<KeshiMailBrand>`:

```ts
type KeshiMailBrand = {
  logoUrl: string;    // default: https://app.keshilabs.com/email/keshi-logo.png (il logo vero, sempre <img>)
  logoAlt: string;    // default: "Keshi"
  legalLine: string;  // default: "Keshi è un marchio di Headformula S.r.l., P.IVA 14573160968 · Via Morimondo 26, 20143 Milano (MI)"
  accent: string;     // default: "#2f6fcb" (blu Keshi); l'oro della tavola è "#c8922e"
  product?: string;   // es. "keshi catalog": reso come eyebrow a destra del logo e nel subject dell'OTP
};
```

```ts
emailKeshi(opts, { product: "keshi catalog" });          // eyebrow del prodotto accanto al logo
emailKeshi(opts, { accent: "#c8922e" });                 // valori in evidenza in oro
otpSupabaseTemplate({ product: "keshi catalog" });       // subject "Il tuo codice per entrare in keshi catalog"
```

Per non ripetere il brand a ogni chiamata, avvolgilo una volta nell'app:

```ts
// lib/email.ts
import { emailKeshi as base, type EmailKeshiOpts } from "keshi-mail";
export const BRAND = { product: "keshi catalog" };
export const emailKeshi = (o: EmailKeshiOpts) => base(o, BRAND);
```

## Aggiornare il modulo in un'app

```bash
rm -rf node_modules/keshi-mail
npm install keshi-mail@github:headformula-hq/keshi-mail#vX.Y.Z
node -p "require('./node_modules/keshi-mail/package.json').version"
```

Una dipendenza installata da un tag git non viene ri-risolta cambiando solo il
tag in `package.json`: npm risponde "up to date" e il lockfile resta al commit
vecchio. Va cancellata `node_modules/keshi-mail` prima di reinstallare.

## Rilasciare una nuova versione

```bash
# 1. Alza la versione SENZA che npm crei il tag: il tag deve arrivare dopo dist.
npm version minor --no-git-tag-version

# 2. Test, typecheck e build.
npm run release

# 3. Un solo commit con versione e dist insieme.
git add -A && git commit -m "chore: rilascio vX.Y.Z"

# 4. Tag ANNOTATO sul commit che contiene dist, e push esplicito del tag:
#    `--follow-tags` ignora i tag leggeri e li lascia indietro in silenzio.
git tag -a vX.Y.Z -m "keshi-mail vX.Y.Z"
git push && git push origin vX.Y.Z
```

`patch` per correzioni, `minor` per funzionalità compatibili, `major` se cambia
il markup in modo che le app debbano adeguarsi.

## Origine

Design: tavola "Email Keshi" (Claude Design, 6 settembre 2026). Implementazione
di riferimento: `lib/email/template.ts` di keshi-app, portata qui senza cambi
di markup; keshi-app la adotta con un import in più.

Licenza MIT · Headformula S.r.l.
