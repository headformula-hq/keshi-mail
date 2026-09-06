import { otpSupabaseTemplate } from "./otp.js";
import type { KeshiMailBrand } from "./brand.js";

// Configurazione dei template di Supabase Auth via Management API.
// Il codice va in ENTRAMBI i template: Supabase usa "Confirm signup" per chi
// non è ancora registrato e "Magic Link" per chi lo è già. Modificarne uno
// solo significa mandare un link alla metà degli utenti.

export type AuthTemplatesPayload = {
  mailer_templates_confirmation_subject: string;
  mailer_templates_confirmation_content: string;
  mailer_templates_magic_link_subject: string;
  mailer_templates_magic_link_content: string;
  mailer_otp_exp: number;
};

export function buildAuthTemplatesPayload(
  brand?: Partial<KeshiMailBrand>,
  { otpExpSeconds = 600 }: { otpExpSeconds?: number } = {},
): AuthTemplatesPayload {
  const { subject, html } = otpSupabaseTemplate(brand);
  return {
    mailer_templates_confirmation_subject: subject,
    mailer_templates_confirmation_content: html,
    mailer_templates_magic_link_subject: subject,
    mailer_templates_magic_link_content: html,
    mailer_otp_exp: otpExpSeconds,
  };
}

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

// PATCH https://api.supabase.com/v1/projects/<ref>/config/auth con un
// personal access token (Supabase → Account → Access Tokens).
export async function syncSupabaseAuthTemplates(o: SyncSupabaseAuthTemplatesOpts): Promise<SyncSupabaseAuthTemplatesResult> {
  const payload = buildAuthTemplatesPayload(o.brand, { otpExpSeconds: o.otpExpSeconds });
  if (o.dryRun) return { ok: true, status: 0, payload };
  const fetchImpl = o.fetchImpl ?? fetch;
  const r = await fetchImpl(`https://api.supabase.com/v1/projects/${encodeURIComponent(o.projectRef)}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${o.accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const body = await r.text().catch(() => "");
  return { ok: r.ok, status: r.status, payload, body };
}
