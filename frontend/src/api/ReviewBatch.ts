import { mockData } from "../mocks/seedData";
import { readLocalRows, writeLocalRows } from "../hooks/useLocalStorageState";
import type { ReviewBatch } from "../types/ReviewBatch";

const endpoint = "/api/review-batch";
const storageKey = "policy-diff.reviewBatch";

export async function listReviewBatch(): Promise<ReviewBatch[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readLocalRows<ReviewBatch>(storageKey, mockData.reviewBatch as unknown as ReviewBatch[]);
}

export async function saveReviewBatch(payload: ReviewBatch) {
  const rows = await listReviewBatch();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeLocalRows(storageKey, rows);
  console.info("save ReviewBatch", payload);
  return payload;
}
