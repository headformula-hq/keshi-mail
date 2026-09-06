// Invio via Resend con fetch, come in keshi-app/keshi-live. Non lancia mai:
// ogni esito è nel valore di ritorno, così un'email persa non fa saltare la
// richiesta che l'ha originata.
// Mittente di default: "keshi" minuscolo, come il marchio.
export const DEFAULT_FROM = "keshi <noreply@keshilabs.com>";
export async function sendEmail(msg, opts = {}) {
    const key = opts.apiKey ?? process.env.RESEND_API_KEY;
    const destinatari = [msg.to].flat().join(", ");
    if (!key) {
        console.info(`[email:noop] → ${destinatari} · ${msg.subject}`);
        return { ok: false, reason: "no_api_key" };
    }
    const from = msg.from ?? opts.from ?? process.env.EMAIL_FROM ?? DEFAULT_FROM;
    const fetchImpl = opts.fetchImpl ?? fetch;
    try {
        const r = await fetchImpl("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                from,
                to: msg.to,
                subject: msg.subject,
                html: msg.html,
                ...(msg.attachments
                    ? { attachments: msg.attachments.map((a) => ({ filename: a.filename, content: base64(a.content) })) }
                    : {}),
            }),
            signal: AbortSignal.timeout(opts.timeoutMs ?? 8000),
        });
        if (!r.ok) {
            console.error("[email] Resend", r.status, await r.text().catch(() => ""));
            return { ok: false, reason: "http", status: r.status };
        }
        const id = await r
            .json()
            .then((j) => (j && typeof j === "object" && typeof j.id === "string" ? j.id : undefined))
            .catch(() => undefined);
        return id ? { ok: true, id } : { ok: true };
    }
    catch (e) {
        console.error("[email] errore", e);
        return { ok: false, reason: "network" };
    }
}
function base64(c) {
    return (typeof c === "string" ? Buffer.from(c) : Buffer.from(c)).toString("base64");
}
