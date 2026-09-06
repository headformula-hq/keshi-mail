import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emailKeshi } from "./template.js";
import { otpSupabaseTemplate } from "./otp.js";
import { escapeHtml } from "./escape.js";
const APP = "https://app.keshilabs.com";
export const TEMPLATE_ESEMPIO = [
    {
        slug: "01-codice-di-accesso",
        titolo: "01 · Codice di accesso",
        subject: "Il tuo codice per entrare in Keshi",
        opts: {
            heading: "Il tuo codice per entrare",
            intro: "Inseriscilo nella pagina di accesso di Keshi. Vale dieci minuti e si usa una volta sola.",
            code: { value: "482913", hint: "Scade tra 10 minuti" },
            nota: "Se non hai richiesto tu l'accesso, ignora questa email: senza il codice nessuno può entrare.",
            footer: "Comunicazione automatica relativa al tuo accesso.",
        },
    },
    {
        slug: "02-invito",
        titolo: "02 · Invito",
        subject: "Crea il tuo profilo Keshi · Gioielleria Rossi",
        opts: {
            heading: "Ciao Marco, sei tra i primi di Gioielleria Rossi su Keshi",
            intro: "Un minuto, con Francesco al telefono: crei il profilo, confermi i dati della gioielleria e rispondi a poche domande.",
            cta: { label: "Crea il profilo", href: `${APP}/invito/esempio` },
            nota: "Il link vale 30 giorni e può usarlo anche un collega.",
        },
    },
    {
        slug: "03-profilo-creato",
        titolo: "03 · Profilo creato",
        subject: "Il tuo profilo Keshi è pronto",
        opts: {
            heading: "Sei dentro, Marco.",
            intro: "Il tuo profilo è collegato a Gioielleria Rossi. Ti avvisiamo via email e SMS appena la proposta è pronta.",
            cta: { label: "Vai al tuo profilo", href: `${APP}/app` },
            nota: "Keshi è un marchio di Headformula S.r.l.",
        },
    },
    {
        slug: "04-proposta-pronta",
        titolo: "04 · Proposta pronta",
        subject: "La tua proposta Keshi · Gioielleria Rossi",
        opts: {
            heading: "Una proposta per Gioielleria Rossi",
            intro: "Ciao Marco, ecco l'offerta di cui abbiamo parlato.",
            facts: [
                { label: "Canone mensile", value: "1.200 € + IVA", accent: true },
                { label: "Durata", value: "12 mesi" },
                { label: "Decorrenza", value: "1 ottobre 2026" },
                { label: "Valida fino al", value: "20 settembre 2026" },
            ],
            paragraphs: ["Entri con il tuo profilo, scegli come pagare e firmi dal telefono con un codice via SMS."],
            cta: { label: "Apri la proposta", href: `${APP}/offerta/esempio` },
            nota: "Il contratto è con Headformula S.r.l., titolare del marchio Keshi.",
        },
    },
    {
        slug: "05-firma-richiesta",
        titolo: "05 · Firma richiesta",
        subject: "Contratto Keshi da firmare · Gioielleria Rossi",
        opts: {
            heading: "Anna, c'è un contratto da firmare per Gioielleria Rossi",
            intro: "Un collega ha completato la proposta Keshi e ti ha indicato come firmataria. La firma richiede un codice via SMS.",
            cta: { label: "Firma il contratto", href: `${APP}/firma/esempio` },
            nota: "Il contratto è con Headformula S.r.l., titolare del marchio Keshi.",
        },
    },
    {
        slug: "06-firma-ricevuta",
        titolo: "06 · Firma ricevuta",
        subject: "Firma ricevuta · offerta K-2026-014",
        opts: {
            heading: "Grazie, Marco",
            intro: "Abbiamo registrato la tua firma. Manca solo la controfirma di Headformula: di norma entro un giorno lavorativo.",
            facts: [
                { label: "Offerta", value: "K-2026-014" },
                { label: "Firmata il", value: "6 settembre 2026, 15:42" },
                { label: "Opzione", value: "Mensile", accent: true },
            ],
            paragraphs: ["Quando sarà completata riceverai il PDF firmato da entrambe le parti e l'audit trail."],
        },
    },
    {
        slug: "07-contratto-firmato",
        titolo: "07 · Contratto firmato",
        subject: "Benvenuto in Keshi · contratto firmato",
        opts: {
            heading: "Benvenuto in Keshi, Marco",
            intro: "Il contratto è firmato da entrambe le parti. In allegato la copia firmata e l'audit trail.",
            facts: [
                { label: "Contratto", value: "K-2026-014" },
                { label: "Decorrenza", value: "1 ottobre 2026", accent: true },
                { label: "Kickoff", value: "entro 2 giorni" },
            ],
            paragraphs: ["Prossimi passi: ti contattiamo per il kickoff e ti mandiamo il form per gli accessi (ads, analytics, e-commerce)."],
            nota: "Condizioni e DPA sono richiamati nel contratto per versione, URL e impronta SHA-256.",
        },
    },
    {
        slug: "08-controfirma-richiesta",
        titolo: "08 · Controfirma richiesta (interna)",
        subject: "Controfirma richiesta · K-2026-014 · Gioielleria Rossi",
        opts: {
            variant: "interna",
            heading: "Controfirma richiesta",
            intro: "Gioielleria Rossi ha firmato l'offerta K-2026-014 (Mensile, 1.200 € + IVA).",
            paragraphs: ["Apri il link per rivedere e controfirmare. Il link è personale."],
            cta: { label: "Apri e controfirma", href: `${APP}/admin/firma/esempio` },
        },
    },
    {
        slug: "09-offerta-scaduta",
        titolo: "09 · Offerta scaduta (interna)",
        subject: "Offerta scaduta · K-2026-014 · Gioielleria Rossi",
        opts: {
            variant: "interna",
            heading: "Offerta scaduta",
            intro: "L'offerta K-2026-014 per Gioielleria Rossi è scaduta il 20 settembre 2026 senza firma.",
            paragraphs: ["Dall'admin puoi rigenerarla con un nuovo numero e la stessa configurazione."],
            cta: { label: "Rigenera dall'admin", href: `${APP}/admin/offerte/esempio` },
        },
    },
    {
        slug: "10-correzione-richiesta",
        titolo: "10 · Correzione richiesta (interna)",
        subject: "Correzione richiesta · K-2026-014 · Gioielleria Rossi",
        opts: {
            variant: "interna",
            heading: "Correzione richiesta",
            intro: "Gioielleria Rossi (offerta K-2026-014) segnala una correzione ai dati caricati.",
            paragraphs: ["La partita IVA riportata è quella vecchia: la nuova è IT01234567890."],
            cta: { label: "Apri in admin", href: `${APP}/admin/offerte/esempio` },
            footer: "Notifica interna Keshi.",
        },
    },
];
// Scrive gli HTML in `out` (creata se manca) e restituisce i percorsi scritti.
export function writePreview({ out, product }) {
    const brand = product ? { product } : {};
    mkdirSync(out, { recursive: true });
    const voci = [];
    const scritti = [];
    for (const t of TEMPLATE_ESEMPIO) {
        const file = `${t.slug}.html`;
        writeFileSync(join(out, file), emailKeshi(t.opts, brand));
        voci.push({ file, titolo: t.titolo, subject: t.subject });
        scritti.push(join(out, file));
    }
    const otp = otpSupabaseTemplate(brand);
    writeFileSync(join(out, "otp-supabase.html"), otp.html);
    voci.push({ file: "otp-supabase.html", titolo: "OTP Supabase ({{ .Token }})", subject: otp.subject });
    scritti.push(join(out, "otp-supabase.html"));
    const indice = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Anteprime keshi-mail</title>
<style>body{font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;background:#e9eaed;color:#16181c;margin:0;padding:32px}main{max-width:600px;margin:0 auto;background:#fff;border-radius:18px;padding:32px 40px}h1{font-weight:300;font-size:28px;margin:0 0 20px}a{color:#2f6fcb;text-decoration:none}li{margin:0 0 10px}small{color:#757c86;display:block}</style></head>
<body><main><h1>Anteprime keshi-mail${product ? ` · ${escapeHtml(product)}` : ""}</h1><ol>${voci
        .map((v) => `<li><a href="${escapeHtml(v.file)}">${escapeHtml(v.titolo)}</a><small>${escapeHtml(v.subject)}</small></li>`)
        .join("")}</ol></main></body></html>`;
    writeFileSync(join(out, "index.html"), indice);
    scritti.push(join(out, "index.html"));
    return scritti;
}
