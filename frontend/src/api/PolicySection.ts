import { mockData } from "../mocks/seedData";
import { readLocalRows, writeLocalRows } from "../hooks/useLocalStorageState";
import type { PolicySection } from "../types/PolicySection";

const endpoint = "/api/policy-section";
const storageKey = "policy-diff.policySection";

export async function listPolicySection(): Promise<PolicySection[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readLocalRows<PolicySection>(storageKey, mockData.policySection as unknown as PolicySection[]);
}

export async function savePolicySection(payload: PolicySection) {
  const rows = await listPolicySection();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeLocalRows(storageKey, rows);
  console.info("save PolicySection", payload);
  return payload;
}
