import { expect, test, vi } from "vitest";
import { buildAuthTemplatesPayload, syncSupabaseAuthTemplates } from "./supabase.js";

test("payload: le quattro chiavi dei template, uguali fra confirmation e magic link, otp 600", () => {
  const p = buildAuthTemplatesPayload();
  expect(Object.keys(p).sort()).toEqual([
    "mailer_otp_exp",
    "mailer_templates_confirmation_content",
    "mailer_templates_confirmation_subject",
    "mailer_templates_magic_link_content",
    "mailer_templates_magic_link_subject",
  ]);
  expect(p.mailer_templates_confirmation_subject).toBe("Il tuo codice per entrare in Keshi");
  expect(p.mailer_templates_magic_link_subject).toBe(p.mailer_templates_confirmation_subject);
  expect(p.mailer_templates_magic_link_content).toBe(p.mailer_templates_confirmation_content);
  expect(p.mailer_templates_confirmation_content).toContain("{{ .Token }}");
  expect(p.mailer_otp_exp).toBe(600);
});

test("payload: brand.product e scadenza personalizzata", () => {
  const p = buildAuthTemplatesPayload({ product: "keshi catalog" }, { otpExpSeconds: 900 });
  expect(p.mailer_templates_confirmation_subject).toBe("Il tuo codice per entrare in keshi catalog");
  expect(p.mailer_otp_exp).toBe(900);
});

test("sync: PATCH sulla Management API con Bearer e il payload", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
  const r = await syncSupabaseAuthTemplates({
    projectRef: "abcdefgh",
    accessToken: "sbp_token",
    brand: { product: "keshi catalog" },
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
  expect(url).toBe("https://api.supabase.com/v1/projects/abcdefgh/config/auth");
  expect(init.method).toBe("PATCH");
  expect((init.headers as Record<string, string>).Authorization).toBe("Bearer sbp_token");
  expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  expect(JSON.parse(init.body as string)).toEqual(buildAuthTemplatesPayload({ product: "keshi catalog" }));
  expect(r.ok).toBe(true);
  expect(r.status).toBe(200);
  expect(r.payload.mailer_otp_exp).toBe(600);
});

test("sync: risposta non ok → ok:false con status", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 401 }));
  const r = await syncSupabaseAuthTemplates({ projectRef: "x", accessToken: "t", fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(r.ok).toBe(false);
  expect(r.status).toBe(401);
});

test("sync: dryRun non chiama fetch e restituisce il payload", async () => {
  const fetchImpl = vi.fn();
  const r = await syncSupabaseAuthTemplates({ projectRef: "x", accessToken: "t", dryRun: true, fetchImpl: fetchImpl as unknown as typeof fetch });
  expect(fetchImpl).not.toHaveBeenCalled();
  expect(r).toEqual({ ok: true, status: 0, payload: buildAuthTemplatesPayload() });
});
