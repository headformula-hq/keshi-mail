import { otpSupabaseTemplate } from "./otp.js";
export function buildAuthTemplatesPayload(brand, { otpExpSeconds = 600 } = {}) {
    const { subject, html } = otpSupabaseTemplate(brand);
    return {
        mailer_templates_confirmation_subject: subject,
        mailer_templates_confirmation_content: html,
        mailer_templates_magic_link_subject: subject,
        mailer_templates_magic_link_content: html,
        mailer_otp_exp: otpExpSeconds,
    };
}
// PATCH https://api.supabase.com/v1/projects/<ref>/config/auth con un
// personal access token (Supabase → Account → Access Tokens).
export async function syncSupabaseAuthTemplates(o) {
    const payload = buildAuthTemplatesPayload(o.brand, { otpExpSeconds: o.otpExpSeconds });
    if (o.dryRun)
        return { ok: true, status: 0, payload };
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
