import { type KeshiMailBrand } from "./brand.js";
export { DEFAULT_BRAND, type KeshiMailBrand } from "./brand.js";
export type EmailKeshiOpts = {
    eyebrow?: string;
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
export declare function emailKeshi(o: EmailKeshiOpts, brand?: Partial<KeshiMailBrand>): string;
