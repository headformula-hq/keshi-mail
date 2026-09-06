import { expect, test } from "vitest";
import { escapeHtml } from "./escape.js";

test("escapa i cinque caratteri speciali dell'HTML", () => {
  expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
    "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
  );
});

test("lascia intatti i testi normali e i segnaposto Supabase", () => {
  expect(escapeHtml("Ciao, come va?")).toBe("Ciao, come va?");
  expect(escapeHtml("{{ .Token }}")).toBe("{{ .Token }}");
});

test("tollera null e undefined restituendo stringa vuota", () => {
  expect(escapeHtml(null as unknown as string)).toBe("");
  expect(escapeHtml(undefined as unknown as string)).toBe("");
});
