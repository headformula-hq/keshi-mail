import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import { TEMPLATE_ESEMPIO, writePreview } from "./preview.js";

let dir: string;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

test("la tavola di design ha 10 template: 7 cliente e 3 interne", () => {
  expect(TEMPLATE_ESEMPIO).toHaveLength(10);
  expect(TEMPLATE_ESEMPIO.filter((t) => t.opts.variant === "interna")).toHaveLength(3);
  expect(TEMPLATE_ESEMPIO[0]?.slug).toBe("01-codice-di-accesso");
  expect(TEMPLATE_ESEMPIO[0]?.opts.code).toBeDefined();
  expect(TEMPLATE_ESEMPIO[9]?.opts.footer).toBe("Notifica interna Keshi.");
});

test("preview scrive i 10 template, l'OTP e un indice", () => {
  dir = mkdtempSync(join(tmpdir(), "keshi-mail-"));
  const scritti = writePreview({ out: dir });
  expect(scritti).toHaveLength(12);
  const file = readdirSync(dir).sort();
  expect(file.filter((f) => f.endsWith(".html"))).toHaveLength(12);
  expect(file).toContain("01-codice-di-accesso.html");
  expect(file).toContain("10-correzione-richiesta.html");
  expect(file).toContain("otp-supabase.html");
  expect(file).toContain("index.html");
  expect(readFileSync(join(dir, "otp-supabase.html"), "utf8")).toContain("{{ .Token }}");
  expect(readFileSync(join(dir, "index.html"), "utf8")).toContain('href="01-codice-di-accesso.html"');
});

test("preview con product lo rende accanto al logo e crea la cartella se manca", () => {
  dir = mkdtempSync(join(tmpdir(), "keshi-mail-"));
  const out = join(dir, "sotto", "cartella");
  writePreview({ out, product: "keshi catalog" });
  expect(readFileSync(join(out, "02-invito.html"), "utf8")).toContain(">keshi catalog</span>");
});
