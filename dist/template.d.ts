import { type KeshiMailBrand } from "./brand.js";
export { DEFAULT_BRAND, type KeshiMailBrand } from "./brand.js";
export type EmailKeshiOpts = {
    heading: string;
    intro: string;
    paragraphs?: string[];
    facts?: Array<{
        label: string;
        value: string;
        accent?: boolean;
    }>;
    code?: {
        value: string;
        hint?: string;
    };
    cta?: {
        label: string;
        href: string;
    };
    nota?: string;
    footer?: string;
    variant?: "cliente" | "interna";
};
/** Dichiarazioni @font-face per Creato Display, solo se il brand indica dove sono i file (https). */
export declare function fontFace(baseUrl?: string): string;
export declare function emailKeshi(o: EmailKeshiOpts, brand?: Partial<KeshiMailBrand>): string;
