import { emailKeshi } from "./template.js";
import { risolviBrand, type KeshiMailBrand } from "./brand.js";

// Template OTP per Supabase Auth ("Confirm signup" e "Magic Link"): il
// segnaposto {{ .Token }} non contiene caratteri speciali HTML, quindi passa
// intatto attraverso escapeHtml e Supabase lo sostituisce col codice.
export function otpSupabaseTemplate(brand?: Partial<KeshiMailBrand>): { subject: string; html: string } {
  const b = risolviBrand(brand);
  const prodotto = b.product ?? "Keshi";
  return {
    subject: `Il tuo codice per entrare in ${prodotto}`,
    html: emailKeshi(
      {
        eyebrow: "Accesso",
        heading: "Il tuo codice per entrare",
        intro: `Inseriscilo nella pagina di accesso di ${prodotto}. Vale dieci minuti e si usa una volta sola.`,
        code: { value: "{{ .Token }}", hint: "Scade tra 10 minuti" },
        nota: "Se non hai richiesto tu l'accesso, ignora questa email: senza il codice nessuno può entrare.",
        footer: "Comunicazione automatica relativa al tuo accesso.",
      },
      b,
    ),
  };
}
