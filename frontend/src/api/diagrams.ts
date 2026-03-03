/**
 * Diagram and export API client.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export interface DiagramListItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Diagram {
  id: string;
  title: string;
  mmd_content: string;
  created_at: string;
  updated_at: string;
}

export async function listDiagrams(): Promise<DiagramListItem[]> {
  const r = await fetch(`${API_BASE}/api/diagrams`);
  if (!r.ok) throw new Error("Failed to list diagrams");
  return r.json();
}

export async function getDiagram(id: string): Promise<Diagram> {
  const r = await fetch(`${API_BASE}/api/diagrams/${id}`);
  if (!r.ok) {
    if (r.status === 404) throw new Error("Diagram not found");
    throw new Error("Failed to load diagram");
  }
  return r.json();
}

export async function createDiagram(title: string, mmd_content: string): Promise<Diagram> {
  const r = await fetch(`${API_BASE}/api/diagrams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, mmd_content }),
  });
  if (!r.ok) throw new Error("Failed to create diagram");
  return r.json();
}

export async function updateDiagram(
  id: string,
  data: { title?: string; mmd_content?: string }
): Promise<Diagram> {
  const r = await fetch(`${API_BASE}/api/diagrams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    if (r.status === 404) throw new Error("Diagram not found");
    throw new Error("Failed to update diagram");
  }
  return r.json();
}

export async function deleteDiagram(id: string): Promise<void> {
  const r = await fetch(`${API_BASE}/api/diagrams/${id}`, { method: "DELETE" });
  if (!r.ok) {
    if (r.status === 404) throw new Error("Diagram not found");
    throw new Error("Failed to delete diagram");
  }
}

export async function exportPng(svg: string, scale: number = 2): Promise<Blob> {
  const r = await fetch(`${API_BASE}/api/export/png`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg, scale }),
  });
  if (!r.ok) throw new Error("Export PNG failed");
  return r.blob();
}

export async function exportPdf(svg: string): Promise<Blob> {
  const r = await fetch(`${API_BASE}/api/export/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg }),
  });
  if (!r.ok) throw new Error("Export PDF failed");
  return r.blob();
}
