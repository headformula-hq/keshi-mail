import { escapeHtml } from "./escape.js";
import { risolviBrand, type KeshiMailBrand } from "./brand.js";

export { DEFAULT_BRAND, type KeshiMailBrand } from "./brand.js";

// Porting fedele del template di riferimento (docs/research/2026-09-06-email-keshi/
// template.ts): stesso markup, stessi valori. Cambiano solo le dipendenze:
// il brand (logo, riga legale, accento, prodotto) arriva come parametro invece
// che da FORNITORE.

const SANS = "'Creato Display','Figtree',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#16181c";
const MUTED = "#757c86";
const BODY = "#4b5158";
const LINE = "#e6e9ed";
const PANEL = "#f2f3f5";
const BG = "#ffffff"; // sfondo pagina bianco: nessuna card, contenuto a tutta larghezza (decisione di Luca, 6 set 2026)

export type EmailKeshiOpts = {
  eyebrow?: string;
  heading: string;
  intro: string;
  paragraphs?: string[];
  facts?: Array<{ label: string; value: string; accent?: boolean }>;
  code?: { value: string; hint?: string };
  cta?: { label: string; href: string };
  nota?: string;
  footer?: string;
  variant?: "cliente" | "interna";
};

export function emailKeshi(o: EmailKeshiOpts, brand?: Partial<KeshiMailBrand>): string {
  const b = risolviBrand(brand);
  const interna = o.variant === "interna";
  const p = (t: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BODY};">${escapeHtml(t)}</p>`;
  const body = [o.intro, ...(o.paragraphs ?? [])].map(p).join("");

  const eyebrow = o.eyebrow
    ? `<div style="font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${interna ? MUTED : b.accent};margin-bottom:14px;">${escapeHtml(o.eyebrow)}</div>`
    : "";

  const code = o.code
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;"><tr><td align="center" style="background-color:${PANEL};border-radius:18px;padding:26px 24px;">
<p class="k-code" style="margin:0;font-size:44px;line-height:1;font-weight:500;letter-spacing:.22em;color:${INK};font-variant-numeric:tabular-nums;">${escapeHtml(o.code.value)}</p>
${o.code.hint ? `<p style="margin:12px 0 0;font-size:13px;color:${MUTED};">${escapeHtml(o.code.hint)}</p>` : ""}</td></tr></table>`
    : "";

  const facts = o.facts?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0;background-color:${PANEL};border-radius:18px;"><tr><td style="padding:6px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${o.facts
        .map((f, i, a) => `<tr>
<td style="padding:14px 0;font-size:14px;color:${MUTED};border-bottom:1px solid ${i === a.length - 1 ? "transparent" : LINE};">${escapeHtml(f.label)}</td>
<td align="right" style="padding:14px 0;font-size:15px;font-weight:500;color:${f.accent ? b.accent : INK};border-bottom:1px solid ${i === a.length - 1 ? "transparent" : LINE};">${escapeHtml(f.value)}</td></tr>`)
        .join("")}</table></td></tr></table>`
    : "";

  const cta = o.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;"><tr><td style="border-radius:999px;background-color:${INK};"><a href="${escapeHtml(o.cta.href)}" style="display:inline-block;padding:16px 30px;font-family:${SANS};font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">${escapeHtml(o.cta.label)}</a></td></tr></table>`
    : "";

  const nota = o.nota
    ? `<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${LINE};font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(o.nota)}</p>`
    : "";

  // Cella a destra del logo: eyebrow del prodotto (se c'è) e pillola "Interna"
  // (nelle notifiche interne), sulla stessa riga.
  const prodotto = b.product
    ? `<span style="display:inline-block;font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${MUTED};">${escapeHtml(b.product)}</span>`
    : "";
  const pillola = interna
    ? `<span style="display:inline-block;font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};border:1px solid ${LINE};border-radius:999px;padding:5px 10px;">Interna</span>`
    : "";
  const tag = prodotto || pillola
    ? `<td align="right" style="vertical-align:middle;">${prodotto}${prodotto && pillola ? `<span style="display:inline-block;width:12px;"></span>` : ""}${pillola}</td>`
    : "";

  const footer = o.footer ?? (interna ? "Notifica interna Keshi." : "Comunicazione automatica relativa alla tua offerta.");

  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light">
<style>@media only screen and (max-width:620px){.k-wrap{padding:8px 0!important}.k-pad{padding-left:24px!important;padding-right:24px!important}.k-h1{font-size:27px!important}.k-code{font-size:36px!important;letter-spacing:.16em!important}}</style></head>
<body style="margin:0;padding:0;background-color:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};"><tr><td align="center" class="k-wrap" style="padding:16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="k-card" style="width:100%;max-width:640px;margin:0 auto;background-color:${BG};font-family:${SANS};color:${INK};">
<tr><td class="k-pad" style="padding:${interna ? 32 : 40}px 48px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;"><img src="${escapeHtml(b.logoUrl)}" alt="${escapeHtml(b.logoAlt)}" height="20" style="height:20px;width:auto;display:block;border:0;"></td>${tag}</tr></table></td></tr>
<tr><td class="k-pad" style="padding:${interna ? 28 : 40}px 48px 40px;">${eyebrow}<h1 class="k-h1" style="margin:0 0 20px;font-size:${interna ? 24 : 32}px;line-height:1.12;letter-spacing:-.02em;font-weight:300;color:${INK};">${escapeHtml(o.heading)}</h1>${body}${code}${facts}${cta}${nota}</td></tr>
<tr><td class="k-pad" style="padding:0 48px 36px;"><div style="height:1px;background:${LINE};margin-bottom:20px;"></div>
<p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(b.legalLine)}</p>
<p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#9aa1ab;">${escapeHtml(footer)}</p></td></tr>
</table></td></tr></table></body></html>`;
}
