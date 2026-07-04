/**
 * Export SVG to PNG/PDF via backend.
 */

const API_BASE = "/api/export";

export async function exportPng(svg: string, scale: number = 2): Promise<Blob> {
  const resp = await fetch(`${API_BASE}/png`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg, scale }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Export failed" }));
    throw new Error(err.detail || "Export failed");
  }
  return resp.blob();
}

export async function exportPdf(svg: string): Promise<Blob> {
  const resp = await fetch(`${API_BASE}/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Export failed" }));
    throw new Error(err.detail || "Export failed");
  }
  return resp.blob();
}
