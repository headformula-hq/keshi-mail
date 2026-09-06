import type { KeshiMailBrand } from "./brand.js";
export type AuthTemplatesPayload = {
    mailer_templates_confirmation_subject: string;
    mailer_templates_confirmation_content: string;
    mailer_templates_magic_link_subject: string;
    mailer_templates_magic_link_content: string;
    mailer_otp_exp: number;
};
export declare function buildAuthTemplatesPayload(brand?: Partial<KeshiMailBrand>, { otpExpSeconds }?: {
    otpExpSeconds?: number;
}): AuthTemplatesPayload;
export type SyncSupabaseAuthTemplatesOpts = {
    projectRef: string;
    accessToken: string;
    brand?: Partial<KeshiMailBrand>;
    otpExpSeconds?: number;
    fetchImpl?: typeof fetch;
    dryRun?: boolean;
};
export type SyncSupabaseAuthTemplatesResult = {
    ok: boolean;
    status: number;
    payload: AuthTemplatesPayload;
    body?: string;
};
export declare function syncSupabaseAuthTemplates(o: SyncSupabaseAuthTemplatesOpts): Promise<SyncSupabaseAuthTemplatesResult>;
