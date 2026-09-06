// Identità del mittente: logo, riga legale, colore d'accento e (facoltativo)
// nome del prodotto reso come eyebrow accanto al logo.
export type KeshiMailBrand = {
  logoUrl: string;
  logoAlt: string;
  legalLine: string;
  accent: string;
  product?: string;
  /** Base URL https dove sono serviti i file Creato Display (.otf). Se presente, l'email dichiara @font-face: i client che supportano i web font (Apple Mail, iOS Mail) mostrano il carattere vero, gli altri cadono sul sistema. */
  fontBaseUrl?: string;
  /** Peso del titolo (default 100, Creato Thin) e dei paragrafi (default 300, Creato Light): decisione di Luca del 6 set 2026, "meno spessi". */
  headingWeight?: number;
  bodyWeight?: number;
};

// Il logo è quello vero di Keshi (PNG servito da app.keshilabs.com): va sempre
// reso come <img>, mai come wordmark testuale. L'accento è il blu Keshi
// (decisione del 6 settembre 2026): l'oro #c8922e resta disponibile passando
// `brand.accent`.
export const DEFAULT_BRAND: KeshiMailBrand = {
  logoUrl: "https://app.keshilabs.com/email/keshi-logo.png",
  logoAlt: "Keshi",
  legalLine: "Keshi è un marchio di Headformula S.r.l., P.IVA 14573160968 · Via Morimondo 26, 20143 Milano (MI)",
  accent: "#2f6fcb",
  headingWeight: 100,
  bodyWeight: 300,
};

export function risolviBrand(brand?: Partial<KeshiMailBrand>): KeshiMailBrand {
  return { ...DEFAULT_BRAND, ...(brand ?? {}) };
}
