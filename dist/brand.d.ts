export type KeshiMailBrand = {
    logoUrl: string;
    logoAlt: string;
    legalLine: string;
    accent: string;
    product?: string;
    /** Base URL https dove sono serviti i file Creato Display (.otf). Se presente, l'email dichiara @font-face: i client che supportano i web font (Apple Mail, iOS Mail) mostrano il carattere vero, gli altri cadono sul sistema. */
    fontBaseUrl?: string;
};
export declare const DEFAULT_BRAND: KeshiMailBrand;
export declare function risolviBrand(brand?: Partial<KeshiMailBrand>): KeshiMailBrand;
