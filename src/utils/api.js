export const API_BASE = import.meta.env.VITE_API_BASE || "https://badgerbite-api.onrender.com";

export async function apiGet(path, token) {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiPost(path, token, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiDelete(path, token) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  const text = await r.text();
  return text ? JSON.parse(text) : {};
}
