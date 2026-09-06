export type EmailMessage = {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    attachments?: {
        filename: string;
        content: Uint8Array | string;
    }[];
};
export type SendEmailOpts = {
    apiKey?: string;
    from?: string;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
};
export type SendEmailResult = {
    ok: true;
    id?: string;
} | {
    ok: false;
    reason: "no_api_key" | "http" | "network";
    status?: number;
};
export declare const DEFAULT_FROM = "keshi <noreply@keshilabs.com>";
export declare function sendEmail(msg: EmailMessage, opts?: SendEmailOpts): Promise<SendEmailResult>;
