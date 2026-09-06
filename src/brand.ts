// Identità del mittente: logo, riga legale, colore d'accento e (facoltativo)
// nome del prodotto reso come eyebrow accanto al logo.
export type KeshiMailBrand = {
  logoUrl: string;
  logoAlt: string;
  legalLine: string;
  accent: string;
  product?: string;
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
};

export function risolviBrand(brand?: Partial<KeshiMailBrand>): KeshiMailBrand {
  return { ...DEFAULT_BRAND, ...(brand ?? {}) };
}
