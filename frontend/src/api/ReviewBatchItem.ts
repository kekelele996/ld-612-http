import { mockData } from "../mocks/seedData";
import { readLocalRows, writeLocalRows } from "../hooks/useLocalStorageState";
import type { ReviewBatchItem } from "../types/ReviewBatchItem";

const endpoint = "/api/review-batch-item";
const storageKey = "policy-diff.reviewBatchItem";

export async function listReviewBatchItem(): Promise<ReviewBatchItem[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readLocalRows<ReviewBatchItem>(storageKey, mockData.reviewBatchItem as unknown as ReviewBatchItem[]);
}

export async function saveReviewBatchItem(payload: ReviewBatchItem) {
  const rows = await listReviewBatchItem();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeLocalRows(storageKey, rows);
  console.info("save ReviewBatchItem", payload);
  return payload;
}
