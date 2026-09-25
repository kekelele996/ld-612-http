import { mockData } from "../mocks/seedData";
import type { ReviewBatch } from "../types/ReviewBatch";
import type { ReviewBatchNote } from "../types/ReviewBatchNote";

const endpoint = "/api/review-batch";
const BATCH_STORAGE_KEY = "policy-diff.review-batches";
const NOTE_STORAGE_KEY = "policy-diff.review-batch-notes";

function readRows<T>(key: string, seed: T[]): T[] {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached) as T[];
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  const rows = JSON.parse(JSON.stringify(seed)) as T[];
  writeRows(key, rows);
  return rows;
}

function writeRows<T>(key: string, rows: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    // Storage quota failures leave the in-memory state usable.
  }
}

export async function listReviewBatch(): Promise<ReviewBatch[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readRows(BATCH_STORAGE_KEY, mockData.reviewBatch as unknown as ReviewBatch[]);
}

export async function saveReviewBatch(payload: ReviewBatch) {
  console.info("save ReviewBatch", payload);
  const rows = await listReviewBatch();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeRows(BATCH_STORAGE_KEY, rows);
  return payload;
}

export async function listReviewBatchNote(): Promise<ReviewBatchNote[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(`${endpoint}/note`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readRows(NOTE_STORAGE_KEY, mockData.reviewBatchNote as unknown as ReviewBatchNote[]);
}

export async function saveReviewBatchNote(payload: ReviewBatchNote) {
  console.info("save ReviewBatchNote", payload);
  const rows = await listReviewBatchNote();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeRows(NOTE_STORAGE_KEY, rows);
  return payload;
}
