export type CliArgs = {
    command: "supabase-sync";
    projectRef: string;
    product: string | undefined;
    dryRun: boolean;
} | {
    command: "preview";
    out: string;
    product: string | undefined;
} | {
    command: "help";
} | {
    command: "error";
    message: string;
};
export declare const USO = "Uso:\n  keshi-mail supabase-sync --project-ref <ref> [--product \"keshi catalog\"] [--dry-run]\n      Scrive il template OTP Keshi in \"Confirm signup\" e \"Magic Link\" del progetto\n      Supabase e porta la scadenza del codice a 600 secondi.\n      Richiede SUPABASE_ACCESS_TOKEN nell'ambiente (Supabase \u2192 Account \u2192 Access Tokens).\n\n  keshi-mail preview --out <dir> [--product \"keshi catalog\"]\n      Scrive in <dir> gli HTML dei dieci template della tavola di design pi\u00F9\n      l'OTP Supabase e un index.html, da aprire nel browser.";
export declare function parseCliArgs(argv: string[]): CliArgs;
