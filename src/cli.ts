#!/usr/bin/env node
import { parseCliArgs, USO } from "./cli-args.js";
import { writePreview } from "./preview.js";
import { syncSupabaseAuthTemplates } from "./supabase.js";

// Bin `keshi-mail`: nessuna dipendenza, Node ≥ 20.

async function main(argv: string[]): Promise<number> {
  const args = parseCliArgs(argv);
  switch (args.command) {
    case "help":
      console.log(USO);
      return 0;
    case "error":
      console.error(args.message);
      return 2;
    case "preview": {
      const scritti = writePreview({ out: args.out, product: args.product });
      console.log(`Scritti ${scritti.length} file in ${args.out}. Apri ${scritti[scritti.length - 1]} nel browser.`);
      return 0;
    }
    case "supabase-sync": {
      const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
      if (!accessToken && !args.dryRun) {
        console.error(
          "Manca SUPABASE_ACCESS_TOKEN nell'ambiente.\nCrea un personal access token da Supabase → Account → Access Tokens e lancia:\n  SUPABASE_ACCESS_TOKEN=sbp_... keshi-mail supabase-sync --project-ref <ref>",
        );
        return 1;
      }
      const brand = args.product ? { product: args.product } : undefined;
      const r = await syncSupabaseAuthTemplates({ projectRef: args.projectRef, accessToken: accessToken ?? "", brand, dryRun: args.dryRun });
      if (args.dryRun) {
        console.log(`[dry-run] PATCH https://api.supabase.com/v1/projects/${args.projectRef}/config/auth`);
        console.log(JSON.stringify(r.payload, null, 2));
        return 0;
      }
      if (r.ok) {
        console.log(`Template OTP scritti su ${args.projectRef} (confirmation + magic link, scadenza ${r.payload.mailer_otp_exp}s). HTTP ${r.status}.`);
        return 0;
      }
      console.error(`Supabase ha risposto HTTP ${r.status}.${r.body ? `\n${r.body}` : ""}`);
      return 1;
    }
  }
}

main(process.argv.slice(2)).then(
  (codice) => process.exit(codice),
  (e) => {
    console.error("[keshi-mail] errore", e);
    process.exit(1);
  },
);
