export type KeshiMailBrand = {
    logoUrl: string;
    logoAlt: string;
    legalLine: string;
    accent: string;
    product?: string;
};
export declare const DEFAULT_BRAND: KeshiMailBrand;
export declare function risolviBrand(brand?: Partial<KeshiMailBrand>): KeshiMailBrand;
