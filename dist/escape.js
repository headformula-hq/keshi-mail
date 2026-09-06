// Escaping HTML minimo per i contenuti dinamici delle email. Identico a
// lib/html-escape.ts di keshi-app, così il markup generato non cambia.
export function escapeHtml(s) {
    return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
