import { expect, test } from "vitest";
import { otpSupabaseTemplate } from "./otp.js";

test("il segnaposto {{ .Token }} resta intatto nel blocco codice", () => {
  const { html } = otpSupabaseTemplate();
  expect(html).toContain('class="k-code" style="margin:0;font-size:44px;line-height:1;font-weight:500;letter-spacing:.22em;color:#16181c;font-variant-numeric:tabular-nums;">{{ .Token }}</p>');
  expect((html.match(/\{\{ \.Token \}\}/g) ?? []).length).toBe(1);
});

test("subject e contenuti dell'email OTP di riferimento", () => {
  const { subject, html } = otpSupabaseTemplate();
  expect(subject).toBe("Il tuo codice per entrare in Keshi");
  expect(html).toContain(">Il tuo codice per entrare</h1>");
  expect(html).toContain("Inseriscilo nella pagina di accesso di Keshi. Vale dieci minuti e si usa una volta sola.");
  expect(html).toContain(">Scade tra 10 minuti</p>");
  expect(html).toContain("Se non hai richiesto tu l&#39;accesso, ignora questa email: senza il codice nessuno può entrare.");
  expect(html).toContain("Comunicazione automatica relativa al tuo accesso.");
  expect(html).toContain("Keshi è un marchio di Headformula S.r.l., P.IVA 14573160968");
});

test("nessun eyebrow 'Accesso' sopra il titolo, nessun oro", () => {
  const { html } = otpSupabaseTemplate();
  expect(html).not.toContain(">Accesso<");
  expect(html).not.toContain("#c8922e");
});

test("con brand.product il subject e l'intro nominano il prodotto", () => {
  const { subject, html } = otpSupabaseTemplate({ product: "keshi catalog" });
  expect(subject).toBe("Il tuo codice per entrare in keshi catalog");
  expect(html).toContain("Inseriscilo nella pagina di accesso di keshi catalog.");
  expect(html).toContain(">keshi catalog</span>");
});
