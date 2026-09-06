// Parsing puro degli argomenti del bin `keshi-mail`, separato dall'I/O per
// poterlo testare senza processo.

export type CliArgs =
  | { command: "supabase-sync"; projectRef: string; product: string | undefined; dryRun: boolean }
  | { command: "preview"; out: string; product: string | undefined }
  | { command: "help" }
  | { command: "error"; message: string };

export const USO = `Uso:
  keshi-mail supabase-sync --project-ref <ref> [--product "keshi catalog"] [--dry-run]
      Scrive il template OTP Keshi in "Confirm signup" e "Magic Link" del progetto
      Supabase e porta la scadenza del codice a 600 secondi.
      Richiede SUPABASE_ACCESS_TOKEN nell'ambiente (Supabase → Account → Access Tokens).

  keshi-mail preview --out <dir> [--product "keshi catalog"]
      Scrive in <dir> gli HTML dei dieci template della tavola di design più
      l'OTP Supabase e un index.html, da aprire nel browser.`;

const OPZIONI: Record<string, { conValore: string[]; flag: string[]; obbligatorie: string[] }> = {
  "supabase-sync": { conValore: ["--project-ref", "--product"], flag: ["--dry-run"], obbligatorie: ["--project-ref"] },
  preview: { conValore: ["--out", "--product"], flag: [], obbligatorie: ["--out"] },
};

export function parseCliArgs(argv: string[]): CliArgs {
  const [comando, ...resto] = argv;
  if (!comando || comando === "--help" || comando === "-h") return { command: "help" };
  const schema = OPZIONI[comando];
  if (!schema) return { command: "error", message: `Comando sconosciuto: ${comando}\n\n${USO}` };

  const valori: Record<string, string> = {};
  const flag = new Set<string>();
  for (let i = 0; i < resto.length; i++) {
    const a = resto[i]!;
    if (schema.flag.includes(a)) {
      flag.add(a);
    } else if (schema.conValore.includes(a)) {
      const v = resto[i + 1];
      if (v === undefined || v.startsWith("--")) return { command: "error", message: `L'opzione ${a} richiede un valore.` };
      valori[a] = v;
      i++;
    } else {
      return { command: "error", message: `Opzione sconosciuta: ${a}\n\n${USO}` };
    }
  }
  for (const o of schema.obbligatorie) {
    if (!valori[o]) return { command: "error", message: `Manca l'opzione obbligatoria ${o}.\n\n${USO}` };
  }

  if (comando === "supabase-sync") {
    return { command: "supabase-sync", projectRef: valori["--project-ref"]!, product: valori["--product"], dryRun: flag.has("--dry-run") };
  }
  return { command: "preview", out: valori["--out"]!, product: valori["--product"] };
}
