import { expect, test } from "vitest";
import { DEFAULT_BRAND, emailKeshi, fontFace } from "./template.js";

const base = { heading: "Ciao", intro: "Testo" };

test("il brand di default è Keshi con accento blu e riga legale Headformula", () => {
  expect(DEFAULT_BRAND.logoUrl).toBe("https://app.keshilabs.com/email/keshi-logo.png");
  expect(DEFAULT_BRAND.logoAlt).toBe("Keshi");
  expect(DEFAULT_BRAND.accent).toBe("#2f6fcb");
  expect(DEFAULT_BRAND.legalLine).toBe(
    "Keshi è un marchio di Headformula S.r.l., P.IVA 14573160968 · Via Morimondo 26, 20143 Milano (MI)",
  );
  expect(DEFAULT_BRAND.product).toBeUndefined();
});

test("porta la riga legale, il logo Keshi come immagine, mai la parola Keshilabs in chiaro", () => {
  const html = emailKeshi(base);
  expect(html).toContain("Keshi è un marchio di Headformula S.r.l., P.IVA 14573160968 · Via Morimondo 26, 20143 Milano (MI)");
  expect(html).toContain('<img src="https://app.keshilabs.com/email/keshi-logo.png" alt="Keshi" height="20"');
  // Il dominio dell'asset è l'unico "keshilabs" ammesso.
  expect(html.replaceAll("https://app.keshilabs.com", "")).not.toMatch(/keshilabs/i);
});

test("documento completo: doctype, lang it, color-scheme light, CSS responsive, sfondo pagina", () => {
  const html = emailKeshi(base);
  expect(html.startsWith("<!doctype html><html lang=\"it\">")).toBe(true);
  expect(html).toContain('<meta name="color-scheme" content="light">');
  expect(html).toContain("@media only screen and (max-width:620px)");
  expect(html).toContain(".k-code{font-size:36px!important;letter-spacing:.16em!important}");
  expect(html).toContain('background-color:#ffffff;');
  expect(html).not.toContain('#e9eaed');
  expect(html).toContain("max-width:640px");
  expect(html).not.toMatch(/class="k-card"[^>]*border-radius/);
});

test("variante cliente: padding 40/48, titolo 32px peso 300, eyebrow in blu, senza pillola", () => {
  const html = emailKeshi({ ...base, eyebrow: "Accesso" });
  expect(html).toContain('style="padding:40px 48px 0;"');
  expect(html).toContain('style="padding:40px 48px 40px;"');
  expect(html).toContain("font-size:32px;line-height:1.12;letter-spacing:-.02em;font-weight:300;");
  expect(html).toContain("text-transform:uppercase;color:#2f6fcb;margin-bottom:14px;\">Accesso</div>");
  expect(html).not.toContain(">Interna</span>");
  expect(html).toContain("Comunicazione automatica relativa alla tua offerta.");
});

test("i blocchi opzionali sono assenti se non richiesti", () => {
  const html = emailKeshi(base);
  expect(html).not.toContain('class="k-code"');
  expect(html).not.toContain("<a href=");
  expect(html).not.toContain("border-top:1px solid");
  expect(html).not.toContain("letter-spacing:.12em"); // nessun eyebrow
  expect(html).toContain(">Ciao</h1>");
  expect(html).toContain(">Testo</p>");
});

test("paragrafi aggiuntivi, blocco codice con hint, nota", () => {
  const html = emailKeshi({
    ...base,
    paragraphs: ["Secondo", "Terzo"],
    code: { value: "482913", hint: "Scade tra 10 minuti" },
    nota: "Se non sei stato tu, ignora.",
  });
  expect(html).toContain(">Secondo</p>");
  expect(html).toContain(">Terzo</p>");
  expect(html).toContain('class="k-code" style="margin:0;font-size:44px;line-height:1;font-weight:500;letter-spacing:.22em;color:#16181c;font-variant-numeric:tabular-nums;">482913</p>');
  expect(html).toContain("font-size:13px;color:#757c86;\">Scade tra 10 minuti</p>");
  expect(html).toContain("border-top:1px solid #e6e9ed;font-size:13px;line-height:1.6;color:#757c86;\">Se non sei stato tu, ignora.</p>");
});

test("blocco codice senza hint non rende il paragrafo dell'hint", () => {
  const html = emailKeshi({ ...base, code: { value: "123456" } });
  expect(html).toContain(">123456</p>");
  expect(html).not.toContain("margin:12px 0 0;font-size:13px");
});

test("facts: pannello, divisori tranne l'ultimo, valore in evidenza col colore d'accento", () => {
  const html = emailKeshi({
    ...base,
    facts: [
      { label: "Offerta", value: "K-2026-014" },
      { label: "Canone", value: "1.200 € + IVA", accent: true },
    ],
  });
  expect(html).toContain("background-color:#f2f3f5;border-radius:18px;");
  expect(html).toContain('border-bottom:1px solid #e6e9ed;">Offerta</td>');
  expect(html).toContain('color:#16181c;border-bottom:1px solid #e6e9ed;">K-2026-014</td>');
  expect(html).toContain('border-bottom:1px solid transparent;">Canone</td>');
  expect(html).toContain('color:#2f6fcb;border-bottom:1px solid transparent;">1.200 € + IVA</td>');
});

test("facts vuoto non rende il pannello", () => {
  const html = emailKeshi({ ...base, facts: [] });
  expect(html).not.toContain("background-color:#f2f3f5");
});

test("l'oro resta disponibile passando brand.accent", () => {
  const html = emailKeshi({ ...base, eyebrow: "Proposta", facts: [{ label: "A", value: "B", accent: true }] }, { accent: "#c8922e" });
  expect(html).toContain("color:#c8922e;margin-bottom:14px;\">Proposta</div>");
  expect(html).toContain('color:#c8922e;border-bottom:1px solid transparent;">B</td>');
  expect(html).not.toContain("#2f6fcb");
});

test("CTA a pillola con href e label escapati", () => {
  const html = emailKeshi({
    ...base,
    cta: { label: "Apri <ora>", href: "https://app.keshilabs.com/offerta/abc?x=1&y=2" },
  });
  expect(html).toContain('<td style="border-radius:999px;background-color:#16181c;"><a href="https://app.keshilabs.com/offerta/abc?x=1&amp;y=2"');
  expect(html).toContain("padding:16px 30px;");
  expect(html).toContain("font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;\">Apri &lt;ora&gt;</a>");
});

test("escapa heading, intro, paragrafi, facts, code, nota, footer, eyebrow", () => {
  const html = emailKeshi({
    eyebrow: "<e>",
    heading: "<b>x</b>",
    intro: "a & b",
    paragraphs: ["c > d"],
    facts: [{ label: "<l>", value: "\"v\"" }],
    code: { value: "<c>", hint: "'h'" },
    nota: "<n>",
    footer: "<f>",
  });
  expect(html).toContain("&lt;e&gt;");
  expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
  expect(html).toContain("a &amp; b");
  expect(html).toContain("c &gt; d");
  expect(html).toContain("&lt;l&gt;");
  expect(html).toContain("&quot;v&quot;");
  expect(html).toContain("&lt;c&gt;");
  expect(html).toContain("&#39;h&#39;");
  expect(html).toContain("&lt;n&gt;");
  expect(html).toContain("&lt;f&gt;");
  expect(html).not.toContain("<b>x</b>");
  expect(html).not.toContain("<e>");
});

test("variante interna: pillola, padding 32/28, titolo 24px, eyebrow muted, footer interno", () => {
  const html = emailKeshi({ ...base, eyebrow: "Notifica interna", variant: "interna" });
  expect(html).toContain('<span style="display:inline-block;font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#757c86;border:1px solid #e6e9ed;border-radius:999px;padding:5px 10px;">Interna</span>');
  expect(html).toContain('style="padding:32px 48px 0;"');
  expect(html).toContain('style="padding:28px 48px 40px;"');
  expect(html).toContain("font-size:24px;line-height:1.12;");
  expect(html).toContain("text-transform:uppercase;color:#757c86;margin-bottom:14px;\">Notifica interna</div>");
  expect(html).toContain("Notifica interna Keshi.");
  expect(html).not.toContain("#2f6fcb");
});

test("footer personalizzato sostituisce la riga di contesto", () => {
  const html = emailKeshi({ ...base, footer: "Comunicazione automatica relativa al tuo accesso." });
  expect(html).toContain("Comunicazione automatica relativa al tuo accesso.");
  expect(html).not.toContain("relativa alla tua offerta");
});

test("brand.product: eyebrow a destra del logo, nella riga dell'intestazione", () => {
  const html = emailKeshi(base, { product: "keshi catalog" });
  expect(html).toContain('<td align="right" style="vertical-align:middle;">');
  expect(html).toContain('font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#757c86;">keshi catalog</span>');
  // Il product è nella riga dell'intestazione, prima dell'apertura del corpo.
  const testa = html.indexOf("keshi catalog");
  const corpo = html.indexOf("<h1");
  expect(testa).toBeGreaterThan(html.indexOf("keshi-logo.png"));
  expect(testa).toBeLessThan(corpo);
});

test("brand.product e variante interna convivono nella stessa cella a destra", () => {
  const html = emailKeshi({ ...base, variant: "interna" }, { product: "keshi <catalog>" });
  expect(html).toContain("keshi &lt;catalog&gt;</span>");
  const prodotto = html.indexOf("keshi &lt;catalog&gt;");
  const pillola = html.indexOf(">Interna</span>");
  expect(prodotto).toBeLessThan(pillola);
  expect((html.match(/<td align="right" style="vertical-align:middle;">/g) ?? []).length).toBe(1);
});

test("senza product né interna la riga dell'intestazione non ha la cella destra", () => {
  const html = emailKeshi(base);
  expect(html).not.toContain('<td align="right" style="vertical-align:middle;">');
});

test("brand personalizzato: logo, alt e riga legale (escapata)", () => {
  const html = emailKeshi(base, {
    logoUrl: "https://esempio.app/logo.png",
    logoAlt: "Esempio",
    legalLine: "Esempio è un marchio di Tizio & Caio S.r.l.",
  });
  expect(html).toContain('<img src="https://esempio.app/logo.png" alt="Esempio" height="20"');
  expect(html).toContain("Esempio è un marchio di Tizio &amp; Caio S.r.l.");
  expect(html).not.toContain("keshi-logo.png");
  expect(html).not.toContain("Headformula");
});

test("fontFace: senza fontBaseUrl non dichiara nessun @font-face", () => {
  expect(fontFace(undefined)).toBe("");
  expect(fontFace("ftp://x")).toBe("");
  expect(emailKeshi({ heading: "T", intro: "i" })).not.toContain("@font-face");
});

test("fontFace: con fontBaseUrl dichiara i quattro pesi di Creato Display senza doppio slash", () => {
  const css = fontFace("https://esempio.app/fonts/");
  expect(css.match(/@font-face/g)).toHaveLength(4);
  expect(css).toContain("url('https://esempio.app/fonts/CreatoDisplay-Light.otf') format('opentype');font-weight:300");
  expect(css).toContain("font-weight:700");
  expect(css).not.toContain("fonts//");
  const html = emailKeshi({ heading: "T", intro: "i" }, { fontBaseUrl: "https://esempio.app/fonts" });
  expect(html.indexOf("@font-face")).toBeLessThan(html.indexOf("@media only screen"));
});
