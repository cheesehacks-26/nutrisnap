export const API_BASE = import.meta.env.VITE_API_BASE || "https://nutrisnap-api-e80e.onrender.com";
const TOKEN_KEY = "bb_token";

async function handleResponse(r) {
  if (r.ok) return;
  const text = await r.text();
  if (r.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
    const msg = (() => { try { const j = JSON.parse(text); return j.error || "Session expired. Please sign in again."; } catch { return "Session expired. Please sign in again."; } })();
    throw new Error(msg);
  }
  throw new Error(text || r.statusText);
}

export async function apiGet(path, token) {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) await handleResponse(r);
  return r.json();
}

export async function apiPost(path, token, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) await handleResponse(r);
  return r.json();
}

export async function apiDelete(path, token) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) await handleResponse(r);
  const text = await r.text();
  return text ? JSON.parse(text) : {};
}
