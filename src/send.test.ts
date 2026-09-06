import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { sendEmail } from "./send.js";

const msg = { to: "a@b.it", subject: "Prova", html: "<p>ciao</p>" };

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function risposta(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

test("senza chiave: nessuna fetch, log informativo e no_api_key", async () => {
  const fetchImpl = vi.fn();
  const r = await sendEmail(msg, { fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r).toEqual({ ok: false, reason: "no_api_key" });
  expect(fetchImpl).not.toHaveBeenCalled();
  expect(console.info).toHaveBeenCalledWith(expect.stringContaining("a@b.it"));
});

test("con chiave: POST a Resend con Bearer, JSON corretto e mittente di default", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(risposta(200, { id: "re_123" }));
  const r = await sendEmail(msg, { apiKey: "re_key", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r).toEqual({ ok: true, id: "re_123" });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
  expect(url).toBe("https://api.resend.com/emails");
  expect(init.method).toBe("POST");
  expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_key");
  expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  expect(init.signal).toBeInstanceOf(AbortSignal);
  expect(JSON.parse(init.body as string)).toEqual({
    from: "keshi <noreply@keshilabs.com>",
    to: "a@b.it",
    subject: "Prova",
    html: "<p>ciao</p>",
  });
});

test("la chiave arriva anche da RESEND_API_KEY e il mittente da EMAIL_FROM", async () => {
  process.env.RESEND_API_KEY = "re_env";
  process.env.EMAIL_FROM = "Tizio <t@esempio.it>";
  const fetchImpl = vi.fn().mockResolvedValue(risposta(200, { id: "x" }));
  await sendEmail(msg, { fetchImpl: fetchImpl as unknown as typeof fetch });
  const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
  expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_env");
  expect(JSON.parse(init.body as string).from).toBe("Tizio <t@esempio.it>");
});

test("precedenza del mittente: msg.from > opts.from > EMAIL_FROM", async () => {
  process.env.EMAIL_FROM = "env <e@x.it>";
  const fetchImpl = vi.fn().mockResolvedValue(risposta(200, {}));
  await sendEmail({ ...msg, from: "msg <m@x.it>" }, { apiKey: "k", from: "opts <o@x.it>", fetchImpl: fetchImpl as unknown as typeof fetch });
  await sendEmail(msg, { apiKey: "k", from: "opts <o@x.it>", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(JSON.parse((fetchImpl.mock.calls[0] as [string, RequestInit])[1].body as string).from).toBe("msg <m@x.it>");
  expect(JSON.parse((fetchImpl.mock.calls[1] as [string, RequestInit])[1].body as string).from).toBe("opts <o@x.it>");
});

test("risposta non ok: ok:false, reason http, status", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(risposta(422, { message: "invalid" }));
  const r = await sendEmail(msg, { apiKey: "k", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r).toEqual({ ok: false, reason: "http", status: 422 });
  expect(console.error).toHaveBeenCalled();
});

test("errore di rete o timeout: ok:false, reason network, mai throw", async () => {
  const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
  const r = await sendEmail(msg, { apiKey: "k", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r).toEqual({ ok: false, reason: "network" });
});

test("risposta ok senza JSON valido: ok:true senza id", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(new Response("non json", { status: 200 }));
  const r = await sendEmail(msg, { apiKey: "k", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r).toEqual({ ok: true });
});

test("allegati: contenuto codificato in base64 nel body", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(risposta(200, { id: "x" }));
  await sendEmail(
    { ...msg, attachments: [{ filename: "c.txt", content: new TextEncoder().encode("ciao") }] },
    { apiKey: "k", fetchImpl: fetchImpl as unknown as typeof fetch },
  );
  const body = JSON.parse((fetchImpl.mock.calls[0] as [string, RequestInit])[1].body as string);
  expect(body.attachments).toEqual([{ filename: "c.txt", content: "Y2lhbw==" }]);
});
