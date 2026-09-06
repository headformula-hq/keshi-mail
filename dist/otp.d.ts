import { type KeshiMailBrand } from "./brand.js";
export declare function otpSupabaseTemplate(brand?: Partial<KeshiMailBrand>): {
    subject: string;
    html: string;
};
