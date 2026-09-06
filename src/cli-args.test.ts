import { expect, test } from "vitest";
import { parseCliArgs } from "./cli-args.js";

test("supabase-sync: project ref, product e dry-run", () => {
  expect(parseCliArgs(["supabase-sync", "--project-ref", "abc", "--product", "keshi catalog", "--dry-run"])).toEqual({
    command: "supabase-sync",
    projectRef: "abc",
    product: "keshi catalog",
    dryRun: true,
  });
  expect(parseCliArgs(["supabase-sync", "--project-ref", "abc"])).toEqual({
    command: "supabase-sync",
    projectRef: "abc",
    product: undefined,
    dryRun: false,
  });
});

test("supabase-sync senza --project-ref è un errore chiaro", () => {
  const r = parseCliArgs(["supabase-sync"]);
  expect(r.command).toBe("error");
  expect(r.command === "error" && r.message).toContain("--project-ref");
});

test("preview: cartella di uscita e product", () => {
  expect(parseCliArgs(["preview", "--out", "/tmp/anteprime", "--product", "keshi live"])).toEqual({
    command: "preview",
    out: "/tmp/anteprime",
    product: "keshi live",
  });
});

test("preview senza --out è un errore chiaro", () => {
  const r = parseCliArgs(["preview"]);
  expect(r.command).toBe("error");
  expect(r.command === "error" && r.message).toContain("--out");
});

test("opzione senza valore e opzione sconosciuta sono errori", () => {
  expect(parseCliArgs(["preview", "--out"]).command).toBe("error");
  expect(parseCliArgs(["preview", "--out", "x", "--boh"]).command).toBe("error");
});

test("nessun comando, --help o comando ignoto → help", () => {
  expect(parseCliArgs([])).toEqual({ command: "help" });
  expect(parseCliArgs(["--help"])).toEqual({ command: "help" });
  expect(parseCliArgs(["-h"])).toEqual({ command: "help" });
  expect(parseCliArgs(["boh"]).command).toBe("error");
});
